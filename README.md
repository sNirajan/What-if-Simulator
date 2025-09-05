# 📈 What‑If Investment Simulator (Factual Backtest)

**Natural language in → deterministic math out.**

A small, production‑leaning app that answers:

> *“What if I invested \$X in TICKER on DATE?”*

It runs a factual **backtest** using **adjusted close** prices (Yahoo Finance), applies transparent rules (trading‑day snapping), and returns reproducible metrics and a time‑series chart. AI can **explain** results in plain English, but **never** changes the numbers.

> **No predictions. No advice. No hallucinations.** All numbers are derived from historical data and deterministic formulas.

---

## 🔗 Live demo

* **App (Vercel):** `https://what-if-simulator-k68m8v13n-nirajan-shahs-projects.vercel.app`


> Note: Free tiers may cold‑start; first request can take a few seconds.

---

##  Project overview

The app + API produces **reproducible backtests** with an interactive chart, CSV export, shareable permalinks (via querystring), and clear assumptions. Designed to be readable, testable, and deployable.

---

##  Current features

* **Deterministic backtests** from **adjusted close** prices (split/dividend aware).
* **Trading‑day snapping:** start → **next** trading day; end → **previous**.
* **Modern UI:** dark theme, keyboard‑friendly, custom SVG chart (no heavy deps).
* **CSV export** of date/price/portfolio value.
* **Permalinks (frontend‑only):** `?ticker&amount&start&end` prefill and **auto‑run once**.
* **AI Explain (optional):** server‑side route summarizes the numeric result in plain English; the model is explicitly instructed to use only the returned JSON.
* **Typed API** with validation (Zod) and friendly errors.
* **Deployable** on free tiers: Vercel (web) + Render (API).

---

##  Tech stack

**Frontend:** Next.js (App Router), React, TypeScript, TailwindCSS, **custom SVG chart**
**Backend:** Node.js + Express + TypeScript, Zod validation
**Data:** Yahoo Finance (adjusted close)
**Storage:** Prisma + Postgres (Neon) - schema present; scenario saving is a roadmap item
**Infra:** Vercel (frontend), Render (backend)
**Testing:** Vitest unit tests for math/date logic


---

##  API

Base: `https://what-if-simulator.onrender.com`

### Health

```http
GET /api/v1/health        → { ok: true, service:"what-if-simulator", version: "0.0.1"}
GET /api/v1/db/health     → { ok: true, model: "Scenario", count: 0 }
```

### Backtest (lump‑sum)

```http
POST /api/v1/backtest
Content-Type: application/json
{
  "ticker": "TSLA",
  "amount": 100,
  "start_date": "2016-01-03",
  "end_date": "2016-12-30",
  "cadence": "lump_sum"
}
```

**Response (shape)**

```json
{
  "series": [{ "date": "2016-01-04", "adj_close": 10.12 }, ...],
  "shares": 6.714113,
  "final_value": 2687.53,
  "total_return_pct": 25.8753,
  "cagr": 0.4373,
  "assumptions": {
    "adjusted_prices": true,
    "dividends_reinvested": true,
    "fees_bps": 0,
    "snap_policy": "start=next, end=previous",
    "effective_start_date": "2016-01-04",
    "effective_end_date": "2016-12-30",
    "source": "yahoo-finance2"
  }
}

```

**Errors**

* `400` invalid input (Zod)
* `422` insufficient provider data after trading‑day snap
* `502` upstream provider error/rate limit

---

## Assumptions & formulas

* **Adjusted prices:** all math uses adjusted close (splits/dividends reflected).
* **Trading‑day snap:** start → **next**, end → **previous**.
* **Shares (lump‑sum):**
  `shares = (amount - fees_fixed) / adj_close(start) * (1 - fees_bps/10000)`
* **Final value:** `shares * adj_close(end)`
* **Total return:** `(final_value - amount) / amount`
* **CAGR:** `(final_value / amount)^(1/years) - 1` where `years = days / 365.25`

 Dividends are implicit via adjusted close; there are no forecasts or Monte‑Carlo simulations in the MVP.

---

##  Quick start (local)

```bash
# 1) clone
git clone https://github.com/sNirajan/what-if-simulator && cd what-if-simulator

# 2) backend
cd backend
cp .env.example .env   # set DATABASE_URL, ALLOWED_ORIGINS, STUB_DATA=false
npm ci
npx prisma generate
npm run dev            # http://localhost:8080

# 3) frontend
cd ../frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
npm ci
npm run dev            # http://localhost:3000
```


##  Roadmap

* Natural‑language parsing → `POST /parse`
* DB‑backed permalinks (`/scenario/:hash`)
* Redis cache, Docker, GitHub Actions CI/CD
* Fees / taxes / CPI toggles; DCA; benchmark compare
* OpenAPI/Swagger docs; alternative data sources (Polygon/Stooq)

---

##  Security & privacy

* AI Explain runs **server‑side only**; API keys are not exposed to the browser.
* The model receives *only* the numeric JSON already shown to the user.
* No user accounts in MVP; no PII stored. Scenario saving is optional/future.

---

##  Author

**Nirajan Shah (Nira)** — [Portfolio](http://nirajanshah.me) · [GitHub](https://github.com/sNirajan) · [itsnirajan99@gmail.com](mailto:itsnirajan99@gmail.com)

---





