/* -----------------------------------------------------------------
   src/components/PnLCalendar.tsx
   Vollständige Version mit echten Tages-P&L-Werten
   ----------------------------------------------------------------*/

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

/* ----------------------------- Typen ---------------------------- */
export interface DailyPoint {
  date: string;   // "YYYY-MM-DD"
  netUsd: number; // + / –  Tages-P&L in USD
}

interface CalendarProps {
  data: DailyPoint[];      // 90-Tage-Serie aus fetchWalletData.dailyPnl
}

/* ----------------- Farb-Intensität (Profit/Loss) --------------- */
const getColorStyle = (v: number) => {
  const max = 800, min = -500;                             // Skala für Opazität
  if (v > 0) {
    const t = Math.min(v / max, 1);
    return {
      backgroundColor: `hsl(142 76% 36% / ${0.1 + t * 0.7})`,
      color: t > 0.5 ? "hsl(var(--profit-foreground))" : "hsl(var(--foreground))",
    };
  }
  if (v < 0) {
    const t = Math.min(Math.abs(v) / Math.abs(min), 1);
    return {
      backgroundColor: `hsl(0 84% 60% / ${0.1 + t * 0.7})`,
      color: t > 0.5 ? "hsl(var(--loss-foreground))" : "hsl(var(--foreground))",
    };
  }
  return {
    backgroundColor: "hsl(var(--muted) / 0.3)",
    color: "hsl(var(--muted-foreground))",
  };
};

/* ----------------------- Einzeltag-Kästchen -------------------- */
const CalendarDay = ({ date, value }: { date: string; value: number }) => {
  const d = parseISO(date);
  const style = getColorStyle(value);

  return (
    <div
      className="aspect-square flex items-center justify-center text-xs font-medium
                 border border-border/20 rounded-md transition-all duration-200
                 hover:scale-105 cursor-pointer group relative"
      style={style}
      title={`${date}: ${value >= 0 ? "+" : ""}$${value.toFixed(2)}`}
    >
      {d.getDate()}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                      px-2 py-1 bg-card border border-border rounded text-xs opacity-0
                      group-hover:opacity-100 transition-opacity duration-200
                      pointer-events-none whitespace-nowrap z-10">
        {value >= 0 ? "+" : ""}
        ${value.toFixed(2)}
      </div>
    </div>
  );
};

/* ----------------------- Monats-Raster ------------------------- */
const MonthView = ({
  month,
  year,
  map,
}: {
  month: number;
  year: number;
  map: Record<string, number>;
}) => {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(<div key={`emp-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(<CalendarDay key={key} date={key} value={map[key] || 0} />);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">
        {monthNames[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((w) => (
          <div
            key={w}
            className="text-xs font-medium text-muted-foreground text-center p-2"
          >
            {w}
          </div>
        ))}
        {cells}
      </div>
    </div>
  );
};

/* ---------------------- Haupt-Komponente ----------------------- */
export const PnLCalendar = ({ data }: CalendarProps) => {
  /* Map YYYY-MM-DD → USD  */
  const map: Record<string, number> = Object.fromEntries(
    data.map((d) => [d.date, d.netUsd]),
  );

  const totalPnL   = data.reduce((s, d) => s + d.netUsd, 0);
  const profitDays = data.filter((d) => d.netUsd > 0).length;
  const totalDays  = data.length;

  const today = new Date();
  const views = [
    { m: today.getMonth() - 2, y: today.getFullYear() },
    { m: today.getMonth() - 1, y: today.getFullYear() },
    { m: today.getMonth(),     y: today.getFullYear() },
  ].map(({ m, y }) => {
    const month = ((m % 12) + 12) % 12;
    const year  = y + Math.floor(m / 12);
    return { month, year };
  });

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-foreground">Daily P&L Heatmap</span>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-profit/60" />
              <span className="text-muted-foreground">Profit</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-loss/60" />
              <span className="text-muted-foreground">Loss</span>
            </div>
          </div>
        </CardTitle>
        <div className="flex space-x-6 text-sm text-muted-foreground">
          <span>
            Total P&L:{" "}
            <span className={totalPnL > 0 ? "text-profit" : "text-loss"}>
              {totalPnL >= 0 ? "+" : "-"}${Math.abs(totalPnL).toFixed(2)}
            </span>
          </span>
          <span>
            Profitable Days:{" "}
            <span className="text-profit">
              {profitDays}/{totalDays} (
              {((profitDays / totalDays) * 100).toFixed(1)}%)
            </span>
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {views.map(({ month, year }) => (
            <MonthView key={`${year}-${month}`} month={month} year={year} map={map} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
