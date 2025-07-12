import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const generateMockData = () => {
  const data = [];
  const baseValue = 50000;
  let currentValue = baseValue;
  
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.5) * 2000; // Random change between -1000 and +1000
    currentValue += change;
    data.push({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      value: Math.max(currentValue, 0),
      profit: change > 0 ? change : 0,
      loss: change < 0 ? Math.abs(change) : 0
    });
  }
  return data;
};

const mockData = generateMockData();

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
          <p className="text-profit">
            Profit: +${data.profit.toFixed(2)}
          </p>
        )}
        {data.loss > 0 && (
          <p className="text-loss">
            Loss: -${data.loss.toFixed(2)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const PerformanceChart = () => {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="text-foreground">30-Day Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.3}
              />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#valueGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};