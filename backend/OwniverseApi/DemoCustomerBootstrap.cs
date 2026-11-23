using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;

static class DemoCustomerBootstrap
{
    public static async Task<User?> EnsureAsync(
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher,
        CancellationToken cancellationToken = default)
    {
        var connectionString = configuration.GetConnectionString("Owniverse");
        if (string.IsNullOrWhiteSpace(connectionString)) return null;

        var email = "customer@owniverse.com";
        var password = "customer123";
        var fullName = "Khách hàng demo";

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using var findCommand = new SqlCommand(
            "SELECT UserId, Email, PasswordHash, FullName, Phone, Role, Status FROM dbo.Users WHERE Email = @Email;",
            connection);
        findCommand.Parameters.Add("@Email", System.Data.SqlDbType.NVarChar, 255).Value = email;
        await using var reader = await findCommand.ExecuteReaderAsync(cancellationToken);
        if (await reader.ReadAsync(cancellationToken))
        {
            var customer = new User
            {
                Id = reader.GetInt32(0),
                Email = reader.GetString(1),
                Password = reader.GetString(2),
                FullName = reader.GetString(3),
                Phone = reader.IsDBNull(4) ? "" : reader.GetString(4),
                Role = reader.GetString(5),
                Status = reader.GetString(6).ToLowerInvariant()
            };
            await reader.CloseAsync();

            if (!string.Equals(customer.Role, Roles.Customer, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Demo customer email is assigned to a non-customer account.");

            var matches = false;
            try
            {
                matches = passwordHasher.VerifyHashedPassword(customer, customer.Password, password)
                    != PasswordVerificationResult.Failed;
            }
            catch (FormatException) { }

            if (!matches || customer.Status != "active")
            {
                var hash = matches ? customer.Password : passwordHasher.HashPassword(customer, password);
                await using var update = new SqlCommand(
                    "UPDATE dbo.Users SET PasswordHash=@PasswordHash, Status='Active', UpdatedAt=SYSUTCDATETIME() WHERE UserId=@UserId;",
                    connection);
                update.Parameters.Add("@UserId", System.Data.SqlDbType.Int).Value = customer.Id;
                update.Parameters.Add("@PasswordHash", System.Data.SqlDbType.NVarChar, 255).Value = hash;
                await update.ExecuteNonQueryAsync(cancellationToken);
                customer.Password = hash;
                customer.Status = "active";
            }
            return customer;
        }
        await reader.CloseAsync();

        var newCustomer = new User
        {
            Email = email,
            FullName = fullName,
            Role = Roles.Customer,
            Status = "active"
        };
        newCustomer.Password = passwordHasher.HashPassword(newCustomer, password);

        await using var insert = new SqlCommand(
            "INSERT INTO dbo.Users (Email, PasswordHash, FullName, Role, Status) OUTPUT INSERTED.UserId VALUES (@Email,@PasswordHash,@FullName,'Customer','Active');",
            connection);
        insert.Parameters.Add("@Email", System.Data.SqlDbType.NVarChar, 255).Value = email;
        insert.Parameters.Add("@PasswordHash", System.Data.SqlDbType.NVarChar, 255).Value = newCustomer.Password;
        insert.Parameters.Add("@FullName", System.Data.SqlDbType.NVarChar, 100).Value = fullName;
        newCustomer.Id = (int)(await insert.ExecuteScalarAsync(cancellationToken)
            ?? throw new InvalidOperationException("Demo customer insert returned no UserId."));
        return newCustomer;
    }
}
