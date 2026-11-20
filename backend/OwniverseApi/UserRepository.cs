using Microsoft.Data.SqlClient;

sealed class UserRepository(string connectionString)
{
    public async Task<int> GetNextUserIdAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(
            "SELECT ISNULL(MAX(UserId), 0) + 1 FROM dbo.Users;", connection);
        return Convert.ToInt32(await command.ExecuteScalarAsync(cancellationToken));
    }

    public async Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT UserId, Email, PasswordHash, FullName, Phone, Role, Status, CreatedAt
            FROM dbo.Users
            WHERE Email = @Email;
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Email", System.Data.SqlDbType.NVarChar, 255).Value = email;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadUser(reader) : null;
    }

    public async Task<User?> FindByIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT UserId, Email, PasswordHash, FullName, Phone, Role, Status, CreatedAt
            FROM dbo.Users
            WHERE UserId = @UserId;
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = userId;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadUser(reader) : null;
    }

    public async Task<User> CreateCustomerAsync(User user, CancellationToken cancellationToken = default)
    {
        const string sql = """
            INSERT INTO dbo.Users (Email, PasswordHash, FullName, Phone, Role, Status)
            OUTPUT INSERTED.UserId, INSERTED.CreatedAt
            VALUES (@Email, @PasswordHash, @FullName, @Phone, 'Customer', 'Active');
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Email", System.Data.SqlDbType.NVarChar, 255).Value = user.Email;
        command.Parameters.Add("@PasswordHash", System.Data.SqlDbType.NVarChar, 255).Value = user.Password;
        command.Parameters.Add("@FullName", System.Data.SqlDbType.NVarChar, 100).Value = user.FullName;
        command.Parameters.Add("@Phone", System.Data.SqlDbType.VarChar, 20).Value =
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
            UPDATE dbo.Users
            SET FullName = @FullName,
                Email = @Email,
                Phone = @Phone,
                UpdatedAt = SYSUTCDATETIME()
            OUTPUT INSERTED.UserId, INSERTED.Email, INSERTED.PasswordHash,
                   INSERTED.FullName, INSERTED.Phone, INSERTED.Role,
                   INSERTED.Status, INSERTED.CreatedAt
            WHERE UserId = @UserId;
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = userId;
        command.Parameters.Add("@FullName", System.Data.SqlDbType.NVarChar, 100).Value = fullName;
        command.Parameters.Add("@Email", System.Data.SqlDbType.NVarChar, 255).Value = email;
        command.Parameters.Add("@Phone", System.Data.SqlDbType.VarChar, 20).Value =
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
            UPDATE dbo.Users
            SET PasswordHash = @PasswordHash,
                UpdatedAt = SYSUTCDATETIME()
            WHERE UserId = @UserId AND Status = 'Active';
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = userId;
        command.Parameters.Add("@PasswordHash", System.Data.SqlDbType.NVarChar, 255).Value = passwordHash;
        return await command.ExecuteNonQueryAsync(cancellationToken) == 1;
    }

    public async Task<AccountOrdersSummary> GetAccountOrdersAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        const string summarySql = """
            SELECT COUNT(1),
                   COALESCE(SUM(CASE WHEN OrderStatus IN ('Pending', 'Confirmed', 'Processing', 'Shipping')
                                     THEN 1 ELSE 0 END), 0)
            FROM dbo.Orders
            WHERE UserId = @UserId;
            """;
        const string recentOrdersSql = """
            SELECT TOP (5) OrderId, OrderCode, CreatedAt, TotalAmount, OrderStatus
            FROM dbo.Orders
            WHERE UserId = @UserId
            ORDER BY CreatedAt DESC, OrderId DESC;
            """;

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        int totalOrders;
        int processingOrders;
        await using (var command = new SqlCommand(summarySql, connection))
        {
            command.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = userId;
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            await reader.ReadAsync(cancellationToken);
            totalOrders = reader.GetInt32(0);
            processingOrders = reader.GetInt32(1);
        }

        var recentOrders = new List<AccountOrder>();
        await using (var command = new SqlCommand(recentOrdersSql, connection))
        {
            command.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = userId;
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
            SELECT AddressId, ReceiverName, ReceiverPhone, AddressLine,
                   Ward, District, City, IsDefault
            FROM dbo.UserAddresses
            WHERE UserId = @UserId
            ORDER BY IsDefault DESC, AddressId DESC;
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = userId;
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
            SELECT c.CommunityId, a.ArtistId, c.Name, c.Description,
                   a.Name AS ArtistName, a.Slug AS ArtistSlug, cm.JoinedAt
            FROM dbo.CommunityMembers AS cm
            INNER JOIN dbo.Communities AS c ON c.CommunityId = cm.CommunityId
            INNER JOIN dbo.Artists AS a ON a.ArtistId = c.ArtistId
            WHERE cm.UserId = @UserId
            ORDER BY cm.JoinedAt DESC, c.CommunityId;
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = userId;
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
            SELECT c.CommunityId
            FROM dbo.Communities AS c
            INNER JOIN dbo.Artists AS a ON a.ArtistId = c.ArtistId
            WHERE a.ArtistId = @ArtistId AND a.Status = 'Active';
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@ArtistId", System.Data.SqlDbType.Int).Value = artistId;
        var result = await command.ExecuteScalarAsync(cancellationToken);
        return result is null or DBNull ? null : Convert.ToInt32(result);
    }

    public async Task<bool> JoinCommunityAsync(
        int communityId,
        int userId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            IF NOT EXISTS (
                SELECT 1
                FROM dbo.Communities AS c
                INNER JOIN dbo.Artists AS a ON a.ArtistId = c.ArtistId
                WHERE c.CommunityId = @CommunityId AND a.Status = 'Active'
            )
                SELECT CAST(0 AS bit);
            ELSE
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM dbo.CommunityMembers WITH (UPDLOCK, HOLDLOCK)
                    WHERE CommunityId = @CommunityId AND UserId = @UserId
                )
                    INSERT INTO dbo.CommunityMembers (CommunityId, UserId)
                    VALUES (@CommunityId, @UserId);
                SELECT CAST(1 AS bit);
            END;
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@CommunityId", System.Data.SqlDbType.Int).Value = communityId;
        command.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = userId;
        return Convert.ToBoolean(await command.ExecuteScalarAsync(cancellationToken));
    }

    public async Task<bool> LeaveCommunityAsync(
        int communityId,
        int userId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            IF NOT EXISTS (SELECT 1 FROM dbo.Communities WHERE CommunityId = @CommunityId)
                SELECT CAST(0 AS bit);
            ELSE
            BEGIN
                DELETE FROM dbo.CommunityMembers
                WHERE CommunityId = @CommunityId AND UserId = @UserId;
                SELECT CAST(1 AS bit);
            END;
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@CommunityId", System.Data.SqlDbType.Int).Value = communityId;
        command.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = userId;
        return Convert.ToBoolean(await command.ExecuteScalarAsync(cancellationToken));
    }

    private static User ReadUser(SqlDataReader reader) => new()
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
