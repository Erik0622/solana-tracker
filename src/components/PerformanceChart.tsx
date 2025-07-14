/* -----------------------------------------------------------------
   src/components/PerformanceChart.tsx
   Visualisiert echte Tages-P & L-Werte mit Recharts
   ----------------------------------------------------------------*/
import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

/* -----------------------------------------------------------------
   Datentyp – kommt direkt aus fetchWalletData → dailyPnl
   ----------------------------------------------------------------*/
export interface DailyPoint {
  date: string;      // "YYYY-MM-DD"
  netUsd: number;    // Tages-P & L in USD (positiv / negativ)
}

interface PerformanceChartProps {
  series: DailyPoint[];   // komplette 90-Tage-Historie
}

/* -----------------------------------------------------------------
   Hilfsfunktionen
   ----------------------------------------------------------------*/
const TIMEFRAMES = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  ALL: Infinity,
} as const;

const formatXAxis = (iso: string) =>
  format(parseISO(iso), "MMM d");                              /* date-fns ✔ :contentReference[oaicite:0]{index=0} */

/* -----------------------------------------------------------------
   Reusable Tooltip
   ----------------------------------------------------------------*/
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const usd = payload[0].value as number;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-medium">{formatXAxis(label)}</p>
        <p className="text-primary">
          {usd >= 0 ? "+" : "−"}${Math.abs(usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

/* -----------------------------------------------------------------
   Haupt-Komponente
   ----------------------------------------------------------------*/
export const PerformanceChart = ({ series }: PerformanceChartProps) => {
  const [timeFrame, setTimeFrame] = useState<keyof typeof TIMEFRAMES>("30D");

  /* Gefilterte Daten für das gewählte Zeitfenster ------------------ */
  const data = useMemo(() => {
    const limit = TIMEFRAMES[timeFrame];
    return limit === Infinity ? series : series.slice(-limit);         /* Array-Slicing ✔ :contentReference[oaicite:1]{index=1} */
  }, [series, timeFrame]);

  /* Skalen --------------------------------------------------------- */
  const vals = data.map((d) => d.netUsd);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = (max - min) * 0.1 || 1;   // bei flacher Kurve etwas Polster

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Portfolio Performance</span>
          <div className="flex space-x-1">
            {(Object.keys(TIMEFRAMES) as (keyof typeof TIMEFRAMES)[]).map((tf) => (
              <Button
                key={tf}
                variant={timeFrame === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeFrame(tf)}
                className="h-8 px-3 text-xs"
              >
                {tf}
              </Button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {/* Recharts AreaChart API ✔ :contentReference[oaicite:2]{index=2} */}
            <AreaChart data={data}>
              <defs>
                <linearGradient id="pnlColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[min - pad, max + pad]}
                tickFormatter={(v) =>
                  `${v < 0 ? "–" : ""}$${Math.abs(v / 1_000).toFixed(0)}k`
                }
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="netUsd"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#pnlColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
