# day7_ListMate — AI Marketplace Listing Writer

Describe what you're selling; get a polished title and description back.

ListMate turns a few details about an item into a conversion-focused marketplace listing using Claude. It's a complete little product around that one feature: free trial credits, paid credit packs via Stripe, rate limiting, and usage logging — all keyed to an anonymous session cookie, no login required.

## What it does

- Generate a listing **title + description** from item details (Claude Haiku)
- Anonymous sessions via cookie — no sign-up
- Free trial credits, then **Stripe** credit packs (priced in NZD)
- Per-session rate limiting (5/min) and SQLite usage logging

## Stack

- ASP.NET Core (minimal API, .NET 8)
- React + Vite + Tailwind (ClientApp builds into `wwwroot`)
- Anthropic Claude API; Stripe Checkout + webhook
- SQLite

## Running it

```
cd ClientApp && npm install && npm run build && cd ..
dotnet run
```

Without an `Anthropic:ApiKey` it falls back to a stub generator; without a `Stripe:SecretKey` checkout is simulated. Set keys in `appsettings.json` or user-secrets.

---

Day 7 of building a small thing every day.
