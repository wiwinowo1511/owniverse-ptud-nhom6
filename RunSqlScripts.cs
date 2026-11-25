using Npgsql;

var connString = "Host=ep-tiny-sunset-bixok87v.c-5.ap-southeast-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_o7ZD6aqhUVGx;SSL Mode=Require;Trust Server Certificate=true";

await using var conn = new NpgsqlConnection(connString);
await conn.OpenAsync();

Console.WriteLine("Connected to Neon!");

var createSql = File.ReadAllText("database/create-database-postgresql.sql");
var seedSql = File.ReadAllText("database/seed-data-postgresql.sql");

Console.WriteLine("Running create-database-postgresql.sql...");
await using (var cmd = new NpgsqlCommand(createSql, conn))
{
    await cmd.ExecuteNonQueryAsync();
}
Console.WriteLine("Schema created!");

Console.WriteLine("Running seed-data-postgresql.sql...");
await using (var cmd = new NpgsqlCommand(seedSql, conn))
{
    await cmd.ExecuteNonQueryAsync();
}
Console.WriteLine("Seed data inserted!");

Console.WriteLine("Done!");