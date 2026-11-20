using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;

static class AdminBootstrap
{
    public static async Task<User?> EnsureDevelopmentAdminAsync(
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher,
        CancellationToken cancellationToken = default)
    {
        var connectionString = configuration.GetConnectionString("Owniverse");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Development admin bootstrap requires ConnectionStrings:Owniverse.");

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync(
            System.Data.IsolationLevel.Serializable, cancellationToken);

        try
        {
            const string findAdminSql = """
                SELECT TOP (1) UserId, Email, PasswordHash, FullName, Phone, Role, Status
                FROM dbo.Users WITH (UPDLOCK, HOLDLOCK)
                WHERE Role = 'Admin'
                ORDER BY UserId;
                """;
            User? admin;
            await using (var command = new SqlCommand(findAdminSql, connection, transaction))
            await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
            {
                if (await reader.ReadAsync(cancellationToken))
                {
                    admin = new User
                    {
                        Id = reader.GetInt32(0),
                        Email = reader.GetString(1),
                        Password = reader.GetString(2),
                        FullName = reader.GetString(3),
                        Phone = reader.IsDBNull(4) ? "" : reader.GetString(4),
                        Role = Roles.Admin,
                        Status = reader.GetString(6).ToLowerInvariant(),
                    };
                    await reader.DisposeAsync();
                    await transaction.CommitAsync(cancellationToken);
                    return admin;
                }
            }

            var email = configuration["AdminBootstrap:Email"]?.Trim();
            var password = configuration["AdminBootstrap:Password"];
            var fullName = configuration["AdminBootstrap:FullName"]?.Trim();
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(fullName))
                throw new InvalidOperationException(
                    "Set AdminBootstrap:Email, AdminBootstrap:Password, and AdminBootstrap:FullName in Development user-secrets.");

            admin = new User
            {
                Email = email,
                FullName = fullName,
                Role = Roles.Admin,
                Status = "active",
            };
            var passwordHash = passwordHasher.HashPassword(admin, password);

            const string insertAdminSql = """
                INSERT INTO dbo.Users (Email, PasswordHash, FullName, Role, Status)
                OUTPUT INSERTED.UserId
                VALUES (@Email, @PasswordHash, @FullName, 'Admin', 'Active');
                """;
            await using (var command = new SqlCommand(insertAdminSql, connection, transaction))
            {
                command.Parameters.AddWithValue("@Email", email);
                command.Parameters.AddWithValue("@PasswordHash", passwordHash);
                command.Parameters.AddWithValue("@FullName", fullName);
                admin.Id = (int)(await command.ExecuteScalarAsync(cancellationToken)
                    ?? throw new InvalidOperationException("Admin bootstrap insert returned no UserId."));
            }

            admin.Password = passwordHash;
            await transaction.CommitAsync(cancellationToken);
            return admin;
        }
        catch
        {
            await transaction.RollbackAsync(CancellationToken.None);
            throw;
        }
    }
}
