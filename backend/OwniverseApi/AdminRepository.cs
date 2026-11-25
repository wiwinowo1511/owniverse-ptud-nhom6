using Dapper;
using Npgsql;

sealed class AdminRepository(string connectionString)
{
    public async Task<string?> GetUserDeleteBlockReasonAsync(int userId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT "reason"
            FROM (
                SELECT 1 AS "priority", N'Tài khoản đã có đơn hàng; hãy khóa tài khoản thay vì xóa.' AS "reason"
                WHERE EXISTS (SELECT 1 FROM public.orders WHERE "userid"=@UserId)
                UNION ALL
                SELECT 2, N'Tài khoản được ghi nhận trong lịch sử xử lý đơn hàng; hãy khóa tài khoản thay vì xóa.'
                WHERE EXISTS (SELECT 1 FROM public.orderstatushistory WHERE "changedby"=@UserId)
                UNION ALL
                SELECT 3, N'Tài khoản có hoạt động cộng đồng hoặc thông báo liên quan; hãy khóa tài khoản thay vì xóa.'
                WHERE EXISTS (SELECT 1 FROM public.posts WHERE "authorid"=@UserId)
                   OR EXISTS (SELECT 1 FROM public.postlikes WHERE "userid"=@UserId)
                   OR EXISTS (SELECT 1 FROM public.postshares WHERE "userid"=@UserId)
                   OR EXISTS (SELECT 1 FROM public.comments WHERE "userid"=@UserId)
                   OR EXISTS (SELECT 1 FROM public.reports WHERE "reporterid"=@UserId OR "handledby"=@UserId)
                   OR EXISTS (SELECT 1 FROM public.notifications WHERE "userid"=@UserId OR "actorid"=@UserId)
            ) blockers
            ORDER BY "priority"
            LIMIT 1;
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return await connection.QuerySingleOrDefaultAsync<string>(new CommandDefinition(
            sql, new { UserId = userId }, cancellationToken: cancellationToken));
    }

