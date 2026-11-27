using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace OwniverseApi;

public static class TestDataBootstrap
{
    private static readonly (string TargetEmail, string SourceEmail, string Password, string FullName, string Role, string DbStatus, string MemStatus)[] TestUsers =
    [
        ("customer@owniverse.com", "customer@owniverse.com", "Customer123", "Khách hàng demo", Roles.Customer, "Active", UserStatus.Active),
        ("kairo@owniverse.com", "kairo@owniverse.vn", "Artist123", "KAIRO", Roles.Artist, "Active", UserStatus.Active),
        ("mira@owniverse.com", "mira@owniverse.vn", "Artist123", "MIRA", Roles.Artist, "Active", UserStatus.Active),
        ("rhea@owniverse.com", "rhea@owniverse.vn", "Artist123", "RHEA", Roles.Artist, "Active", UserStatus.Active)
    ];

    public static async Task EnsureTestUsersAsync(
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher,
        CancellationToken cancellationToken = default,
        List<User>? users = null,
        List<Artist>? artists = null,
        List<Community>? communities = null,
        ILogger? logger = null)
    {
        var connectionString = configuration.GetConnectionString("Owniverse");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Test data bootstrap requires ConnectionStrings:Owniverse.");

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        logger?.LogInformation("TestDataBootstrap: Starting test user bootstrap");

        foreach (var (targetEmail, sourceEmail, password, fullName, role, dbStatus, memStatus) in TestUsers)
        {
            logger?.LogInformation("TestDataBootstrap: Processing user {TargetEmail} (source: {SourceEmail})", targetEmail, sourceEmail);
            // First check if target email already exists
            const string findByTargetSql = """
                SELECT "userid", "email", "passwordhash", "fullname", "phone", "role", "status"
                FROM public.users
                WHERE "email" = @Email;
                """;

            User? user = null;
            await using (var command = new NpgsqlCommand(findByTargetSql, connection))
            {
                command.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = targetEmail;
                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (await reader.ReadAsync(cancellationToken))
                {
                    user = new User
                    {
                        Id = reader.GetInt32(0),
                        Email = reader.GetString(1),
                        Password = reader.GetString(2),
                        FullName = reader.GetString(3),
                        Phone = reader.IsDBNull(4) ? "" : reader.GetString(4),
                        Role = reader.GetString(5),
                        Status = reader.GetString(6).ToLowerInvariant(),
                    };
                    logger?.LogInformation("TestDataBootstrap: Found existing user by target email: {Email}, Id={Id}, Role={Role}", user.Email, user.Id, user.Role);
                }
                else
                {
                    logger?.LogInformation("TestDataBootstrap: No user found with target email {TargetEmail}", targetEmail);
                }
            }

            // If not found by target email, check source email
            if (user is null && !string.Equals(sourceEmail, targetEmail, StringComparison.OrdinalIgnoreCase))
            {
                const string findBySourceSql = """
                    SELECT "userid", "email", "passwordhash", "fullname", "phone", "role", "status"
                    FROM public.users
                    WHERE "email" = @Email;
                    """;
                await using (var command = new NpgsqlCommand(findBySourceSql, connection))
                {
                    command.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = sourceEmail;
                    await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                    if (await reader.ReadAsync(cancellationToken))
                    {
                        user = new User
                        {
                            Id = reader.GetInt32(0),
                            Email = reader.GetString(1),
                            Password = reader.GetString(2),
                            FullName = reader.GetString(3),
                            Phone = reader.IsDBNull(4) ? "" : reader.GetString(4),
                            Role = reader.GetString(5),
                            Status = reader.GetString(6).ToLowerInvariant(),
                        };
                        logger?.LogInformation("TestDataBootstrap: Found existing user by source email: {Email}, Id={Id}, Role={Role}", user.Email, user.Id, user.Role);
                    }
                    else
                    {
                        logger?.LogInformation("TestDataBootstrap: No user found with source email {SourceEmail}", sourceEmail);
                    }
                }
            }

            var passwordHash = passwordHasher.HashPassword(new User(), password);
            logger?.LogInformation("TestDataBootstrap: Generated password hash for {TargetEmail}: {Hash}", targetEmail, passwordHash[..20] + "...");

            if (user is not null)
            {
                if (!string.Equals(user.Role, role, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException($"Test email {user.Email} is already assigned to a different role.");

                // Always update password hash, email and status for test users to ensure correctness
                const string updateUserSql = """
                    UPDATE public.users
                    SET "email" = @Email, "passwordhash" = @PasswordHash, "status" = @Status, "updatedat" = NOW() AT TIME ZONE 'UTC'
                    WHERE "userid" = @UserId;
                    """;
                await using var updateCommand = new NpgsqlCommand(updateUserSql, connection);
                updateCommand.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = user.Id;
                updateCommand.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = targetEmail;
                updateCommand.Parameters.Add("@PasswordHash", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = passwordHash;
                updateCommand.Parameters.Add("@Status", NpgsqlTypes.NpgsqlDbType.Varchar, 20).Value = dbStatus;
                var rowsAffected = await updateCommand.ExecuteNonQueryAsync(cancellationToken);
                logger?.LogInformation("TestDataBootstrap: Updated user {TargetEmail}, rows affected: {Rows}", targetEmail, rowsAffected);

                // Update in-memory user if provided
                if (users is not null)
                {
                    var memUser = users.FirstOrDefault(u => u.Id == user.Id);
                    if (memUser is not null)
                    {
                        memUser.Email = targetEmail;
                        memUser.Password = passwordHash;
                        memUser.Status = memStatus;
                        logger?.LogInformation("TestDataBootstrap: Updated in-memory user {TargetEmail}", targetEmail);
                    }
                    else
                    {
                        logger?.LogWarning("TestDataBootstrap: In-memory user list provided but user {Id} not found in it", user.Id);
                    }
                }

                // Ensure artist exists for Artist role users (both new and existing)
                if (role == "Artist" && artists is not null && communities is not null)
                {
                    var slug = targetEmail.Split('@')[0].ToLowerInvariant();
                    var artistName = fullName;
                    const string upsertArtistSql = """
                        INSERT INTO public.artists ("userid", "name", "slug", "status")
                        VALUES (@UserId, @Name, @Slug, 'Active')
                        ON CONFLICT ("userid") DO UPDATE SET "name" = EXCLUDED."name", "slug" = EXCLUDED."slug", "status" = EXCLUDED."status";
                        """;
                    await using var artistCommand = new NpgsqlCommand(upsertArtistSql, connection);
                    artistCommand.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = user.Id;
                    artistCommand.Parameters.Add("@Name", NpgsqlTypes.NpgsqlDbType.Varchar, 100).Value = artistName;
                    artistCommand.Parameters.Add("@Slug", NpgsqlTypes.NpgsqlDbType.Varchar, 100).Value = slug;
                    await artistCommand.ExecuteNonQueryAsync(cancellationToken);
                    logger?.LogInformation("TestDataBootstrap: Upserted artist for {TargetEmail}, slug={Slug}", targetEmail, slug);

                    // Add to in-memory artists
                    var newArtist = new Artist
                    {
                        Id = user.Id,
                        UserId = user.Id,
                        Slug = slug,
                        Name = artistName,
                        Status = "active"
                    };
                    artists.Add(newArtist);

                    const string insertCommunitySql = """
                        INSERT INTO public.communities ("artistid", "name", "description")
                        VALUES (@ArtistId, @Name, @Description)
                        ON CONFLICT ("artistid") DO NOTHING;
                        """;
                    await using var communityCommand = new NpgsqlCommand(insertCommunitySql, connection);
                    communityCommand.Parameters.Add("@ArtistId", NpgsqlTypes.NpgsqlDbType.Integer).Value = user.Id;
                    communityCommand.Parameters.Add("@Name", NpgsqlTypes.NpgsqlDbType.Varchar, 150).Value = $"{artistName} Community";
                    communityCommand.Parameters.Add("@Description", NpgsqlTypes.NpgsqlDbType.Varchar, 1000).Value = $"Cộng đồng chính thức của {artistName}";
                    await communityCommand.ExecuteNonQueryAsync(cancellationToken);

                    // Add to in-memory communities
                    var newCommunity = new Community
                    {
                        Id = user.Id,
                        ArtistId = user.Id,
                        Name = $"{artistName} Community",
                        Description = $"Cộng đồng chính thức của {artistName}"
                    };
                    communities.Add(newCommunity);
                    logger?.LogInformation("TestDataBootstrap: Added community for {TargetEmail}", targetEmail);
                }
            }
            else
            {
                const string insertUserSql = """
                    INSERT INTO public.users ("email", "passwordhash", "fullname", "role", "status")
                    VALUES (@Email, @PasswordHash, @FullName, @Role, @Status)
                    RETURNING "userid";
                    """;
                await using var command = new NpgsqlCommand(insertUserSql, connection);
                command.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = targetEmail;
                command.Parameters.Add("@PasswordHash", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = passwordHash;
                command.Parameters.Add("@FullName", NpgsqlTypes.NpgsqlDbType.Varchar, 100).Value = fullName;
                command.Parameters.Add("@Role", NpgsqlTypes.NpgsqlDbType.Varchar, 20).Value = role;
                command.Parameters.Add("@Status", NpgsqlTypes.NpgsqlDbType.Varchar, 20).Value = dbStatus;
                var userId = (int)(await command.ExecuteScalarAsync(cancellationToken)
                    ?? throw new InvalidOperationException($"Test user bootstrap insert returned no UserId for {targetEmail}."));
                logger?.LogInformation("TestDataBootstrap: Inserted new user {TargetEmail} with Id={UserId}", targetEmail, userId);

                // Add to in-memory users if provided
                if (users is not null)
                {
                    var newUser = new User
                    {
                        Id = userId,
                        Email = targetEmail,
                        Password = passwordHash,
                        FullName = fullName,
                        Role = role.ToLowerInvariant(),
                        Status = memStatus,
                        CreatedAt = DateTime.UtcNow
                    };
                    users.Add(newUser);
                    logger?.LogInformation("TestDataBootstrap: Added to in-memory users list: {TargetEmail}", targetEmail);
                }

                // Ensure artist exists for Artist role users (new users)
                if (role == "Artist" && artists is not null && communities is not null)
                {
                    var slug = targetEmail.Split('@')[0].ToLowerInvariant();
                    var artistName = fullName;
                    const string upsertArtistSql = """
                        INSERT INTO public.artists ("userid", "name", "slug", "status")
                        VALUES (@UserId, @Name, @Slug, 'Active')
                        ON CONFLICT ("userid") DO UPDATE SET "name" = EXCLUDED."name", "slug" = EXCLUDED."slug", "status" = EXCLUDED."status";
                        """;
                    await using var artistCommand = new NpgsqlCommand(upsertArtistSql, connection);
                    artistCommand.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = userId;
                    artistCommand.Parameters.Add("@Name", NpgsqlTypes.NpgsqlDbType.Varchar, 100).Value = artistName;
                    artistCommand.Parameters.Add("@Slug", NpgsqlTypes.NpgsqlDbType.Varchar, 100).Value = slug;
                    await artistCommand.ExecuteNonQueryAsync(cancellationToken);
                    logger?.LogInformation("TestDataBootstrap: Upserted artist for {TargetEmail}, slug={Slug}", targetEmail, slug);

                    // Add to in-memory artists
                    var newArtist = new Artist
                    {
                        Id = userId,
                        UserId = userId,
                        Slug = slug,
                        Name = artistName,
                        Status = "active"
                    };
                    artists.Add(newArtist);

                    const string insertCommunitySql = """
                        INSERT INTO public.communities ("artistid", "name", "description")
                        VALUES (@ArtistId, @Name, @Description)
                        ON CONFLICT ("artistid") DO NOTHING;
                        """;
                    await using var communityCommand = new NpgsqlCommand(insertCommunitySql, connection);
                    communityCommand.Parameters.Add("@ArtistId", NpgsqlTypes.NpgsqlDbType.Integer).Value = userId;
                    communityCommand.Parameters.Add("@Name", NpgsqlTypes.NpgsqlDbType.Varchar, 150).Value = $"{artistName} Community";
                    communityCommand.Parameters.Add("@Description", NpgsqlTypes.NpgsqlDbType.Varchar, 1000).Value = $"Cộng đồng chính thức của {artistName}";
                    await communityCommand.ExecuteNonQueryAsync(cancellationToken);

                    // Add to in-memory communities
                    var newCommunity = new Community
                    {
                        Id = userId,
                        ArtistId = userId,
                        Name = $"{artistName} Community",
                        Description = $"Cộng đồng chính thức của {artistName}"
                    };
                    communities.Add(newCommunity);
                    logger?.LogInformation("TestDataBootstrap: Added community for {TargetEmail}", targetEmail);
                }
            }
        }
        logger?.LogInformation("TestDataBootstrap: Completed test user bootstrap");
    }
}