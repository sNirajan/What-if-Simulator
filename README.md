# 📈 What-If Investment Simulator (Factual Backtest)
Full-stack web app that delivers reproducible investment backtests from historical data. Built with TypeScript, Node.js, React SPA, PostgreSQL, Redis, and Docker, combining deterministic math with natural-language query parsing for a polished, production-style experience.

**Natural language in → deterministic math out.**  
AI helps with **parsing queries and explaining results**, but **all calculations are deterministic** and based on **historical adjusted close data**.  

No predictions. No hallucinations. Just reproducible backtests.  

---

##  Project Overview
The **What-If Investment Simulator** is a full-stack web app + API that answers questions like:  
**“What if I invested $1,000 in AAPL on Jan 1, 2015?”**  

It produces **factual, reproducible backtests** with interactive charts, CSV export, shareable permalinks, and transparent assumptions (fees, taxes, inflation toggles).  

---

##  Features
-  **Deterministic backtests** → factual outputs from adjusted close prices.  
-  **Natural language parsing** → “What if I invested $X in TICKER on DATE?”  
-  **Interactive charts** → time-series with hover tooltips and benchmark toggles.  
-  **CSV export** → download portfolio performance for offline analysis.  
-  **Permalinks** → share scenarios with unique hashes.  
-  **Customizable** → fees, taxes, inflation (V1 add-ons).  
-  **Reliable APIs** → deterministic formulas, zero silent failures.  

---

##  AI vs Deterministic Math
- **AI is used for:**  
  - Parsing natural language queries into structured parameters.  
  - Explaining results in plain English.  

- **AI is NOT used for:**  
  - Calculations, backtests, or financial outputs.  
  - All numbers are generated from deterministic formulas + historical market data.  

This ensures **accuracy, trust, and reproducibility.**  

---

##  Tech Stack
**Frontend:** Next.js (React), Tailwind CSS, Chart.js/Recharts  
**Backend:** Node.js + Express + TypeScript, Zod validation  
**Data Sources:** Yahoo/Stooq/Polygon APIs (prices), FRED/StatsCan (CPI – V1 add-on)  
**Database:** PostgreSQL (JSONB scenarios), Redis (24h caching)  
**Infra:** Docker, Vercel (frontend), Render/AWS (backend), GitHub Actions CI/CD  
**Testing:** Unit tests for math/date logic  

---

##  API Endpoints (v1)
- `POST /parse` → `{query} → {ticker, amount, start_date, end_date}`  
- `POST /backtest` → `{series, shares, final_value, total_return_pct, cagr}`  
- `POST /explain` → `{inputs, results} → {summary}`  
- `GET /scenario/:hash` → Retrieve saved scenario  

---

##  Core Formulas
- **Shares (lump-sum):** `(amount - fees_fixed) / adj_close(start) * (1 - fees_bps/10000)`  
- **Final Value:** `shares * adj_close(end)`  
- **Total Return:** `(final_value - amount) / amount`  
- **CAGR:** `(final_value / amount)^(1/years) - 1`  
- **DCA (V1):** Monthly contributions accumulated via adjusted close  

---

##  Quick Start

```bash
# Clone repo
git clone https://github.com/sNirajan/what-if-simulator.git
cd what-if-simulator

# Backend setup
cd backend
npm install
npm run dev

# Frontend setup
cd ../frontend
npm install
npm run dev
```

- Frontend → `http://localhost:3000`  
- Backend API → `http://localhost:5000`  


---

##  Non-Functional Goals
-  **Correctness first**: unit tests for formulas and date logic.  
-  **Performance**: Redis caching ensures <5s responses for common queries.  
-  **Security**: Input validation (Zod), rate limiting, CORS.  
-  **Observability**: Logs, error tracking, timing metrics.  
-  **Documentation**: Swagger/OpenAPI + README.  

---

##  Why This Project Matters
This project showcases **end-to-end full-stack engineering**, combining:  
- **Frontend polish** (React SPA, Tailwind, charts).  
- **Backend reliability** (TypeScript APIs, validation, caching).  
- **Modern workflows** (Docker, CI/CD, cloud deployment).  
- **AI integration** (only for UX - parsing & explanations, not numbers).  

It demonstrates the ability to design and deliver a **scalable, production-style system** that balances **user experience, performance, and trustworthiness.**  

---

##  Author
**Nirajan Shah (Nira)**  
[Portfolio](http://nirajanshah.me)  
[GitHub](https://github.com/sNirajan)  
itsnirajan99@gmail.com