    public async Task<List<AdminOrderRow>> GetOrdersAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT o."orderid" AS Id,
                   o."ordercode" AS Code,
                   u."fullname" AS Customer,
                   o."createdat",
                   COALESCE((SELECT SUM(oi."quantity") FROM public.orderitems oi WHERE oi."orderid" = o."orderid"), 0) AS Quantity,
                   o."totalamount" AS Total,
                   LOWER(COALESCE(p."paymentstatus", 'Pending')) AS PaymentStatus,
                   LOWER(o."orderstatus") AS Status
            FROM public.orders o
            INNER JOIN public.users u ON u."userid" = o."userid"
            LEFT JOIN LATERAL (
                SELECT "paymentstatus"
                FROM public.payments
                WHERE "orderid" = o."orderid"
                ORDER BY "createdat" DESC, "paymentid" DESC
                LIMIT 1
            ) p ON true
            ORDER BY o."createdat" DESC, o."orderid" DESC;
            """;

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        var rows = await connection.QueryAsync<AdminOrderRow>(
            new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToList();
    }

    public async Task<AdminOrderRow?> GetOrderAsync(int id, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT o."orderid" AS Id,
                   o."ordercode" AS Code,
                   u."fullname" AS Customer,
                   o."createdat",
                   COALESCE((SELECT SUM(oi."quantity") FROM public.orderitems oi WHERE oi."orderid" = o."orderid"), 0) AS Quantity,
                   o."totalamount" AS Total,
                   LOWER(COALESCE(p."paymentstatus", 'Pending')) AS PaymentStatus,
                   LOWER(o."orderstatus") AS Status
            FROM public.orders o
            INNER JOIN public.users u ON u."userid" = o."userid"
            LEFT JOIN LATERAL (
                SELECT "paymentstatus"
                FROM public.payments
                WHERE "orderid" = o."orderid"
                ORDER BY "createdat" DESC, "paymentid" DESC
                LIMIT 1
            ) p ON true
            WHERE o."orderid" = @Id;
            """;

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return await connection.QuerySingleOrDefaultAsync<AdminOrderRow>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken));
    }

    public async Task<bool> SetOrderStatusAsync(
        int id, string status, int changedBy, CancellationToken cancellationToken = default)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        try
        {
            var current = await connection.QuerySingleOrDefaultAsync<string>(
                new CommandDefinition(
                    "SELECT \"orderstatus\" FROM public.orders WHERE \"orderid\"=@Id",
                    new { Id = id }, transaction, cancellationToken: cancellationToken));
            if (current is null)
            {
                await transaction.RollbackAsync(cancellationToken);
                return false;
            }

            if (!string.Equals(current, status, StringComparison.OrdinalIgnoreCase))
            {
await connection.ExecuteAsync(new CommandDefinition(
                    "UPDATE public.orders SET \"orderstatus\"=@Status, \"updatedat\"=NOW() AT TIME ZONE 'UTC' WHERE \"orderid\"=@Id",
                    new { Id = id, Status = status }, transaction, cancellationToken: cancellationToken));
            await connection.ExecuteAsync(new CommandDefinition(
                    """
                    INSERT INTO public.orderstatushistory ("orderid", "status", "changedby", "note")
                    VALUES (@Id, @Status, @ChangedBy, 'Cập nhật từ trang quản trị');
                    """,
                    new { Id = id, Status = status, ChangedBy = changedBy }, transaction,
                    cancellationToken: cancellationToken));
            }

            await transaction.CommitAsync(cancellationToken);
            return true;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<List<AdminPromotionRow>> GetPromotionsAsync(
        string? q, string? status, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT c."couponid" AS Id,
                   c."code",
                   COALESCE(c."description", '') AS Name,
                   LOWER(c."discounttype") AS Type,
                   c."discountvalue" AS Value,
                   c."minorderamount" AS MinimumOrder,
                   c."usagelimit" AS UsageLimit,
                   TO_CHAR(c."startsat", 'YYYY-MM-DD') AS StartDate,
                   TO_CHAR(c."expiresat", 'YYYY-MM-DD') AS EndDate,
                   (SELECT COUNT(1) FROM public.orders o WHERE o."couponid" = c."couponid") AS Used,
                   CASE WHEN c."isactive" = false THEN 'draft'
                        WHEN c."startsat"::date > (NOW() AT TIME ZONE 'UTC' + INTERVAL '7 hours')::date THEN 'upcoming'
                        WHEN c."expiresat"::date < (NOW() AT TIME ZONE 'UTC' + INTERVAL '7 hours')::date THEN 'expired'
                        ELSE 'running' END AS Status,
                   CASE WHEN c."isactive" = true THEN 'publish' ELSE 'draft' END AS Release
            FROM public.coupons c
            WHERE (@Query IS NULL OR @Query = '' OR c."code" ILIKE '%' || @Query || '%'
                   OR COALESCE(c."description", '') ILIKE '%' || @Query || '%')
              AND (@Status IS NULL OR
                   CASE WHEN c."isactive" = false THEN 'draft'
                        WHEN c."startsat"::date > (NOW() AT TIME ZONE 'UTC' + INTERVAL '7 hours')::date THEN 'upcoming'
                        WHEN c."expiresat"::date < (NOW() AT TIME ZONE 'UTC' + INTERVAL '7 hours')::date THEN 'expired'
                        ELSE 'running' END = @Status)
            ORDER BY c."couponid" DESC;
            """;

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        var rows = await connection.QueryAsync<AdminPromotionRow>(new CommandDefinition(
            sql,
            new { Query = string.IsNullOrWhiteSpace(q) ? null : q.Trim(), Status = string.IsNullOrWhiteSpace(status) ? null : status.Trim().ToLowerInvariant() },
            cancellationToken: cancellationToken));
        return rows.ToList();
    }

    public async Task<int> CreatePromotionAsync(AdminPromotionWrite promotion, CancellationToken cancellationToken = default)
    {
        const string sql = """
            INSERT INTO public.coupons
                ("code", "description", "discounttype", "discountvalue", "minorderamount", "usagelimit",
                 "peruserlimit", "startsat", "expiresat", "isactive")
            VALUES
                (@Code, @Name, @DiscountType, @Value, @MinimumOrder, @UsageLimit,
                 1, @StartsAt, @ExpiresAt, @IsActive)
            RETURNING "couponid";
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return await connection.ExecuteScalarAsync<int>(new CommandDefinition(
            sql, promotion, cancellationToken: cancellationToken));
    }

    public async Task<bool> UpdatePromotionAsync(int id, AdminPromotionWrite promotion, CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE public.coupons
            SET "description"=@Name, "discounttype"=@DiscountType, "discountvalue"=@Value,
                "minorderamount"=@MinimumOrder, "usagelimit"=@UsageLimit,
                "startsat"=@StartsAt, "expiresat"=@ExpiresAt, "isactive"=@IsActive
            WHERE "couponid"=@Id;
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return await connection.ExecuteAsync(new CommandDefinition(
            sql, new
            {
                Id = id, promotion.Name, promotion.DiscountType, promotion.Value,
                promotion.MinimumOrder, promotion.UsageLimit, promotion.StartsAt,
                promotion.ExpiresAt, promotion.IsActive,
            }, cancellationToken: cancellationToken)) == 1;
    }

    public async Task<bool> DeletePromotionAsync(int id, CancellationToken cancellationToken = default)
    {
        const string sql = "DELETE FROM public.coupons WHERE \"couponid\"=@Id;";
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return await connection.ExecuteAsync(new CommandDefinition(
            sql, new { Id = id }, cancellationToken: cancellationToken)) == 1;
    }
}

sealed class AdminOrderRow
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Customer { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
    public string PaymentStatus { get; set; } = "pending";
    public string Status { get; set; } = "pending";
}

sealed class AdminPromotionRow
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public decimal Value { get; set; }
    public decimal MinimumOrder { get; set; }
    public int? UsageLimit { get; set; }
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
    public int Used { get; set; }
    public string Status { get; set; } = "";
    public string Release { get; set; } = "";
}

sealed class AdminPromotionWrite
{
    public string Code { get; init; } = "";
    public string Name { get; init; } = "";
    public string DiscountType { get; init; } = "";
    public decimal Value { get; init; }
    public decimal MinimumOrder { get; init; }
    public int? UsageLimit { get; init; }
    public DateTime StartsAt { get; init; }
    public DateTime ExpiresAt { get; init; }
    public bool IsActive { get; init; }
}
