namespace ListMate.Services;

public class CreditsService
{
    private readonly DatabaseService _db;
    public const int FreeTrial = 3;

    public CreditsService(DatabaseService db) => _db = db;

    public CreditsSnapshot GetSnapshot(string anonId)
    {
        _db.EnsureTrial(anonId);
        var (freeUsed, linkedEmail) = _db.GetTrial(anonId);
        var freeRemaining = Math.Max(0, FreeTrial - freeUsed);
        var paidCredits = linkedEmail is not null ? _db.GetPaidCredits(linkedEmail) : 0;
        return new(freeRemaining, paidCredits, linkedEmail);
    }

    /// <summary>Returns true and deducts a credit if the user has any available.</summary>
    public bool TryConsume(string anonId)
    {
        _db.EnsureTrial(anonId);
        var (freeUsed, linkedEmail) = _db.GetTrial(anonId);

        if (freeUsed < FreeTrial)
        {
            _db.IncrementFreeUsed(anonId);
            return true;
        }

        if (linkedEmail is not null && _db.GetPaidCredits(linkedEmail) > 0)
        {
            _db.DeductCredit(linkedEmail);
            return true;
        }

        return false;
    }

    public void AddPaidCredits(string email, int amount)
    {
        _db.AddCredits(email, amount);
    }
}

public record CreditsSnapshot(int FreeRemaining, int PaidCredits, string? Email);
