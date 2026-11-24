using Dapper;
using Microsoft.Data.SqlClient;

sealed class AdminRepository(string connectionString)
{
    public async Task<string?> GetUserDeleteBlockReasonAsync(int userId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT TOP (1) Reason
            FROM (
                SELECT 1 AS Priority, N'Tài khoản đã có đơn hàng; hãy khóa tài khoản thay vì xóa.' AS Reason
                WHERE EXISTS (SELECT 1 FROM dbo.Orders WHERE UserId=@UserId)
                UNION ALL
                SELECT 2, N'Tài khoản được ghi nhận trong lịch sử xử lý đơn hàng; hãy khóa tài khoản thay vì xóa.'
                WHERE EXISTS (SELECT 1 FROM dbo.OrderStatusHistory WHERE ChangedBy=@UserId)
                UNION ALL
                SELECT 3, N'Tài khoản có hoạt động cộng đồng hoặc thông báo liên quan; hãy khóa tài khoản thay vì xóa.'
                WHERE EXISTS (SELECT 1 FROM dbo.Posts WHERE AuthorId=@UserId)
                   OR EXISTS (SELECT 1 FROM dbo.PostLikes WHERE UserId=@UserId)
                   OR EXISTS (SELECT 1 FROM dbo.PostShares WHERE UserId=@UserId)
                   OR EXISTS (SELECT 1 FROM dbo.Comments WHERE UserId=@UserId)
                   OR EXISTS (SELECT 1 FROM dbo.Reports WHERE ReporterId=@UserId OR HandledBy=@UserId)
                   OR EXISTS (SELECT 1 FROM dbo.Notifications WHERE UserId=@UserId OR ActorId=@UserId)
            ) blockers
            ORDER BY Priority;
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return await connection.QuerySingleOrDefaultAsync<string>(new CommandDefinition(
            sql, new { UserId = userId }, cancellationToken: cancellationToken));
    }

