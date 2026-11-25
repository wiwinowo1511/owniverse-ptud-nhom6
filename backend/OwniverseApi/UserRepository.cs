using Dapper;
using Npgsql;

sealed class UserRepository(string connectionString)
{
    public async Task<int> GetNextUserIdAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new NpgsqlCommand(
            "SELECT COALESCE(MAX(\"userid\"), 0) + 1 FROM public.users;", connection);
        return Convert.ToInt32(await command.ExecuteScalarAsync(cancellationToken));
    }

    public async Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT "userid", "email", "passwordhash", "fullname", "phone", "role", "status", "createdat"
            FROM public.users
            WHERE "email" = @Email;
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = email;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadUser(reader) : null;
    }

    public async Task<User?> FindByIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT "userid", "email", "passwordhash", "fullname", "phone", "role", "status", "createdat"
            FROM public.users
            WHERE "userid" = @UserId;
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = userId;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadUser(reader) : null;
    }

    public async Task<User> CreateCustomerAsync(User user, CancellationToken cancellationToken = default)
    {
        const string sql = """
            INSERT INTO public.users ("email", "passwordhash", "fullname", "phone", "role", "status")
            VALUES (@Email, @PasswordHash, @FullName, @Phone, 'Customer', 'Active')
            RETURNING "userid", "createdat";
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = user.Email;
        command.Parameters.Add("@PasswordHash", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = user.Password;
        command.Parameters.Add("@FullName", NpgsqlTypes.NpgsqlDbType.Varchar, 100).Value = user.FullName;
        command.Parameters.Add("@Phone", NpgsqlTypes.NpgsqlDbType.Varchar, 20).Value =
            string.IsNullOrWhiteSpace(user.Phone) ? DBNull.Value : user.Phone;

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
            throw new InvalidOperationException("Customer insert returned no generated values.");
        user.Id = reader.GetInt32(0);
        user.CreatedAt = reader.GetDateTime(1);
        return user;
    }

    public async Task<User?> UpdateProfileAsync(
        int userId,
        string fullName,
        string email,
        string phone,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE public.users
            SET "fullname" = @FullName,
                "email" = @Email,
                "phone" = @Phone,
                "updatedat" = NOW() AT TIME ZONE 'UTC'
            WHERE "userid" = @UserId
            RETURNING "userid", "email", "passwordhash", "fullname", "phone", "role", "status", "createdat";
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = userId;
        command.Parameters.Add("@FullName", NpgsqlTypes.NpgsqlDbType.Varchar, 100).Value = fullName;
        command.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = email;
        command.Parameters.Add("@Phone", NpgsqlTypes.NpgsqlDbType.Varchar, 20).Value =
            string.IsNullOrWhiteSpace(phone) ? DBNull.Value : phone;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadUser(reader) : null;
    }

    public async Task<bool> UpdatePasswordHashAsync(
        int userId,
        string passwordHash,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE public.users
            SET "passwordhash" = @PasswordHash,
                "updatedat" = NOW() AT TIME ZONE 'UTC'
            WHERE "userid" = @UserId AND "status" = 'Active';
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = userId;
        command.Parameters.Add("@PasswordHash", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = passwordHash;
        return await command.ExecuteNonQueryAsync(cancellationToken) == 1;
    }

public async Task<AccountOrdersSummary> GetAccountOrdersAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        const string summarySql = """
            SELECT COUNT(1),
                   COALESCE(SUM(CASE WHEN "orderstatus" IN ('Pending', 'Confirmed', 'Processing', 'Shipping')
                                       THEN 1 ELSE 0 END), 0)
            FROM public.orders
            WHERE "userid" = @UserId;
            """;
        const string recentOrdersSql = """
            SELECT "orderid", "ordercode", "createdat", "totalamount", "orderstatus"
            FROM public.orders
            WHERE "userid" = @UserId
            ORDER BY "createdat" DESC, "orderid" DESC
            LIMIT 5;
            """;

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        int totalOrders;
        int processingOrders;
        await using (var command = new NpgsqlCommand(summarySql, connection))
        {
            command.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = userId;
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            await reader.ReadAsync(cancellationToken);
            totalOrders = reader.GetInt32(0);
            processingOrders = reader.GetInt32(1);
        }

        var recentOrders = new List<AccountOrder>();
        await using (var command = new NpgsqlCommand(recentOrdersSql, connection))
        {
            command.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = userId;
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                recentOrders.Add(new AccountOrder(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetDateTime(2),
                    reader.GetDecimal(3),
                    reader.GetString(4)));
            }
        }

        return new AccountOrdersSummary(totalOrders, processingOrders, recentOrders);
    }

    public async Task<List<AccountAddress>> GetAccountAddressesAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT "addressid", "receivername", "receiverphone", "addressline",
                   "ward", "district", "city", "isdefault"
            FROM public.useraddresses
            WHERE "userid" = @UserId
            ORDER BY "isdefault" DESC, "addressid" DESC;
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = userId;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var addresses = new List<AccountAddress>();
        while (await reader.ReadAsync(cancellationToken))
        {
            addresses.Add(new AccountAddress(
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.IsDBNull(4) ? null : reader.GetString(4),
                reader.IsDBNull(5) ? null : reader.GetString(5),
                reader.GetString(6),
                reader.GetBoolean(7)));
        }
        return addresses;
    }

    public async Task<List<AccountCommunity>> GetAccountCommunitiesAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT c."communityid", a."artistid", c."name", c."description",
                   a."name" AS ArtistName, a."slug" AS ArtistSlug, cm."joinedat"
            FROM public.communitymembers AS cm
            INNER JOIN public.communities AS c ON c."communityid" = cm."communityid"
            INNER JOIN public.artists AS a ON a."artistid" = c."artistid"
            WHERE cm."userid" = @UserId
            ORDER BY cm."joinedat" DESC, c."communityid";
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = userId;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var communities = new List<AccountCommunity>();
        while (await reader.ReadAsync(cancellationToken))
        {
            communities.Add(new AccountCommunity(
                reader.GetInt32(0),
                reader.GetInt32(1),
                reader.GetString(2),
                reader.IsDBNull(3) ? null : reader.GetString(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.GetDateTime(6)));
        }
        return communities;
    }

    public async Task<int?> GetCommunityIdForArtistAsync(
        int artistId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT c."communityid"
            FROM public.communities AS c
            INNER JOIN public.artists AS a ON a."artistid" = c."artistid"
            WHERE a."artistid" = @ArtistId AND a."status" = 'Active';
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.Add("@ArtistId", NpgsqlTypes.NpgsqlDbType.Integer).Value = artistId;
        var result = await command.ExecuteScalarAsync(cancellationToken);
        return result is null or DBNull ? null : Convert.ToInt32(result);
    }

    public async Task<bool> JoinCommunityAsync(
        int communityId,
        int userId,
        CancellationToken cancellationToken = default)
    {
        const string activeSql = """
            SELECT EXISTS (
                SELECT 1
                FROM public.communities AS c
                INNER JOIN public.artists AS a ON a."artistid" = c."artistid"
                WHERE c."communityid" = @CommunityId AND a."status" = 'Active'
            );
            """;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using (var activeCmd = new NpgsqlCommand(activeSql, connection))
        {
            activeCmd.Parameters.Add("@CommunityId", NpgsqlTypes.NpgsqlDbType.Integer).Value = communityId;
            if (!Convert.ToBoolean(await activeCmd.ExecuteScalarAsync(cancellationToken)))
                return false;
        }
        await connection.ExecuteAsync(
            """
            INSERT INTO public.communitymembers ("communityid", "userid")
            VALUES (@CommunityId, @UserId)
            ON CONFLICT ("communityid", "userid") DO NOTHING;
            """,
            new { CommunityId = communityId, UserId = userId });
        return true;
    }

    public async Task<bool> LeaveCommunityAsync(
        int communityId,
        int userId,
        CancellationToken cancellationToken = default)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM public.communities WHERE \"communityid\"=@CommunityId;",
            new { CommunityId = communityId }) > 0;
        if (!exists) return false;
        await connection.ExecuteAsync(
            "DELETE FROM public.communitymembers WHERE \"communityid\"=@CommunityId AND \"userid\"=@UserId;",
            new { CommunityId = communityId, UserId = userId });
        return true;
    }

    private static User ReadUser(NpgsqlDataReader reader) => new()
    {
        Id = reader.GetInt32(0),
        Email = reader.GetString(1),
        Password = reader.GetString(2),
        FullName = reader.GetString(3),
        Phone = reader.IsDBNull(4) ? "" : reader.GetString(4),
        Role = reader.GetString(5).ToLowerInvariant(),
        Status = reader.GetString(6).ToLowerInvariant(),
        CreatedAt = reader.GetDateTime(7),
    };
}

record AccountOrdersSummary(int TotalOrders, int ProcessingOrders, List<AccountOrder> RecentOrders);
record AccountOrder(int OrderId, string OrderCode, DateTime CreatedAt, decimal TotalAmount, string OrderStatus);
record AccountAddress(
    int AddressId,
    string ReceiverName,
    string ReceiverPhone,
    string AddressLine,
    string? Ward,
    string? District,
    string City,
    bool IsDefault);
record AccountCommunity(
    int CommunityId,
    int ArtistId,
    string Name,
    string? Description,
    string ArtistName,
    string ArtistSlug,
    DateTime JoinedAt);
