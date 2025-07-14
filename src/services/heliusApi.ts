// src/lib/heliusApi.ts

const HELIUS_API_KEY = "fa43e2c8-81f4-4b61-96b7-534ed874139b";
// Helius erwartet den Key als Query-Parameter:
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export interface WalletMetrics {
  totalPnL: number;
  totalPnLPercentage: number;
  winRate: number;
  totalTrades: number;
  avgTrade: number;
  bestTrade: number;
  worstTrade: number;
  currentValue: number;
  nativeBalance: number;
  tokenAccounts: number;
  nftCount: number;
}

async function heliusRpc<T>(method: string, params: any[]): Promise<T> {
  const res = await fetch(HELIUS_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(`RPC Error: ${data.error.message}`);
  }
  return data.result as T;
}

export const fetchWalletData = async (walletAddress: string): Promise<WalletMetrics> => {
  try {
    // 1) Native SOL-Balance (Lamports → SOL)
    const balanceResult = await heliusRpc<{ value: number }>("getBalance", [walletAddress]);
    const solBalance = (balanceResult.value || 0) / 1e9;

    // 2) Token-Accounts zählen
    const tokenResult = await heliusRpc<{ value: unknown[] }>(
      "getTokenAccountsByOwner",
      [
        walletAddress,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed" },
      ]
    );
    const tokenAccounts = tokenResult.value.length;

    // 3) (Optional) NFT-Count – hier als 30 % der Token-Accounts
    const nftCount = Math.floor(tokenAccounts * 0.3);

    // 4) Portfolio-Wert schätzen (Sol-Preis müsste live kommen)
    const solPriceUSD = 100;
    const currentValue = solBalance * solPriceUSD;

    // 5) Metriken („Mock-PNL“) – ersetze hier später durch echte Trades/PNL aus Helius
    const totalTrades = Math.max(10, tokenAccounts * 5 + Math.floor(Math.random() * 100));
    const winRate = 45 + Math.random() * 35;
    const avgTrade = currentValue / totalTrades;
    const totalPnL = currentValue * (0.1 + Math.random() * 0.4);
    const totalPnLPercentage = (totalPnL / (currentValue - totalPnL)) * 100;
    const bestTrade = avgTrade * (5 + Math.random() * 10);
    const worstTrade = -avgTrade * (2 + Math.random() * 5);

    return {
      totalPnL,
      totalPnLPercentage,
      winRate,
      totalTrades,
      avgTrade,
      bestTrade,
      worstTrade,
      currentValue,
      nativeBalance: solBalance,
      tokenAccounts,
      nftCount,
    };
  } catch (err) {
    console.error("Error fetching wallet data:", err);
    throw err;
  }
};

// Falls du einen lokalen Fallback möchtest:
export const getMockWalletData = (): WalletMetrics => ({
  totalPnL: 12435.67,
  totalPnLPercentage: 24.5,
  winRate: 68.2,
  totalTrades: 247,
  avgTrade: 50.34,
  bestTrade: 2840.12,
  worstTrade: -1250.45,
  currentValue: 63285.43,
  nativeBalance: 15.7,
  tokenAccounts: 23,
  nftCount: 7,
});

export const getEmptyWalletData = (): WalletMetrics => ({
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
});
