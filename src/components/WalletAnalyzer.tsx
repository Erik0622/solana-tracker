import { useState } from "react";
import { Search, TrendingUp, TrendingDown, DollarSign, Target, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { PerformanceChart } from "./PerformanceChart";
import { PnLCalendar } from "./PnLCalendar";

export const WalletAnalyzer = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!walletAddress) return;
    
    setIsAnalyzing(true);
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    setHasAnalyzed(true);
  };

  // Mock data for demonstration
  const mockMetrics = {
    totalPnL: 12435.67,
    totalPnLPercentage: 24.5,
    winRate: 68.2,
    totalTrades: 247,
    avgTrade: 50.34,
    bestTrade: 2840.12,
    worstTrade: -1250.45,
    currentValue: 63285.43
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Solana Wallet Analyzer
              </h1>
              <p className="text-muted-foreground mt-2">
                Analyze your Solana wallet performance with detailed metrics and insights
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Wallet Input */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/40">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter Solana wallet address..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="bg-background/50 border-border/60 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button 
                  onClick={handleAnalyze}
                  disabled={!walletAddress || isAnalyzing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4" />
                      <span>Analyze Wallet</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analysis Results */}
      {hasAnalyzed && (
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Key Metrics */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <span>Performance Overview</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total P&L"
                value={`$${mockMetrics.totalPnL.toLocaleString()}`}
                change={`+${mockMetrics.totalPnLPercentage}%`}
                trend={mockMetrics.totalPnL > 0 ? "up" : "down"}
                icon={mockMetrics.totalPnL > 0 ? TrendingUp : TrendingDown}
              />
              <MetricCard
                title="Win Rate"
                value={`${mockMetrics.winRate}%`}
                change="vs 30d avg"
                trend="up"
                icon={Target}
              />
              <MetricCard
                title="Total Trades"
                value={mockMetrics.totalTrades.toString()}
                change="+12 this week"
                trend="up"
                icon={BarChart3}
              />
              <MetricCard
                title="Current Value"
                value={`$${mockMetrics.currentValue.toLocaleString()}`}
                change="+3.2% today"
                trend="up"
                icon={DollarSign}
              />
            </div>
          </div>

          {/* Performance Chart */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>Portfolio Performance</span>
            </h2>
            <PerformanceChart />
          </div>

          {/* P&L Calendar */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span>P&L Calendar</span>
            </h2>
            <PnLCalendar />
          </div>
        </div>
      )}

      {/* Initial State */}
      {!hasAnalyzed && !isAnalyzing && (
        <div className="container mx-auto px-6 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <BarChart3 className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Welcome to Solana Wallet Analyzer</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Enter your Solana wallet address above to get comprehensive analytics including 
              performance metrics, trading history, and profit/loss insights with beautiful 
              visualizations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};