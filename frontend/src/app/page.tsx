'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { postBacktest, type BacktestResponse } from '../lib/api';

/**
 * What‑If Simulator — Dark, modern UI (all upgrades)
 * - Semantic number colors (green/red for % returns), consistent formatting
 * - Accessible focus rings, keyboard submit, disabled states
 * - SVG chart with y‑padding, last‑value badge, hover tooltip
 * - "Backtest (factual)" badge, data source + timestamp
 * - Download CSV + Copy Permalink actions
 */
export default function Page() {
  // ---- Form state ----
  const [ticker, setTicker] = useState('TSLA');
  const [amount, setAmount] = useState<number>(100);
  const [start, setStart] = useState('2016-01-03');
  const [end, setEnd] = useState('2025-01-30');

  // ---- Request state ----
  const [data, setData] = useState<BacktestResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [queriedAt, setQueriedAt] = useState<string>('');

  // ---- Helpers ----
  const fmtCurrency = (n: number) =>
    n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

  async function runBacktest() {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await postBacktest({
        ticker,
        amount: Number(amount),
        start_date: start,
        end_date: end,
        cadence: 'lump_sum',
      });
      setData(res);
      setQueriedAt(new Date().toLocaleString());
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  // keyboard submit on Enter anywhere in form
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!loading) void runBacktest();
    }
  }

  // Derive chart data lazily from the API response
  const chartData = useMemo(() => {
    if (!data) return [] as { date: string; value: number }[];
    return data.series.map((p) => ({ date: p.date, value: p.adj_close * data.shares }));
  }, [data]);

  // CSV: date, adj_close, shares, value
  function downloadCSV() {
    if (!data) return;
    const header = 'date,adj_close,shares,value\n';
    const rows = data.series
      .map((p) => `${p.date},${p.adj_close},${data.shares},${(p.adj_close * data.shares).toFixed(6)}`)
      .join('\n');
    const csv = header + rows + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticker.toUpperCase()}_${start}_${end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Permalink via query params (client-side; later we can back it by a saved scenario hash)
  async function copyPermalink() {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const q = new URLSearchParams({ ticker, amount: String(amount), start, end }).toString();
    const link = `${origin}?${q}`;
    await navigator.clipboard.writeText(link);
    // Small toast substitute
    setError('');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
      {/* subtle radial accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_50%_-20%,rgba(59,130,246,0.12),transparent),radial-gradient(40rem_30rem_at_80%_-10%,rgba(168,85,247,0.10),transparent)]" />

      <section className="relative mx-auto max-w-6xl px-6 py-10" onKeyDown={onKeyDown}>
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">What‑If Simulator</h1>
            <p className="mt-1 text-sm text-zinc-400">
              <Badge>Backtest (factual)</Badge> Prices: Yahoo Finance (adjusted close)
              {queriedAt && <span className="ml-2 text-zinc-500">· {queriedAt}</span>}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              <span className="text-zinc-300">Start</span> snaps to <span className="text-zinc-200">next</span>
              {' '}trading day, <span className="text-zinc-300">end</span> to <span className="text-zinc-200">previous</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSV}
              disabled={!data}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 shadow transition hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              Download CSV
            </button>
            <button
              onClick={copyPermalink}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 shadow transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              Copy Permalink
            </button>
          </div>
        </header>

        {/* Form */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ticker">
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder-zinc-400 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g., TSLA"
            />
          </Field>
          <Field label="Amount (USD)">
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder-zinc-400 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </Field>
          <Field label="Start (YYYY‑MM‑DD)">
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder-zinc-400 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="End (YYYY‑MM‑DD)">
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder-zinc-400 outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>

          <div className="sm:col-span-2 mt-1 flex items-center gap-3">
            <button
              onClick={runBacktest}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-900/30 transition hover:from-indigo-400 hover:to-violet-400 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              {loading ? 'Running…' : 'Run backtest'}
            </button>
            {data && (
              <span className="text-xs text-zinc-400">
                Effective: <strong>{data.assumptions.effective_start_date}</strong> →{' '}
                <strong>{data.assumptions.effective_end_date}</strong>
              </span>
            )}
            {error && (
              <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-300">
                {error}
              </span>
            )}
          </div>
        </div>

        {/* Results */}
        {data && (
          <section className="mt-8 grid gap-4 lg:grid-cols-3">
            <InfoCard title="Window">
              <div className="text-sm text-zinc-200">
                <strong>{data.assumptions.effective_start_date}</strong> →{' '}
                <strong>{data.assumptions.effective_end_date}</strong>
              </div>
              <div className="mt-1 text-[11px] text-zinc-400">{data.assumptions.snap_policy}</div>
              <div className="mt-3 text-[11px] text-zinc-400">Fees: {data.assumptions.fees_bps} bps</div>
            </InfoCard>

            <StatCard label="Final value" value={fmtCurrency(data.final_value)} />
            <StatCard
              label="Total return"
              value={fmtPct(data.total_return_pct)}
              type="pct"
              raw={data.total_return_pct}
            />
            <StatCard label="CAGR" value={fmtPct(data.cagr)} type="pct" raw={data.cagr} />
            <StatCard label="Shares" value={data.shares.toFixed(6)} />

            {/* Chart */}
            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Portfolio value</div>
              <ValueChart data={chartData} />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-2 inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="text-xs uppercase tracking-wide text-zinc-400">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function StatCard({ label, value, type, raw }: { label: string; value: string; type?: 'pct' | 'plain'; raw?: number }) {
  const color = type === 'pct' && typeof raw === 'number' ? (raw >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-zinc-100';
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-2 h-1.5 w-14 rounded-full bg-gradient-to-r from-indigo-500/30 to-fuchsia-400/10" />
      <div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

// --- SVG Chart with tooltip & last‑value badge ---
function ValueChart({ data }: { data: { date: string; value: number }[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);

  if (!data.length) return <div className="text-sm text-zinc-400">No data</div>;

  const w = 900;
  const h = 240;
  const pad = 28;
  const values = data.map((d) => d.value);
  const minRaw = Math.min(...values);
  const maxRaw = Math.max(...values);
  const padY = Math.max((maxRaw - minRaw) * 0.08, 1e-6);
  const min = minRaw - padY;
  const max = maxRaw + padY;

  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);

  const dPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`)
    .join(' ');

  const last = data[data.length - 1];
  const lastY = y(last.value);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current!.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    // map relX to nearest index
    const t = Math.min(Math.max((relX - pad) / (w - pad * 2), 0), 1);
    const i = Math.round(t * (data.length - 1));
    setHover({ i, x: x(i), y: y(data[i].value) });
  }

  function onLeave() { setHover(null); }

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} className="h-60 w-full" onMouseMove={onMove} onMouseLeave={onLeave}>
        <defs>
          <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.0)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={w} height={h} fill="transparent" />
        {/* area fill */}
        <path d={`${dPath} L ${x(data.length - 1)} ${h - pad} L ${x(0)} ${h - pad} Z`} fill="url(#grad)" />
        {/* main line */}
        <path d={dPath} stroke="rgb(99,102,241)" strokeWidth="2" fill="none" />
        {/* last-value badge */}
        <circle cx={w - pad} cy={lastY} r={3} fill="rgb(99,102,241)" />
        <text x={w - pad - 8} y={lastY - 8} textAnchor="end" className="fill-zinc-300 text-[10px]">
          {last.value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
        </text>
        {/* hover marker */}
        {hover && (
          <>
            <line x1={hover.x} x2={hover.x} y1={pad} y2={h - pad} stroke="rgba(148,163,184,0.35)" />
            <circle cx={hover.x} cy={hover.y} r={3} fill="rgb(99,102,241)" />
          </>
        )}
      </svg>

      {/* tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-md border border-white/10 bg-zinc-900/90 px-2 py-1 text-[11px] text-zinc-200 shadow-lg backdrop-blur"
          style={{ left: `${hover.x}px`, top: `${hover.y - 34}px` }}
        >
          <div className="font-medium">{data[hover.i].date}</div>
          <div>
            {data[hover.i].value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
        </div>
      )}

      <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
        <span>{data[0].date}</span>
        <span>{last.date}</span>
      </div>
    </div>
  );
}



// 'use client';

// import { useMemo, useState } from 'react';
// import { postBacktest, type BacktestResponse } from '../lib/api'; // adjust path if your app/ is not under src/

// /**
//  * What‑If Simulator — Dark, modern UI
//  *
//  * Teaching notes (why these choices?):
//  * - We keep state + single submit handler in this page (MVP). Later we can lift to a store.
//  * - Cards use "glass" styling (bg-white/5 + backdrop-blur) for depth against a dark gradient.
//  * - Chart renders portfolio VALUE over time (shares * adj_close) — more meaningful than price alone.
//  * - Motion-free MVP (no extra deps); you can add framer‑motion later for micro‑animations.
//  */
// export default function Page() {
//   // ---- Form state ----
//   const [ticker, setTicker] = useState('TSLA');
//   const [amount, setAmount] = useState<number>(100);
//   const [start, setStart] = useState('2016-01-03');
//   const [end, setEnd] = useState('2025-01-30');

//   // ---- Request state ----
//   const [data, setData] = useState<BacktestResponse | null>(null);
//   const [error, setError] = useState<string>('');
//   const [loading, setLoading] = useState(false);

//   // Format helpers keep the JSX clean
//   const fmtCurrency = (n: number) =>
//     n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
//   const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

//   async function runBacktest() {
//     setLoading(true);
//     setError('');
//     setData(null);
//     try {
//       const res = await postBacktest({
//         ticker,
//         amount: Number(amount),
//         start_date: start,
//         end_date: end,
//         cadence: 'lump_sum',
//       });
//       setData(res);
//     } catch (e: unknown) {
//       if (e instanceof Error) {
//         setError(e.message);
//       } else {
//         setError('Something went wrong');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Derive chart data lazily from the API response
//   const chartData = useMemo(() => {
//     if (!data) return [] as { date: string; value: number }[];
//     return data.series.map((p) => ({ date: p.date, value: p.adj_close * data.shares }));
//   }, [data]);

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
//       {/* Top accent grid for subtle texture */}
//       <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_50%_-20%,rgba(59,130,246,0.15),transparent),radial-gradient(40rem_30rem_at_80%_-10%,rgba(168,85,247,0.12),transparent)]" />

//       <section className="relative mx-auto max-w-5xl px-6 py-10">
//         {/* Header */}
//         <header className="mb-8">
//           <h1 className="text-3xl font-semibold tracking-tight">What‑If Simulator</h1>
//           <p className="mt-2 text-sm text-zinc-400">
//             Deterministic backtests using adjusted close prices. <span className="text-zinc-300">Start</span> snaps to
//             <span className="text-zinc-200"> next</span> trading day, <span className="text-zinc-300">end</span> to
//             <span className="text-zinc-200"> previous</span>.
//           </p>
//         </header>

//         {/* Panel: form */}
//         <div className="grid gap-4 sm:grid-cols-2">
//           <Field label="Ticker">
//             <input
//               className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder-zinc-400 outline-none ring-0 transition focus:border-indigo-400/60 focus:bg-white/10"
//               value={ticker}
//               onChange={(e) => setTicker(e.target.value)}
//               placeholder="e.g., TSLA"
//             />
//           </Field>
//           <Field label="Amount (USD)">
//             <input
//               className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder-zinc-400 outline-none transition focus:border-indigo-400/60 focus:bg-white/10"
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(Number(e.target.value))}
//             />
//           </Field>
//           <Field label="Start (YYYY‑MM‑DD)">
//             <input
//               className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder-zinc-400 outline-none transition focus:border-indigo-400/60 focus:bg-white/10"
//               value={start}
//               onChange={(e) => setStart(e.target.value)}
//             />
//           </Field>
//           <Field label="End (YYYY‑MM‑DD)">
//             <input
//               className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder-zinc-400 outline-none transition focus:border-indigo-400/60 focus:bg-white/10"
//               value={end}
//               onChange={(e) => setEnd(e.target.value)}
//             />
//           </Field>

//           <div className="sm:col-span-2 mt-1 flex items-center gap-3">
//             <button
//               onClick={runBacktest}
//               disabled={loading}
//               className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-900/30 transition hover:from-indigo-400 hover:to-violet-400 disabled:opacity-60"
//             >
//               {loading ? 'Running…' : 'Run backtest'}
//             </button>
//             {error && (
//               <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-300">
//                 {error}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Results */}
//         {data && (
//           <section className="mt-8 grid gap-4 lg:grid-cols-3">
//             {/* Effective window + assumptions */}
//             <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
//               <div className="text-xs uppercase tracking-wide text-zinc-400">Window</div>
//               <div className="mt-1 text-sm text-zinc-200">
//                 <strong>{data.assumptions.effective_start_date}</strong> →{' '}
//                 <strong>{data.assumptions.effective_end_date}</strong>
//               </div>
//               <div className="mt-1 text-[11px] text-zinc-400">{data.assumptions.snap_policy}</div>
//               <div className="mt-3 text-[11px] text-zinc-400">Fees: {data.assumptions.fees_bps} bps</div>
//             </div>

//             {/* Stat cards */}
//             <StatCard label="Final value" value={fmtCurrency(data.final_value)} accent="indigo" />
//             <StatCard label="Total return" value={fmtPct(data.total_return_pct)} accent="violet" />
//             <StatCard label="CAGR" value={fmtPct(data.cagr)} accent="emerald" />
//             <StatCard label="Shares" value={data.shares.toFixed(6)} accent="sky" />

//             {/* Chart */}
//             <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
//               <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Portfolio value</div>
//               <Chart data={chartData} />
//             </div>
//           </section>
//         )}
//       </section>
//     </main>
//   );
// }

// function Field({ label, children }: { label: string; children: React.ReactNode }) {
//   return (
//     <label className="flex flex-col gap-1">
//       <span className="text-xs text-zinc-400">{label}</span>
//       {children}
//     </label>
//   );
// }

// function StatCard({ label, value, accent }: { label: string; value: string; accent: 'indigo' | 'violet' | 'emerald' | 'sky' }) {
//   const ring = {
//     indigo: 'from-indigo-500/30 to-indigo-400/10',
//     violet: 'from-violet-500/30 to-fuchsia-400/10',
//     emerald: 'from-emerald-500/30 to-teal-400/10',
//     sky: 'from-sky-500/30 to-cyan-400/10',
//   }[accent];

//   return (
//     <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
//       <div className="mb-2 h-1.5 w-14 rounded-full bg-gradient-to-r {ring}" />
//       <div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
//       <div className="mt-1 text-2xl font-semibold text-zinc-100">{value}</div>
//     </div>
//   );
// }

// // Lightweight SVG chart — keeps dependencies minimal
// function Chart({ data }: { data: { date: string; value: number }[] }) {
//   // If you prefer Recharts/Chart.js, swap this component later.
//   if (!data.length) return <div className="text-sm text-zinc-400">No data</div>;

//   // Map to simple points
//   const w = 900; // logical width
//   const h = 220; // logical height
//   const pad = 24; // padding for axes
//   const values = data.map((d) => d.value);
//   const min = Math.min(...values);
//   const max = Math.max(...values);
//   const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
//   const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
//   const path = data
//     .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`)
//     .join(' ');

//   const last = data[data.length - 1];

//   return (
//     <div className="relative">
//       <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
//         {/* background grid */}
//         <defs>
//           <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
//             <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
//             <stop offset="100%" stopColor="rgba(99,102,241,0.0)" />
//           </linearGradient>
//         </defs>
//         <rect x="0" y="0" width={w} height={h} fill="transparent" />
//         {/* area fill */}
//         <path d={`${path} L ${x(data.length - 1)} ${h - pad} L ${x(0)} ${h - pad} Z`} fill="url(#grad)" />
//         {/* line */}
//         <path d={path} stroke="rgb(99,102,241)" strokeWidth="2" fill="none" />
//       </svg>
//       <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
//         <span>{data[0].date}</span>
//         <span>{last.date}</span>
//       </div>
//     </div>
//   );
// }
