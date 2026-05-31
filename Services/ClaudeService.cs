using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ListMate.Services;

public class ClaudeService
{
    private readonly HttpClient _http;
    private readonly string? _apiKey;
    private readonly ILogger<ClaudeService> _logger;
    private const string Model = "claude-haiku-4-5-20251001";

    private const string SystemPrompt = """
        You are an expert Trade Me listing writer for the New Zealand marketplace.
        Write compelling, honest, conversion-focused listings that follow Trade Me best practices:
        - Title: max 80 characters, keyword-rich, specific (brand, model, condition)
        - Description: hook sentence, bullet features, condition details, pickup/payment info, warm close
        - Tone matches the requested style
        - Always truthful — never exaggerate or add details not provided
        Respond with ONLY valid JSON in this exact shape:
        {"title": "...", "description": "..."}
        """;

    public ClaudeService(IConfiguration config, HttpClient http, ILogger<ClaudeService> logger)
    {
        _http = http;
        _apiKey = config["Anthropic:ApiKey"];
        _logger = logger;
    }

    public async Task<(string title, string description)> GenerateAsync(GenerateRequest req)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            return GenerateStub(req);

        var userMessage = BuildPrompt(req);
        var payload = new
        {
            model = Model,
            max_tokens = 1024,
            system = new[]
            {
                new { type = "text", text = SystemPrompt, cache_control = new { type = "ephemeral" } }
            },
            messages = new[] { new { role = "user", content = userMessage } }
        };

        var json = JsonSerializer.Serialize(payload);
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("x-api-key", _apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Headers.Add("anthropic-beta", "prompt-caching-2024-07-31");

        var response = await _http.SendAsync(request);
        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var text = doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString() ?? "{}";

        return ParseOutput(text);
    }

    private static string BuildPrompt(GenerateRequest req) =>
        $"""
        Write a Trade Me listing with a {req.Tone} tone.
        Item: {req.Title}
        Category: {req.Category}
        Condition: {req.Condition}
        {(string.IsNullOrWhiteSpace(req.Brand) ? "" : $"Brand: {req.Brand}")}
        Details: {req.Details}
        {(string.IsNullOrWhiteSpace(req.Price) ? "" : $"Price: ${req.Price} NZD")}
        Delivery: {req.Delivery switch { "pickup" => "Pickup only", "shipping" => "Shipping available", _ => "Pickup or shipping available" }}
        """;

    private static (string, string) ParseOutput(string text)
    {
        try
        {
            var start = text.IndexOf('{');
            var end = text.LastIndexOf('}');
            if (start >= 0 && end > start)
                text = text[start..(end + 1)];

            using var doc = JsonDocument.Parse(text);
            var title = doc.RootElement.GetProperty("title").GetString() ?? "";
            var desc  = doc.RootElement.GetProperty("description").GetString() ?? "";
            return (title, desc);
        }
        catch
        {
            return ("Great item for sale!", text);
        }
    }

    private static (string title, string description) GenerateStub(GenerateRequest req) => (
        $"{req.Condition} {req.Title}{(req.Brand != "" ? $" ({req.Brand})" : "")} — {(req.Price != "" ? $"${req.Price}" : "make an offer")}",
        $"""
        🔥 {req.Title} — don't miss this one!

        ✅ Condition: {req.Condition}
        {(req.Brand != "" ? $"✅ Brand: {req.Brand}" : "")}
        ✅ {req.Details}

        {(req.Price != "" ? $"Asking ${req.Price} NZD — price is {(req.Tone == "punchy" ? "firm" : "negotiable for genuine buyers")}." : "Make me a reasonable offer.")}
        {req.Delivery switch { "pickup" => "Pickup only from my location.", "shipping" => "Happy to ship — buyer pays freight.", _ => "Pickup preferred, can discuss shipping." }}

        Questions welcome — fast replies guaranteed! 😊
        """
    );
}

public record GenerateRequest(
    string Title, string Category, string Condition, string Brand,
    string Details, string Price, string Delivery, string Tone);
