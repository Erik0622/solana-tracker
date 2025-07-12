import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Generate mock P&L data for the last 3 months
const generateCalendarData = () => {
  const data: { [key: string]: number } = {};
  const today = new Date();
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate random P&L between -500 and +800
    const pnl = Math.random() * 1300 - 500;
    data[dateStr] = pnl;
  }
  
  return data;
};

const calendarData = generateCalendarData();

const getColorIntensity = (value: number) => {
  const maxValue = 800;
  const minValue = -500;
  
  if (value > 0) {
    const intensity = Math.min(value / maxValue, 1);
    return {
      backgroundColor: `hsl(142 76% 36% / ${0.1 + intensity * 0.7})`,
      color: intensity > 0.5 ? 'hsl(var(--profit-foreground))' : 'hsl(var(--foreground))'
    };
  } else if (value < 0) {
    const intensity = Math.min(Math.abs(value) / Math.abs(minValue), 1);
    return {
      backgroundColor: `hsl(0 84% 60% / ${0.1 + intensity * 0.7})`,
      color: intensity > 0.5 ? 'hsl(var(--loss-foreground))' : 'hsl(var(--foreground))'
    };
  } else {
    return {
      backgroundColor: 'hsl(var(--muted) / 0.3)',
      color: 'hsl(var(--muted-foreground))'
    };
  }
};

const CalendarDay = ({ date, value }: { date: string; value: number }) => {
  const day = new Date(date).getDate();
  const style = getColorIntensity(value);
  
  return (
    <div 
      className="aspect-square flex items-center justify-center text-xs font-medium border border-border/20 rounded-md transition-all duration-200 hover:scale-105 cursor-pointer group relative"
      style={style}
      title={`${date}: ${value > 0 ? '+' : ''}$${value.toFixed(2)}`}
    >
      {day}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {value > 0 ? '+' : ''}${value.toFixed(2)}
      </div>
    </div>
  );
};

const MonthView = ({ month, year, data }: { month: number; year: number; data: { [key: string]: number } }) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const value = data[dateStr] || 0;
    days.push(<CalendarDay key={dateStr} date={dateStr} value={value} />);
  }
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">
        {monthNames[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-muted-foreground text-center p-2">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
};

export const PnLCalendar = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calculate total P&L for the period
  const totalPnL = Object.values(calendarData).reduce((sum, value) => sum + value, 0);
  const profitDays = Object.values(calendarData).filter(value => value > 0).length;
  const totalDays = Object.values(calendarData).length;
  
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-foreground">Daily P&L Heatmap</span>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-profit/60"></div>
              <span className="text-muted-foreground">Profit</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-loss/60"></div>
              <span className="text-muted-foreground">Loss</span>
            </div>
          </div>
        </CardTitle>
        <div className="flex space-x-6 text-sm text-muted-foreground">
          <span>Total P&L: <span className={totalPnL > 0 ? "text-profit" : "text-loss"}>
            {totalPnL > 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </span></span>
          <span>Profitable Days: <span className="text-profit">
            {profitDays}/{totalDays} ({((profitDays / totalDays) * 100).toFixed(1)}%)
          </span></span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MonthView month={currentMonth - 2} year={currentYear} data={calendarData} />
          <MonthView month={currentMonth - 1} year={currentYear} data={calendarData} />
          <MonthView month={currentMonth} year={currentYear} data={calendarData} />
        </div>
      </CardContent>
    </Card>
  );
};