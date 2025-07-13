import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PerformanceChartProps {
  portfolioValue?: number;
}

export const PerformanceChart = ({ portfolioValue = 63285 }: PerformanceChartProps) => {
  const [timeFrame, setTimeFrame] = useState<'1D' | '7D' | '30D' | '1Y' | 'ALL'>('30D');
  
  const generateDataForTimeFrame = (days: number) => {
    const data = [];
    const baseValue = portfolioValue * 0.8; // Start from 80% of current value
    const maxValue = portfolioValue;
    
    for (let i = 0; i < days; i++) {
      const progress = i / (days - 1);
      const randomVariation = (Math.random() - 0.5) * 0.1;
      const value = baseValue + (maxValue - baseValue) * progress + baseValue * randomVariation;
      
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        value: Math.max(0, value),
        profit: Math.random() > 0.6 ? value * 0.05 : 0,
        loss: Math.random() > 0.7 ? value * 0.03 : 0,
      });
    }
    return data;
  };

  const getDataForTimeFrame = () => {
    switch (timeFrame) {
      case '1D': return generateDataForTimeFrame(24);
      case '7D': return generateDataForTimeFrame(7);
      case '30D': return generateDataForTimeFrame(30);
      case '1Y': return generateDataForTimeFrame(365);
      case 'ALL': return generateDataForTimeFrame(730);
      default: return generateDataForTimeFrame(30);
    }
  };

  const data = getDataForTimeFrame();
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const range = maxValue - minValue;
  const yAxisMin = Math.max(0, minValue - range * 0.1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{label}</p>
          <p className="text-primary">
            Value: ${payload[0].value.toLocaleString()}
          </p>
          {data.profit > 0 && (
            <p className="text-green-400">
              Profit: +${data.profit.toFixed(2)}
            </p>
          )}
          {data.loss > 0 && (
            <p className="text-red-400">
              Loss: -${data.loss.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Portfolio Performance</span>
          <div className="flex space-x-1">
            {(['1D', '7D', '30D', '1Y', 'ALL'] as const).map((tf) => (
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
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                domain={[yAxisMin, 'dataMax']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};