// src/lib/heliusApi.ts
import { format } from "date-fns";

const HELIUS_API_KEY = "fa43e2c8-81f4-4b61-96b7-534ed874139b";
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const HELIUS_REST    = "https://api.helius.xyz";
const COINGECKO_URL  = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

export interface DailyPnl { date: string; netUsd: number }
export interface WalletMetrics {
  totalPnL: number; totalPnLPercentage: number; winRate: number;
  totalTrades: number; avgTrade: number; bestTrade: number; worstTrade: number;
  currentValue: number; nativeBalance: number; tokenAccounts: number;
  nftCount: number; dailyPnl: DailyPnl[];
}

/* ---------------- Hilfsfunktionen ---------------- */
const lamportsToSol = (l: number) => l / 1_000_000_000;
const rpc = async <T>(method: string, params: any[]): Promise<T> => {
  const r = await fetch(HELIUS_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  if (!r.ok) throw new Error(`${method} HTTP ${r.status}`);
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result as T;
};
const getSolPrice = async () => (await (await fetch(COINGECKO_URL)).json()).solana.usd;

/* Enhanced-Transactions → REST-Host ---------------- */
const getTxs = async (addr: string) => {
  const url = `${HELIUS_REST}/v0/addresses/${addr}/transactions?api-key=${HELIUS_API_KEY}&limit=99`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`tx HTTP ${r.status}`);
  return r.json() as Promise<
    { timestamp: number; accountData: { account: string; nativeBalanceChange: number }[] }[]
  >;
};

/* ---------------- Hauptfunktion ------------------- */
export async function fetchWalletData(addr: string): Promise<WalletMetrics> {
  /* 1) Balance / Token-Accounts */
  const bal  = await rpc<{ value: number }>("getBalance", [addr]);
  const sol  = lamportsToSol(bal.value);

  const toks = await rpc<{ value: unknown[] }>("getTokenAccountsByOwner", [
    addr,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);
  const tokenAccounts = toks.value.length;
  const nftCount = Math.floor(tokenAccounts * 0.3);

  /* 2) Enhanced Transactions */
  const txs = await getTxs(addr);
  let totalTrades = 0, wins = 0, bestSol = -Infinity, worstSol = Infinity, pnlSol = 0;
  const daily = new Map<string, number>();

  for (const tx of txs) {
    const a = tx.accountData.find((d) => d.account === addr);
    if (!a) continue;
    const dSol = lamportsToSol(a.nativeBalanceChange);
    if (dSol === 0) continue;

    const key = format(new Date(tx.timestamp * 1000), "yyyy-MM-dd");
    daily.set(key, (daily.get(key) || 0) + dSol);

    if (Math.abs(dSol) > 0.0001) {
      totalTrades++; if (dSol > 0) wins++;
      bestSol = Math.max(bestSol, dSol); worstSol = Math.min(worstSol, dSol);
      pnlSol += dSol;
    }
  }

  /* 3) USD-Konvertierung */
  const price = await getSolPrice();
  const pnlUsd = pnlSol * price;
  const valueUsd = sol * price;

  /* 4) 90-Tage-Serie */
  const today = new Date();
  const dailyPnl: DailyPnl[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(); d.setDate(today.getDate() - i);
    const k = format(d, "yyyy-MM-dd");
    dailyPnl.push({ date: k, netUsd: (daily.get(k) || 0) * price });
  }
  dailyPnl.reverse();

  return {
    totalPnL: pnlUsd,
    totalPnLPercentage: valueUsd ? (pnlUsd / (valueUsd - pnlUsd)) * 100 : 0,
    winRate: totalTrades ? (wins / totalTrades) * 100 : 0,
    totalTrades,
    avgTrade: totalTrades ? pnlUsd / totalTrades : 0,
    bestTrade: bestSol * price,
    worstTrade: worstSol * price,
    currentValue: valueUsd,
    nativeBalance: sol,
    tokenAccounts,
    nftCount,
    dailyPnl
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
  totalPnL: 0,
  totalPnLPercentage: 0,
  winRate: 0,
  totalTrades: 0,
  avgTrade: 0,
  bestTrade: 0,
  worstTrade: 0,
  currentValue: 0,
  nativeBalance: 0,
  tokenAccounts: 0,
  nftCount: 0,
  dailyPnl: []
});
