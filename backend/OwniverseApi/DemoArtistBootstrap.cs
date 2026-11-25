using Microsoft.AspNetCore.Identity;
using Npgsql;

static class DemoArtistBootstrap
{
    private const string DemoArtistEmail = "kairo@owniverse.vn";

    public static async Task<User?> EnsureAsync(
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher,
        CancellationToken cancellationToken = default)
    {
        var configuredPassword = configuration["ArtistBootstrap:Password"];
        if (string.IsNullOrWhiteSpace(configuredPassword)) return null;
        if (configuredPassword.Length < 8)
            throw new InvalidOperationException("ArtistBootstrap:Password must contain at least 8 characters.");

        var connectionString = configuration.GetConnectionString("Owniverse");
        if (string.IsNullOrWhiteSpace(connectionString)) return null;
        var email = configuration["ArtistBootstrap:Email"]?.Trim();
        if (string.IsNullOrWhiteSpace(email)) email = DemoArtistEmail;
        email = email.ToLowerInvariant();

await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var findCommand = new NpgsqlCommand(
            "SELECT \"userid\", \"email\", \"passwordhash\", \"fullname\", \"phone\", \"role\", \"status\", \"createdat\" FROM public.users WHERE \"email\" = @Email;",
            connection);
        findCommand.Parameters.Add("@Email", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = email;
        await using var reader = await findCommand.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken)) return null;

        var artist = new User
        {
            Id = reader.GetInt32(0),
            Email = reader.GetString(1),
            Password = reader.GetString(2),
            FullName = reader.GetString(3),
            Phone = reader.IsDBNull(4) ? "" : reader.GetString(4),
            Role = reader.GetString(5),
            Status = reader.GetString(6).ToLowerInvariant(),
            CreatedAt = reader.GetDateTime(7)
        };
        await reader.CloseAsync();

        if (!string.Equals(artist.Role, Roles.Artist, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("ArtistBootstrap email is assigned to a non-artist account.");

        await using var linkCommand = new NpgsqlCommand(
            "SELECT COUNT(1) FROM public.artists WHERE \"userid\"=@UserId AND \"status\"='Active';",
            connection);
        linkCommand.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = artist.Id;
        if (Convert.ToInt32(await linkCommand.ExecuteScalarAsync(cancellationToken)) == 0)
            return null;

        var passwordMatches = false;
        try
        {
            passwordMatches = passwordHasher.VerifyHashedPassword(artist, artist.Password, configuredPassword)
                != PasswordVerificationResult.Failed;
        }
        catch (FormatException)
        {
            // Locked seed markers are not ASP.NET Identity password hashes.
        }

        if (!passwordMatches || artist.Status != "active")
        {
            var passwordHash = passwordMatches
                ? artist.Password
                : passwordHasher.HashPassword(artist, configuredPassword);
            await using var updateCommand = new NpgsqlCommand(
                "UPDATE public.users SET \"passwordhash\"=@PasswordHash, \"status\"='Active', \"updatedat\"=NOW() AT TIME ZONE 'UTC' WHERE \"userid\"=@UserId;",
                connection);
            updateCommand.Parameters.Add("@UserId", NpgsqlTypes.NpgsqlDbType.Integer).Value = artist.Id;
            updateCommand.Parameters.Add("@PasswordHash", NpgsqlTypes.NpgsqlDbType.Varchar, 255).Value = passwordHash;
            await updateCommand.ExecuteNonQueryAsync(cancellationToken);
            artist.Password = passwordHash;
            artist.Status = "active";
        }

        return artist;
    }
}
