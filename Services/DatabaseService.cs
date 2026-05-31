using Microsoft.Data.Sqlite;

namespace ListMate.Services;

public class DatabaseService
{
    private readonly string _connectionString;

    public DatabaseService(IConfiguration config)
    {
        var folder = config["DataFolder"] ?? "./data";
        Directory.CreateDirectory(folder);
        var dbPath = Path.Combine(folder, "listmate.db");
        _connectionString = $"Data Source={dbPath}";
        Migrate();
    }

    private void Migrate()
    {
        using var conn = Open();
        conn.ExecuteNonQuery(@"
            CREATE TABLE IF NOT EXISTS Accounts (
                Email TEXT PRIMARY KEY,
                Credits INTEGER NOT NULL DEFAULT 0,
                CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS Trials (
                AnonId TEXT PRIMARY KEY,
                FreeUsed INTEGER NOT NULL DEFAULT 0,
                LinkedEmail TEXT,
                CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS Usage (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                AnonId TEXT,
                Email TEXT,
                Action TEXT NOT NULL,
                CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
            );
        ");
    }

    // ── Trials ────────────────────────────────────────────────
    public (int freeUsed, string? linkedEmail) GetTrial(string anonId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT FreeUsed, LinkedEmail FROM Trials WHERE AnonId = @id";
        cmd.Parameters.AddWithValue("@id", anonId);
        using var r = cmd.ExecuteReader();
        if (!r.Read()) return (0, null);
        return (r.GetInt32(0), r.IsDBNull(1) ? null : r.GetString(1));
    }

    public void EnsureTrial(string anonId)
    {
        using var conn = Open();
        conn.ExecuteNonQuery(
            "INSERT OR IGNORE INTO Trials (AnonId, FreeUsed) VALUES (@id, 0)",
            ("@id", anonId));
    }

    public void IncrementFreeUsed(string anonId)
    {
        using var conn = Open();
        conn.ExecuteNonQuery(
            "UPDATE Trials SET FreeUsed = FreeUsed + 1 WHERE AnonId = @id",
            ("@id", anonId));
    }

    public void LinkTrialToEmail(string anonId, string email)
    {
        using var conn = Open();
        conn.ExecuteNonQuery(
            "UPDATE Trials SET LinkedEmail = @email WHERE AnonId = @id",
            ("@email", email), ("@id", anonId));
    }

    // ── Accounts ──────────────────────────────────────────────
    public int GetPaidCredits(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT Credits FROM Accounts WHERE Email = @e";
        cmd.Parameters.AddWithValue("@e", email.ToLower());
        var result = cmd.ExecuteScalar();
        return result is long l ? (int)l : 0;
    }

    public void AddCredits(string email, int amount)
    {
        using var conn = Open();
        conn.ExecuteNonQuery(@"
            INSERT INTO Accounts (Email, Credits) VALUES (@e, @a)
            ON CONFLICT(Email) DO UPDATE SET Credits = Credits + @a",
            ("@e", email.ToLower()), ("@a", amount));
    }

    public bool DeductCredit(string email)
    {
        using var conn = Open();
        conn.ExecuteNonQuery(@"
            UPDATE Accounts SET Credits = Credits - 1
            WHERE Email = @e AND Credits > 0",
            ("@e", email.ToLower()));
        return GetPaidCredits(email) >= 0;
    }

    // ── Usage log ─────────────────────────────────────────────
    public void LogUsage(string? anonId, string? email, string action)
    {
        using var conn = Open();
        conn.ExecuteNonQuery(
            "INSERT INTO Usage (AnonId, Email, Action) VALUES (@a, @e, @act)",
            ("@a", anonId ?? ""), ("@e", email ?? ""), ("@act", action));
    }

    // ── Helpers ───────────────────────────────────────────────
    private SqliteConnection Open()
    {
        var conn = new SqliteConnection(_connectionString);
        conn.Open();
        return conn;
    }
}

internal static class SqliteExtensions
{
    internal static void ExecuteNonQuery(this SqliteConnection conn, string sql, params (string, object)[] parameters)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        foreach (var (name, value) in parameters)
            cmd.Parameters.AddWithValue(name, value ?? DBNull.Value);
        cmd.ExecuteNonQuery();
    }
}
