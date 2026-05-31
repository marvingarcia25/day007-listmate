using ListMate.Services;
using Stripe;
using Stripe.Checkout;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<DatabaseService>();
builder.Services.AddSingleton<CreditsService>();
builder.Services.AddHttpClient<ClaudeService>();
builder.Services.AddSingleton<ClaudeService>();

var app = builder.Build();

// Serve React SPA from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

// ── Cookie helpers ────────────────────────────────────────────
const string CookieName = "lm_anon";

string GetOrCreateAnonId(HttpContext ctx)
{
    if (ctx.Request.Cookies.TryGetValue(CookieName, out var existing) && !string.IsNullOrWhiteSpace(existing))
        return existing;
    var id = Guid.NewGuid().ToString("N");
    ctx.Response.Cookies.Append(CookieName, id, new CookieOptions
    {
        HttpOnly = true, SameSite = SameSiteMode.Lax,
        Expires = DateTimeOffset.UtcNow.AddYears(2)
    });
    return id;
}

// ── GET /api/credits ──────────────────────────────────────────
app.MapGet("/api/credits", (HttpContext ctx, CreditsService credits) =>
{
    var anonId = GetOrCreateAnonId(ctx);
    var snap = credits.GetSnapshot(anonId);
    return Results.Ok(new { snap.FreeRemaining, snap.PaidCredits, snap.Email });
});

// ── POST /api/generate ────────────────────────────────────────
app.MapPost("/api/generate", async (HttpContext ctx, GenerateRequest req, ClaudeService claude, CreditsService credits, DatabaseService db) =>
{
    var anonId = GetOrCreateAnonId(ctx);
    if (!credits.TryConsume(anonId))
        return Results.StatusCode(402); // Payment Required

    db.LogUsage(anonId, null, "generate");

    var (title, description) = await claude.GenerateAsync(req);
    return Results.Ok(new { title, description });
});

// ── POST /api/checkout ────────────────────────────────────────
var packs = new Dictionary<string, (int credits, long priceCents)>
{
    ["pack_20"]  = (20,  500),
    ["pack_50"]  = (50,  1000),
    ["pack_120"] = (120, 2000),
};

app.MapPost("/api/checkout", async (HttpContext ctx, CheckoutRequest req, CreditsService credits, DatabaseService db) =>
{
    var stripeKey = app.Configuration["Stripe:SecretKey"];

    // Dev stub — no real Stripe key configured
    if (string.IsNullOrWhiteSpace(stripeKey))
    {
        if (!packs.TryGetValue(req.PackId, out var stubPack)) return Results.BadRequest("Unknown pack");
        var anonId = GetOrCreateAnonId(ctx);
        credits.AddPaidCredits(req.Email, stubPack.credits);
        db.LinkTrialToEmail(anonId, req.Email);
        db.LogUsage(anonId, req.Email, $"simulate_purchase:{req.PackId}");
        return Results.Ok(new { simulated = true, creditsAdded = stubPack.credits });
    }

    // Real Stripe Checkout
    if (!packs.TryGetValue(req.PackId, out var pack)) return Results.BadRequest("Unknown pack");
    StripeConfiguration.ApiKey = stripeKey;

    var options = new SessionCreateOptions
    {
        PaymentMethodTypes = ["card"],
        LineItems =
        [
            new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "nzd",
                    UnitAmount = pack.priceCents,
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = $"ListMate — {pack.credits} listings",
                    }
                },
                Quantity = 1,
            }
        ],
        Mode = "payment",
        CustomerEmail = req.Email,
        Metadata = new Dictionary<string, string>
        {
            ["packId"] = req.PackId,
            ["email"]  = req.Email,
            ["anonId"] = GetOrCreateAnonId(ctx),
        },
        SuccessUrl = $"{ctx.Request.Scheme}://{ctx.Request.Host}/?success=1",
        CancelUrl  = $"{ctx.Request.Scheme}://{ctx.Request.Host}/",
    };

    var service = new SessionService();
    var session = await service.CreateAsync(options);
    return Results.Ok(new { url = session.Url });
});

// ── POST /api/webhook (Stripe) ────────────────────────────────
app.MapPost("/api/webhook", async (HttpContext ctx, IConfiguration config, CreditsService credits, DatabaseService db) =>
{
    var secret = config["Stripe:WebhookSecret"];
    if (string.IsNullOrWhiteSpace(secret)) return Results.Ok(); // not configured

    var payload = await new StreamReader(ctx.Request.Body).ReadToEndAsync();
    var sig = ctx.Request.Headers["Stripe-Signature"].ToString();

    try
    {
        var evt = EventUtility.ConstructEvent(payload, sig, secret);
        if (evt.Type == "checkout.session.completed")
        {
            var session = (Session)evt.Data.Object;
            var email   = session.Metadata["email"];
            var packId  = session.Metadata["packId"];
            var anonId  = session.Metadata.GetValueOrDefault("anonId");

            if (packs.TryGetValue(packId, out var pack))
            {
                credits.AddPaidCredits(email, pack.credits);
                if (anonId is not null)
                {
                    db.LinkTrialToEmail(anonId, email);
                    db.LogUsage(anonId, email, $"purchase:{packId}");
                }
            }
        }
        return Results.Ok();
    }
    catch
    {
        return Results.BadRequest();
    }
});

// ── Fallback → React SPA ──────────────────────────────────────
app.MapFallbackToFile("index.html");

app.Run();

record CheckoutRequest(string PackId, string Email);
