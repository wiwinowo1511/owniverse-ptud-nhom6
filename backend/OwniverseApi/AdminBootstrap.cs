using Microsoft.AspNetCore.Identity;
using Npgsql;

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

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(
            System.Data.IsolationLevel.Serializable, cancellationToken);

        try
        {
            const string findAccountSql = """
                SELECT "userid", "email", "passwordhash", "fullname", "phone", "role", "status"
                FROM public.users
                WHERE "email" = @Email
                FOR SHARE;
                """;
            User? admin = null;
            await using (var command = new NpgsqlCommand(findAccountSql, connection, transaction))
            {
                command.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = email;
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
                        UPDATE public.users
                        SET "passwordhash" = @PasswordHash, "status" = 'Active', "updatedat" = NOW() AT TIME ZONE 'UTC'
                        WHERE "userid" = @UserId;
                        """;
                    await using var updateCommand = new NpgsqlCommand(updatePasswordSql, connection, transaction);
                    updateCommand.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = admin.Id;
                    updateCommand.Parameters.Add("@PasswordHash", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = passwordHash;
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
                INSERT INTO public.users ("email", "passwordhash", "fullname", "role", "status")
                VALUES (@Email, @PasswordHash, @FullName, 'Admin', 'Active')
                RETURNING "userid";
                """;
            await using (var command = new NpgsqlCommand(insertAdminSql, connection, transaction))
            {
                command.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = email;
                command.Parameters.Add("@PasswordHash", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = newPasswordHash;
                command.Parameters.Add("@FullName", NpgsqlTypes.NpgsqlDbType.Varchar, 100).Value = fullName;
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
