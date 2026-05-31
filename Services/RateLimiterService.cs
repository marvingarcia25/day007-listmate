using System.Collections.Concurrent;

namespace ListMate.Services;

public class RateLimiterService
{
    private readonly ConcurrentDictionary<string, Queue<DateTime>> _windows = new();
    private const int MaxRequests = 5;
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(1);

    /// <summary>Returns true if the request is allowed; false if rate-limited.</summary>
    public bool TryConsume(string key)
    {
        var now   = DateTime.UtcNow;
        var queue = _windows.GetOrAdd(key, _ => new Queue<DateTime>());
        lock (queue)
        {
            Purge(queue, now);
            if (queue.Count >= MaxRequests) return false;
            queue.Enqueue(now);
            return true;
        }
    }

    public RateLimitInfo GetInfo(string key)
    {
        var now = DateTime.UtcNow;
        if (!_windows.TryGetValue(key, out var queue))
            return new RateLimitInfo(MaxRequests, MaxRequests, null);

        lock (queue)
        {
            Purge(queue, now);
            var remaining  = Math.Max(0, MaxRequests - queue.Count);
            var resetAt    = queue.Count > 0 ? (DateTime?)(queue.Peek() + Window) : null;
            return new RateLimitInfo(MaxRequests, remaining, resetAt);
        }
    }

    private static void Purge(Queue<DateTime> q, DateTime now)
    {
        while (q.Count > 0 && now - q.Peek() >= Window)
            q.Dequeue();
    }
}

public record RateLimitInfo(int Limit, int Remaining, DateTime? ResetsAt)
{
    public int SecondsUntilReset => ResetsAt.HasValue
        ? Math.Max(0, (int)Math.Ceiling((ResetsAt.Value - DateTime.UtcNow).TotalSeconds))
        : 0;
}