    public async Task<List<AdminOrderRow>> GetOrdersAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT o.OrderId AS Id,
                   o.OrderCode AS Code,
                   u.FullName AS Customer,
                   o.CreatedAt,
                   COALESCE((SELECT SUM(oi.Quantity) FROM dbo.OrderItems oi WHERE oi.OrderId = o.OrderId), 0) AS Quantity,
                   o.TotalAmount AS Total,
                   LOWER(COALESCE(p.PaymentStatus, 'Pending')) AS PaymentStatus,
                   LOWER(o.OrderStatus) AS Status
            FROM dbo.Orders o
            INNER JOIN dbo.Users u ON u.UserId = o.UserId
            OUTER APPLY (
                SELECT TOP (1) PaymentStatus
                FROM dbo.Payments
                WHERE OrderId = o.OrderId
                ORDER BY CreatedAt DESC, PaymentId DESC
            ) p
            ORDER BY o.CreatedAt DESC, o.OrderId DESC;
            """;

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        var rows = await connection.QueryAsync<AdminOrderRow>(
            new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToList();
    }

    public async Task<AdminOrderRow?> GetOrderAsync(int id, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT o.OrderId AS Id,
                   o.OrderCode AS Code,
                   u.FullName AS Customer,
                   o.CreatedAt,
                   COALESCE((SELECT SUM(oi.Quantity) FROM dbo.OrderItems oi WHERE oi.OrderId = o.OrderId), 0) AS Quantity,
                   o.TotalAmount AS Total,
                   LOWER(COALESCE(p.PaymentStatus, 'Pending')) AS PaymentStatus,
                   LOWER(o.OrderStatus) AS Status
            FROM dbo.Orders o
            INNER JOIN dbo.Users u ON u.UserId = o.UserId
            OUTER APPLY (
                SELECT TOP (1) PaymentStatus
                FROM dbo.Payments
                WHERE OrderId = o.OrderId
                ORDER BY CreatedAt DESC, PaymentId DESC
            ) p
            WHERE o.OrderId = @Id;
            """;

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return await connection.QuerySingleOrDefaultAsync<AdminOrderRow>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken));
    }

    public async Task<bool> SetOrderStatusAsync(
        int id, string status, int changedBy, CancellationToken cancellationToken = default)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync(cancellationToken);
        try
        {
            var current = await connection.QuerySingleOrDefaultAsync<string>(
                new CommandDefinition(
                    "SELECT OrderStatus FROM dbo.Orders WHERE OrderId=@Id",
                    new { Id = id }, transaction, cancellationToken: cancellationToken));
            if (current is null)
            {
                await transaction.RollbackAsync(cancellationToken);
                return false;
            }

            if (!string.Equals(current, status, StringComparison.OrdinalIgnoreCase))
            {
                await connection.ExecuteAsync(new CommandDefinition(
                    "UPDATE dbo.Orders SET OrderStatus=@Status, UpdatedAt=SYSUTCDATETIME() WHERE OrderId=@Id",
                    new { Id = id, Status = status }, transaction, cancellationToken: cancellationToken));
                await connection.ExecuteAsync(new CommandDefinition(
                    """
                    INSERT dbo.OrderStatusHistory (OrderId, Status, ChangedBy, Note)
                    VALUES (@Id, @Status, @ChangedBy, N'Cập nhật từ trang quản trị');
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
            SELECT c.CouponId AS Id,
                   c.Code,
                   COALESCE(c.Description, '') AS Name,
                   LOWER(c.DiscountType) AS Type,
                   c.DiscountValue AS Value,
                   c.MinOrderAmount AS MinimumOrder,
                   c.UsageLimit AS UsageLimit,
                   CONVERT(varchar(10), c.StartsAt, 23) AS StartDate,
                   CONVERT(varchar(10), c.ExpiresAt, 23) AS EndDate,
                   (SELECT COUNT(1) FROM dbo.Orders o WHERE o.CouponId = c.CouponId) AS Used,
                   CASE WHEN c.IsActive = 0 THEN 'draft'
                        WHEN CONVERT(date, c.StartsAt) > CONVERT(date, DATEADD(hour, 7, SYSUTCDATETIME())) THEN 'upcoming'
                        WHEN CONVERT(date, c.ExpiresAt) < CONVERT(date, DATEADD(hour, 7, SYSUTCDATETIME())) THEN 'expired'
                        ELSE 'running' END AS Status,
                   CASE WHEN c.IsActive = 1 THEN 'publish' ELSE 'draft' END AS Release
            FROM dbo.Coupons c
            WHERE (@Query IS NULL OR @Query = '' OR c.Code LIKE '%' + @Query + '%'
                   OR COALESCE(c.Description, '') LIKE '%' + @Query + '%')
              AND (@Status IS NULL OR
                   CASE WHEN c.IsActive = 0 THEN 'draft'
                        WHEN CONVERT(date, c.StartsAt) > CONVERT(date, DATEADD(hour, 7, SYSUTCDATETIME())) THEN 'upcoming'
                        WHEN CONVERT(date, c.ExpiresAt) < CONVERT(date, DATEADD(hour, 7, SYSUTCDATETIME())) THEN 'expired'
                        ELSE 'running' END = @Status)
            ORDER BY c.CouponId DESC;
            """;

        await using var connection = new SqlConnection(connectionString);
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
            INSERT dbo.Coupons
                (Code, Description, DiscountType, DiscountValue, MinOrderAmount, UsageLimit,
                 PerUserLimit, StartsAt, ExpiresAt, IsActive)
            OUTPUT INSERTED.CouponId
            VALUES
                (@Code, @Name, @DiscountType, @Value, @MinimumOrder, @UsageLimit,
                 1, @StartsAt, @ExpiresAt, @IsActive);
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return await connection.ExecuteScalarAsync<int>(new CommandDefinition(
            sql, promotion, cancellationToken: cancellationToken));
    }

    public async Task<bool> UpdatePromotionAsync(int id, AdminPromotionWrite promotion, CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE dbo.Coupons
            SET Description=@Name, DiscountType=@DiscountType, DiscountValue=@Value,
                MinOrderAmount=@MinimumOrder, UsageLimit=@UsageLimit,
                StartsAt=@StartsAt, ExpiresAt=@ExpiresAt, IsActive=@IsActive
            WHERE CouponId=@Id;
            """;
        await using var connection = new SqlConnection(connectionString);
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
        const string sql = "DELETE dbo.Coupons WHERE CouponId=@Id;";
        await using var connection = new SqlConnection(connectionString);
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
