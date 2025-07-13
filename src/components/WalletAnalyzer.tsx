import { useState } from "react";
import { Search, TrendingUp, TrendingDown, DollarSign, Target, Calendar, BarChart3, Wallet, Shield, Zap, Users, Activity, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { PerformanceChart } from "./PerformanceChart";
import { PnLCalendar } from "./PnLCalendar";
import { fetchWalletData, getMockWalletData, type WalletMetrics } from "@/services/heliusApi";

export const WalletAnalyzer = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [walletMetrics, setWalletMetrics] = useState<WalletMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!walletAddress) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Try to fetch real data from Helius API
      const metrics = await fetchWalletData(walletAddress);
      setWalletMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch real data, using mock data:', err);
      // Fallback to mock data
      setWalletMetrics(getMockWalletData());
      setError('Using demo data - API unavailable');
    }
    
    setIsAnalyzing(false);
    setHasAnalyzed(true);
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
                  {error && (
                    <p className="text-yellow-500 text-sm mt-2 flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      {error}
                    </p>
                  )}
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

          {/* Feature Showcase */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Powered by Helius API for instant, accurate Solana blockchain data
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Advanced Metrics</h3>
                <p className="text-muted-foreground text-sm">
                  Comprehensive P&L tracking, win rates, and portfolio performance
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/5 to-muted/5 border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                  <Timer className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Historical Data</h3>
                <p className="text-muted-foreground text-sm">
                  Visual charts and calendars showing your trading journey
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {hasAnalyzed && walletMetrics && (
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
                value={`$${walletMetrics.totalPnL.toLocaleString()}`}
                change={`+${walletMetrics.totalPnLPercentage.toFixed(1)}%`}
                trend={walletMetrics.totalPnL > 0 ? "up" : "down"}
                icon={walletMetrics.totalPnL > 0 ? TrendingUp : TrendingDown}
              />
              <MetricCard
                title="Win Rate"
                value={`${walletMetrics.winRate.toFixed(1)}%`}
                change={`${walletMetrics.tokenAccounts} tokens`}
                trend="up"
                icon={Target}
              />
              <MetricCard
                title="Total Trades"
                value={walletMetrics.totalTrades.toString()}
                change={`${walletMetrics.nftCount} NFTs`}
                trend="up"
                icon={BarChart3}
              />
              <MetricCard
                title="Portfolio Value"
                value={`$${walletMetrics.currentValue.toLocaleString()}`}
                change={`${walletMetrics.nativeBalance.toFixed(2)} SOL`}
                trend="up"
                icon={Wallet}
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