using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;

static class AdminBootstrap
{
    private const string DemoAdminEmail = "admin@owniverse.com";
    private const string DemoAdminPassword = "admin123";
    private const string DemoAdminName = "Admin OWNIVERSE";

    public static async Task<User?> EnsureDevelopmentAdminAsync(
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher,
        CancellationToken cancellationToken = default)
    {
        var connectionString = configuration.GetConnectionString("Owniverse");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Development admin bootstrap requires ConnectionStrings:Owniverse.");

        // User-secrets can override the predictable local demo account when needed.
        var email = configuration["AdminBootstrap:Email"]?.Trim();
        if (string.IsNullOrWhiteSpace(email)) email = DemoAdminEmail;
        var password = configuration["AdminBootstrap:Password"];
        if (string.IsNullOrWhiteSpace(password)) password = DemoAdminPassword;
        var fullName = configuration["AdminBootstrap:FullName"]?.Trim();
        if (string.IsNullOrWhiteSpace(fullName)) fullName = DemoAdminName;

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync(
            System.Data.IsolationLevel.Serializable, cancellationToken);

        try
        {
            const string findAccountSql = """
                SELECT UserId, Email, PasswordHash, FullName, Phone, Role, Status
                FROM dbo.Users WITH (UPDLOCK, HOLDLOCK)
                WHERE Email = @Email;
                """;
            User? admin = null;
            await using (var command = new SqlCommand(findAccountSql, connection, transaction))
            {
                command.Parameters.Add("@Email", System.Data.SqlDbType.NVarChar, 255).Value = email;
                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (await reader.ReadAsync(cancellationToken))
                {
                    admin = new User
                    {
                        Id = reader.GetInt32(0),
                        Email = reader.GetString(1),
                        Password = reader.GetString(2),
                        FullName = reader.GetString(3),
                        Phone = reader.IsDBNull(4) ? "" : reader.GetString(4),
                        Role = reader.GetString(5),
                        Status = reader.GetString(6).ToLowerInvariant(),
                    };
                }
            }

            if (admin is not null)
            {
                if (!string.Equals(admin.Role, Roles.Admin, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException($"Development demo email {email} is already assigned to a non-admin account.");

                var passwordMatches = false;
                try
                {
                    passwordMatches = passwordHasher.VerifyHashedPassword(admin, admin.Password, password)
                        != PasswordVerificationResult.Failed;
                }
                catch (FormatException)
                {
                    // Legacy/import markers are not ASP.NET Identity password hashes.
                }

                if (!passwordMatches || !string.Equals(admin.Status, "active", StringComparison.OrdinalIgnoreCase))
                {
                    var passwordHash = passwordMatches
                        ? admin.Password
                        : passwordHasher.HashPassword(admin, password);
                    const string updatePasswordSql = """
                        UPDATE dbo.Users
                        SET PasswordHash = @PasswordHash, Status = 'Active', UpdatedAt = SYSUTCDATETIME()
                        WHERE UserId = @UserId;
                        """;
                    await using var updateCommand = new SqlCommand(updatePasswordSql, connection, transaction);
                    updateCommand.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = admin.Id;
                    updateCommand.Parameters.Add("@PasswordHash", System.Data.SqlDbType.NVarChar, 255).Value = passwordHash;
                    await updateCommand.ExecuteNonQueryAsync(cancellationToken);
                    admin.Password = passwordHash;
                    admin.Status = "active";
                }

                await transaction.CommitAsync(cancellationToken);
                return admin;
            }

            admin = new User
            {
                Email = email,
                FullName = fullName,
                Role = Roles.Admin,
                Status = "active",
            };
            var newPasswordHash = passwordHasher.HashPassword(admin, password);

            const string insertAdminSql = """
                INSERT INTO dbo.Users (Email, PasswordHash, FullName, Role, Status)
                OUTPUT INSERTED.UserId
                VALUES (@Email, @PasswordHash, @FullName, 'Admin', 'Active');
                """;
            await using (var command = new SqlCommand(insertAdminSql, connection, transaction))
            {
                command.Parameters.Add("@Email", System.Data.SqlDbType.NVarChar, 255).Value = email;
                command.Parameters.Add("@PasswordHash", System.Data.SqlDbType.NVarChar, 255).Value = newPasswordHash;
                command.Parameters.Add("@FullName", System.Data.SqlDbType.NVarChar, 100).Value = fullName;
                admin.Id = (int)(await command.ExecuteScalarAsync(cancellationToken)
                    ?? throw new InvalidOperationException("Admin bootstrap insert returned no UserId."));
            }

            admin.Password = newPasswordHash;
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
