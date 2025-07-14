// src/lib/heliusApi.ts
import { differenceInCalendarDays, format } from "date-fns"; // npm i date-fns

/* ← Free-Plan-Key bleibt hart codiert */
const HELIUS_API_KEY = "fa43e2c8-81f4-4b61-96b7-534ed874139b";
const HELIUS_BASE    = "https://api.helius.xyz";
const COINGECKO_URL  =
  "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

export interface DailyPnl { date: string; netUsd: number }
export interface WalletMetrics {
  totalPnL: number;          // USD
  totalPnLPercentage: number;
  winRate: number;
  totalTrades: number;
  avgTrade: number;
  bestTrade: number;
  worstTrade: number;
  currentValue: number;      // USD
  nativeBalance: number;     // SOL
  tokenAccounts: number;
  nftCount: number;
  dailyPnl: DailyPnl[];
}

/* ------------------- interne Hilfsfunktionen ------------------- */
const lamportsToSol = (lamports: number) => lamports / 1_000_000_000;

async function getSolPriceUsd(): Promise<number> {
  const r = await fetch(COINGECKO_URL);
  const j = await r.json();
  return j.solana.usd;
}

async function heliusRpc<T>(method: string, params: any[]): Promise<T> {
  const res = await fetch(
    `${HELIUS_BASE}/v0/rpc/${method}?api-key=${HELIUS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    }
  );
  if (!res.ok) throw new Error(`${method} HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result as T;
}

async function getEnhancedTxs(address: string) {
  const url = `${HELIUS_BASE}/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=1000`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`tx HTTP ${r.status}`);
  return r.json() as Promise<
    {
      timestamp: number;
      accountData: { account: string; nativeBalanceChange: number }[];
    }[]
  >;
}

/* ----------------------- Hauptfunktion ------------------------- */
export async function fetchWalletData(addr: string): Promise<WalletMetrics> {
  /* 1 Saldo & Token-Accounts ─ reine RPC-Credits */
  const bal  = await heliusRpc<{ value: number }>("getBalance", [addr]);             // :contentReference[oaicite:2]{index=2}
  const sol  = lamportsToSol(bal.value);
  const toks = await heliusRpc<{ value: unknown[] }>("getTokenAccountsByOwner", [
    addr,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);:contentReference[oaicite:3]{index=3}
  const tokenAccounts = toks.value.length;
  const nftCount      = Math.floor(tokenAccounts * 0.3);

  /* 2 Enhanced Transactions ─ 1 Credit/1000 Tx */
  const txs = await getEnhancedTxs(addr);:contentReference[oaicite:4]{index=4}

  let totalTrades = 0,
      wins        = 0,
      bestSol     = -Infinity,
      worstSol    =  Infinity,
      pnlSol      = 0;

  const daily = new Map<string, number>(); // yyyy-MM-dd → netto SOL

  for (const tx of txs) {
    const acc = tx.accountData.find((a) => a.account === addr);
    if (!acc) continue;
    const Δsol = lamportsToSol(acc.nativeBalanceChange);
    if (Δsol === 0) continue;

    const key = format(new Date(tx.timestamp * 1000), "yyyy-MM-dd");
    daily.set(key, (daily.get(key) || 0) + Δsol);

    if (Math.abs(Δsol) > 0.0001) {
      totalTrades++;
      if (Δsol > 0) wins++;
      bestSol  = Math.max(bestSol,  Δsol);
      worstSol = Math.min(worstSol, Δsol);
      pnlSol  += Δsol;
    }
  }

  /* 3 USD-Werte */
  const price      = await getSolPriceUsd();:contentReference[oaicite:5]{index=5}
  const pnlUsd     = pnlSol * price;
  const bestUsd    = bestSol  * price;
  const worstUsd   = worstSol * price;
  const valueUsd   = sol * price;
  const avgUsd     = totalTrades ? pnlUsd / totalTrades : 0;
  const pnlPct     = valueUsd ? (pnlUsd / (valueUsd - pnlUsd)) * 100 : 0;
  const winRatePct = totalTrades ? (wins / totalTrades) * 100 : 0;

  /* 4 letzte 90 Tage für Chart & Calendar */
  const today  = new Date();
  const dailyPnl: DailyPnl[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const k = format(d, "yyyy-MM-dd");
    dailyPnl.push({ date: k, netUsd: (daily.get(k) || 0) * price });
  }
  dailyPnl.reverse();

  return {
    totalPnL: pnlUsd,
    totalPnLPercentage: pnlPct,
    winRate: winRatePct,
    totalTrades,
    avgTrade: avgUsd,
    bestTrade: bestUsd,
    worstTrade: worstUsd,
    currentValue: valueUsd,
    nativeBalance: sol,
    tokenAccounts,
    nftCount,
    dailyPnl,
  };
}

/* ---------------- Mock-Fallbacks ---------------- */
export const getMockWalletData = () => ({
  totalPnL:  12345,
  totalPnLPercentage: 12.3,
  winRate:   60,
  totalTrades: 200,
  avgTrade:  61.7,
  bestTrade: 800,
  worstTrade:-500,
  currentValue: 32000,
  nativeBalance: 180,
  tokenAccounts: 25,
  nftCount: 7,
  dailyPnl: [],
});
export const getEmptyWalletData = () => ({
  totalPnL:0,totalPnLPercentage:0,winRate:0,totalTrades:0,avgTrade:0,
  bestTrade:0,worstTrade:0,currentValue:0,nativeBalance:0,tokenAccounts:0,
  nftCount:0,dailyPnl:[]
});
