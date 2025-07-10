import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw, TrendingUp, TrendingDown, ArrowRightLeft, DollarSign, Sparkles, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  current_price_usd: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_usd: number;
  total_volume: number;
  image: string;
  genesis_date: string | null;
  is_new: boolean;
  market_cap_change_percentage_24h: number;
}

const fetchCryptoData = async (): Promise<CryptoData[]> => {
  console.log('Fetching crypto data...');
  
  // Fetch top 250 coins to catch more new listings
  const [inrResponse, usdResponse] = await Promise.all([
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h'),
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h')
  ]);

  if (!inrResponse.ok || !usdResponse.ok) {
    throw new Error('Failed to fetch crypto data');
  }

  const inrData = await inrResponse.json();
  const usdData = await usdResponse.json();

  console.log('Fetched data for', inrData.length, 'coins');

  // Combine INR and USD data and check for new coins
  const combinedData = inrData.map((inrCoin: any) => {
    const usdCoin = usdData.find((coin: any) => coin.id === inrCoin.id);
    
    // Check if coin is new (added to CoinGecko within last 7 days or has low market cap rank indicating recent listing)
    const isNew = inrCoin.market_cap_rank > 200 || 
      (inrCoin.ath_date && (new Date().getTime() - new Date(inrCoin.ath_date).getTime()) / (1000 * 60 * 60 * 24) <= 7) ||
      (inrCoin.market_cap_change_percentage_24h > 100); // Coins with huge 24h market cap changes are often new

    return {
      ...inrCoin,
      current_price_usd: usdCoin?.current_price || 0,
      market_cap_usd: usdCoin?.market_cap || 0,
      market_cap_change_percentage_24h: inrCoin.market_cap_change_percentage_24h || 0,
      is_new: isNew,
    };
  });

  // Sort to show new coins and high volume coins first
  return combinedData.sort((a: any, b: any) => {
    if (a.is_new && !b.is_new) return -1;
    if (!a.is_new && b.is_new) return 1;
    return b.market_cap - a.market_cap;
  });
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFromCoin, setSelectedFromCoin] = useState('bitcoin');
  const [selectedToCoin, setSelectedToCoin] = useState('inr');
  const [fromAmount, setFromAmount] = useState('1');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showUSD, setShowUSD] = useState(false);
  const [newCoinsCount, setNewCoinsCount] = useState(0);

  const { data: cryptoData, isLoading, error, refetch } = useQuery({
    queryKey: ['cryptoData'],
    queryFn: fetchCryptoData,
    refetchInterval: 15000, // Refresh every 15 seconds for faster updates
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Update last refresh time and count new coins
  useEffect(() => {
    if (cryptoData) {
      setLastUpdate(new Date());
      const newCount = cryptoData.filter(coin => coin.is_new).length;
      setNewCoinsCount(newCount);
      console.log(`Updated: ${cryptoData.length} coins, ${newCount} new coins`);
    }
  }, [cryptoData]);

  // Force refresh every 15 seconds
  useEffect(() => {
    const autoRefresh = setInterval(() => {
      console.log('Auto-refreshing crypto data...');
      refetch();
    }, 15000);
    return () => clearInterval(autoRefresh);
  }, [refetch]);

  const filteredData = cryptoData?.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number, isUSD = false) => {
    const currency = isUSD ? '$' : '₹';
    if (price >= 100000) {
      return `${currency}${(price / 100000).toFixed(2)}L`;
    } else if (price >= 1000) {
      return `${currency}${(price / 1000).toFixed(2)}K`;
    } else if (price >= 1) {
      return `${currency}${price.toFixed(2)}`;
    } else {
      return `${currency}${price.toFixed(6)}`;
    }
  };

  const formatMarketCap = (cap: number, isUSD = false) => {
    const currency = isUSD ? '$' : '₹';
    if (cap >= 1000000000000) {
      return `${currency}${(cap / 1000000000000).toFixed(2)}T`;
    } else if (cap >= 1000000000) {
      return `${currency}${(cap / 1000000000).toFixed(2)}B`;
    } else if (cap >= 1000000) {
      return `${currency}${(cap / 1000000).toFixed(2)}M`;
    } else {
      return `${currency}${(cap / 100000).toFixed(2)}L`;
    }
  };

  const calculateConversion = () => {
    if (!cryptoData) return 0;
    
    const fromCoin = cryptoData.find(coin => coin.id === selectedFromCoin);
    const toCoin = cryptoData.find(coin => coin.id === selectedToCoin);
    
    if (selectedToCoin === 'inr') {
      return fromCoin ? (parseFloat(fromAmount) * fromCoin.current_price) : 0;
    } else if (selectedToCoin === 'usd') {
      return fromCoin ? (parseFloat(fromAmount) * fromCoin.current_price_usd) : 0;
    } else if (selectedFromCoin === 'inr') {
      return toCoin ? (parseFloat(fromAmount) / toCoin.current_price) : 0;
    } else if (selectedFromCoin === 'usd') {
      return toCoin ? (parseFloat(fromAmount) / toCoin.current_price_usd) : 0;
    } else if (fromCoin && toCoin) {
      return (parseFloat(fromAmount) * fromCoin.current_price) / toCoin.current_price;
    }
    
    return 0;
  };

  const swapCurrencies = () => {
    const temp = selectedFromCoin;
    setSelectedFromCoin(selectedToCoin);
    setSelectedToCoin(temp);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-100">Loading crypto data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load crypto data</p>
          <Button onClick={() => refetch()} variant="outline" className="hover:scale-105 transition-transform duration-200">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 hover:text-blue-300 transition-colors duration-300">
                Crypto to INR
              </h1>
              <p className="text-blue-200">
                Real-time cryptocurrency prices ({cryptoData?.length || 0} coins)
                {newCoinsCount > 0 && (
                  <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {newCoinsCount} NEW
                  </Badge>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:scale-105 hover:bg-blue-600 transition-all duration-200"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Privacy
                </Button>
              </Link>
              <Button
                onClick={() => setShowUSD(!showUSD)}
                variant="outline"
                size="sm"
                className={`hover:scale-105 transition-all duration-200 ${showUSD ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-green-600'}`}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                {showUSD ? 'USD' : 'INR'}
              </Button>
              <div className="text-right text-sm text-slate-400">
                <p>Auto-updates every 15s</p>
                <p>Last: {lastUpdate.toLocaleTimeString()}</p>
              </div>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                className="hover:scale-105 hover:rotate-180 transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Crypto List */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Live Prices ({showUSD ? 'USD' : 'INR'})
                {newCoinsCount > 0 && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs hover:scale-110 transition-transform duration-300 cursor-pointer">
                    {newCoinsCount} NEW
                  </Badge>
                )}
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 transition-colors duration-200" />
                <Input
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {filteredData?.map((coin) => (
                <div
                  key={coin.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-600/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer relative group"
                  onClick={() => setSelectedFromCoin(coin.id)}
                >
                  {coin.is_new && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 animate-pulse hover:animate-bounce transition-all duration-300">
                        <Sparkles className="h-3 w-3 mr-1" />
                        NEW
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <img 
                      src={coin.image} 
                      alt={coin.name} 
                      className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" 
                    />
                    <div>
                      <p className="font-semibold text-white flex items-center gap-2 group-hover:text-blue-300 transition-colors duration-200">
                        {coin.name}
                        {coin.is_new && (
                          <Sparkles className="h-4 w-4 text-yellow-400 group-hover:animate-spin" />
                        )}
                      </p>
                      <p className="text-sm text-slate-400 uppercase">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white group-hover:text-green-400 transition-colors duration-200">
                      {formatPrice(showUSD ? coin.current_price_usd : coin.current_price, showUSD)}
                    </p>
                    {!showUSD && coin.current_price_usd > 0 && (
                      <p className="text-xs text-slate-500">
                        ${coin.current_price_usd.toFixed(2)}
                      </p>
                    )}
                    <div className="flex items-center gap-1">
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-400 group-hover:animate-bounce" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400 group-hover:animate-bounce" />
                      )}
                      <span className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right Panel - Converter */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-blue-400" />
                Currency Converter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">From</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter amount"
                    />
                    <Select value={selectedFromCoin} onValueChange={setSelectedFromCoin}>
                      <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                        <SelectItem value="inr" className="text-white hover:bg-slate-700 transition-colors duration-200">
                          <div className="flex items-center gap-2">
                            <span>🇮🇳</span>
                            <span>Indian Rupee (INR)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="usd" className="text-white hover:bg-slate-700 transition-colors duration-200">
                          <div className="flex items-center gap-2">
                            <span>🇺🇸</span>
                            <span>US Dollar (USD)</span>
                          </div>
                        </SelectItem>
                        {cryptoData?.map((coin) => (
                          <SelectItem key={coin.id} value={coin.id} className="text-white hover:bg-slate-700 transition-colors duration-200">
                            <div className="flex items-center gap-2">
                              <img src={coin.image} alt={coin.name} className="w-4 h-4" />
                              <span>{coin.name} ({coin.symbol.toUpperCase()})</span>
                              {coin.is_new && <Sparkles className="h-3 w-3 text-yellow-400" />}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={swapCurrencies} 
                    variant="outline" 
                    size="sm"
                    className="hover:scale-110 hover:rotate-180 transition-all duration-300"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">To</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={calculateConversion().toFixed(8)}
                      readOnly
                      className="bg-slate-700/30 border-slate-600 text-white"
                    />
                    <Select value={selectedToCoin} onValueChange={setSelectedToCoin}>
                      <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                        <SelectItem value="inr" className="text-white hover:bg-slate-700 transition-colors duration-200">
                          <div className="flex items-center gap-2">
                            <span>🇮🇳</span>
                            <span>Indian Rupee (INR)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="usd" className="text-white hover:bg-slate-700 transition-colors duration-200">
                          <div className="flex items-center gap-2">
                            <span>🇺🇸</span>
                            <span>US Dollar (USD)</span>
                          </div>
                        </SelectItem>
                        {cryptoData?.map((coin) => (
                          <SelectItem key={coin.id} value={coin.id} className="text-white hover:bg-slate-700 transition-colors duration-200">
                            <div className="flex items-center gap-2">
                              <img src={coin.image} alt={coin.name} className="w-4 h-4" />
                              <span>{coin.name} ({coin.symbol.toUpperCase()})</span>
                              {coin.is_new && <Sparkles className="h-3 w-3 text-yellow-400" />}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Market Stats */}
              <div className="pt-6 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Top Market Caps</h3>
                <div className="grid grid-cols-2 gap-4">
                  {cryptoData?.slice(0, 4).map((coin) => (
                    <div key={coin.id} className="bg-slate-700/30 p-3 rounded-lg relative hover:bg-slate-600/40 hover:scale-105 transition-all duration-200 cursor-pointer group">
                      {coin.is_new && (
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-1 py-0 group-hover:animate-pulse">
                            NEW
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={coin.image} 
                          alt={coin.name} 
                          className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" 
                        />
                        <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors duration-200">
                          {coin.symbol.toUpperCase()}
                        </span>
                        {coin.is_new && <Sparkles className="h-3 w-3 text-yellow-400 group-hover:animate-spin" />}
                      </div>
                      <p className="text-xs text-slate-400">Market Cap</p>
                      <p className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors duration-200">
                        {formatMarketCap(showUSD ? coin.market_cap_usd : coin.market_cap, showUSD)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <Badge variant="outline" className="text-slate-400 border-slate-600 hover:border-blue-500 hover:text-blue-300 transition-all duration-300 cursor-default">
            Data provided by CoinGecko • Auto-refreshes every 15 seconds • {cryptoData?.length || 0} coins tracked • Not investment advice
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Index;
