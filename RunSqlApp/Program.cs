using Npgsql;

var connString = "Host=ep-tiny-sunset-bixok87v.c-5.ap-southeast-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_o7ZD6aqhUVGx;SSL Mode=Require;Trust Server Certificate=true";

await using var conn = new NpgsqlConnection(connString);
await conn.OpenAsync();

Console.WriteLine("Connected!");

var alters = new[]
{
    "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address VARCHAR(500) NOT NULL DEFAULT '';",
    "ALTER TABLE public.productvariants ADD COLUMN IF NOT EXISTS displayname VARCHAR(100) NOT NULL DEFAULT 'Mặc định';",
    "ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS avatarurl VARCHAR(500);",
};

foreach (var sql in alters)
{
    await using var cmd = new NpgsqlCommand(sql, conn);
    await cmd.ExecuteNonQueryAsync();
    Console.WriteLine($"OK: {sql}");
}

Console.WriteLine("--- productvariants columns ---");
await using var c1 = new NpgsqlCommand("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='productvariants' ORDER BY ordinal_position", conn);
await using var r1 = await c1.ExecuteReaderAsync();
while (await r1.ReadAsync()) Console.WriteLine(r1.GetString(0));

Console.WriteLine("--- communities columns ---");
await using var c2 = new NpgsqlCommand("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='communities' ORDER BY ordinal_position", conn);
await using var r2 = await c2.ExecuteReaderAsync();
while (await r2.ReadAsync()) Console.WriteLine(r2.GetString(0));