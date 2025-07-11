import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw, TrendingUp, TrendingDown, ArrowRightLeft, DollarSign, Shield, Table as TableIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import CryptoTable from '@/components/CryptoTable';

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
  console.log('Fetching crypto data from free API...');
  
  try {
    // Using CoinLore API - completely free, no API key required
    const response = await fetch('https://api.coinlore.net/api/tickers/?start=0&limit=100');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const data = result.data;
    console.log('Fetched data for', data.length, 'coins from CoinLore API');

    // Function to get coin logo URL with fallbacks
    const getCoinImageUrl = (coin: any) => {
      const symbol = coin.symbol.toLowerCase();
      const name = coin.name.toLowerCase().replace(/\s+/g, '-');
      
      // Try multiple image sources with fallbacks
      const imageUrls = [
        `https://cryptoicons.org/api/icon/${symbol}/200`,
        `https://assets.coincap.io/assets/icons/${symbol}@2x.png`,
        `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol}.svg`,
        `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/16/${symbol}.png`,
        // Generic fallback
        `https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=${symbol.toUpperCase().charAt(0)}`
      ];
      
      return imageUrls[0]; // Primary source
    };

    // Convert CoinLore format to our expected format
    const combinedData = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toLowerCase(),
      name: coin.name,
      current_price: parseFloat(coin.price_usd) * 85, // Convert to INR (approximate)
      current_price_usd: parseFloat(coin.price_usd),
      price_change_percentage_24h: parseFloat(coin.percent_change_24h) || 0,
      market_cap: parseFloat(coin.market_cap_usd) * 85, // Convert to INR
      market_cap_usd: parseFloat(coin.market_cap_usd),
      total_volume: 0, // CoinLore doesn't provide volume
      image: getCoinImageUrl(coin),
      genesis_date: null,
      is_new: false,
      market_cap_change_percentage_24h: parseFloat(coin.percent_change_24h) || 0,
    }));

    return combinedData.filter((coin: any) => coin.current_price_usd > 0).sort((a: any, b: any) => b.market_cap_usd - a.market_cap_usd);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFromCoin, setSelectedFromCoin] = useState('bitcoin');
  const [selectedToCoin, setSelectedToCoin] = useState('inr');
  const [fromAmount, setFromAmount] = useState('1');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showUSD, setShowUSD] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const { toast } = useToast();

  const { data: cryptoData, isLoading, error, refetch } = useQuery({
    queryKey: ['cryptoData'],
    queryFn: fetchCryptoData,
    refetchInterval: 60000, // Update every minute
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update last refresh time
  useEffect(() => {
    if (cryptoData) {
      setLastUpdate(new Date());
      console.log(`Updated: ${cryptoData.length} coins`);
      toast({
        title: "Data Updated",
        description: `Loaded ${cryptoData.length} cryptocurrencies`,
      });
    }
  }, [cryptoData, toast]);

  // Show error toast when API fails
  useEffect(() => {
    if (error) {
      toast({
        title: "API Error",
        description: "Unable to fetch crypto data. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

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

  // Handle image load errors with fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    const symbol = img.alt.split(' ')[0].toLowerCase();
    
    // Try different fallback URLs
    const fallbacks = [
      `https://assets.coincap.io/assets/icons/${symbol}@2x.png`,
      `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol}.svg`,
      `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/16/${symbol}.png`,
      `https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=${symbol.toUpperCase().charAt(0)}`
    ];
    
    const currentSrc = img.src;
    const currentIndex = fallbacks.findIndex(url => currentSrc.includes(url.split('/').pop()?.split('.')[0] || ''));
    
    if (currentIndex < fallbacks.length - 1) {
      img.src = fallbacks[currentIndex + 1];
    }
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
          <p className="text-slate-400 mb-4 text-sm">API might be temporarily unavailable</p>
          <Button onClick={() => refetch()} variant="outline" className="hover:scale-105 transition-transform duration-200">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
          }
        `}
      </style>
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
                  onClick={() => setShowTable(!showTable)}
                  variant="outline"
                  size="sm"
                  className={`hover:scale-105 transition-all duration-200 ${showTable ? 'bg-purple-600 text-white hover:bg-purple-700' : 'hover:bg-purple-600'}`}
                >
                  <TableIcon className="h-4 w-4 mr-1" />
                  {showTable ? 'Hide Table' : 'Show Table'}
                </Button>
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
                  <p>Auto-updates every minute</p>
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
          {showTable ? (
            <CryptoTable data={cryptoData || []} showUSD={showUSD} />
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Panel - Crypto List */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Live Prices ({showUSD ? 'USD' : 'INR'})
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
                  {filteredData?.map((coin, index) => (
                    <div
                      key={coin.id}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-600/50 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer group animate-fade-in-up"
                      onClick={() => setSelectedFromCoin(coin.id)}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={coin.image} 
                          alt={`${coin.name} ${coin.symbol}`}
                          className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 animate-float rounded-full bg-slate-600 p-1" 
                          style={{
                            animationDelay: `${index * 0.2}s`,
                          }}
                          onError={handleImageError}
                          loading="lazy"
                        />
                        <div>
                          <p className="font-semibold text-white group-hover:text-blue-300 transition-colors duration-200">
                            {coin.name}
                          </p>
                          <p className="text-sm text-slate-400 uppercase group-hover:text-slate-300 transition-colors duration-200">{coin.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white group-hover:text-green-400 transition-colors duration-200">
                          {formatPrice(showUSD ? coin.current_price_usd : coin.current_price, showUSD)}
                        </p>
                        {!showUSD && coin.current_price_usd > 0 && (
                          <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-200">
                            ${coin.current_price_usd.toFixed(2)}
                          </p>
                        )}
                        <div className="flex items-center gap-1">
                          {coin.price_change_percentage_24h >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-400 group-hover:animate-bounce" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-400 group-hover:animate-bounce" />
                          )}
                          <span className={`text-sm transition-colors duration-200 ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
                                  <img 
                                    src={coin.image} 
                                    alt={coin.name} 
                                    className="w-4 h-4 rounded-full"
                                    onError={handleImageError}
                                  />
                                  <span>{coin.name} ({coin.symbol.toUpperCase()})</span>
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
                                  <img 
                                    src={coin.image} 
                                    alt={coin.name} 
                                    className="w-4 h-4 rounded-full"
                                    onError={handleImageError}
                                  />
                                  <span>{coin.name} ({coin.symbol.toUpperCase()})</span>
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
                      {cryptoData?.slice(0, 4).map((coin, index) => (
                        <div 
                          key={coin.id} 
                          className="bg-slate-700/30 p-3 rounded-lg relative hover:bg-slate-600/40 hover:scale-105 transition-all duration-200 cursor-pointer group animate-fade-in-up"
                          style={{
                            animationDelay: `${(index + 1) * 0.2}s`,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <img 
                              src={coin.image} 
                              alt={coin.name} 
                              className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 animate-float rounded-full" 
                              style={{
                                animationDelay: `${index * 0.3}s`,
                              }}
                              onError={handleImageError}
                            />
                            <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors duration-200">
                              {coin.symbol.toUpperCase()}
                            </span>
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
          )}

          {/* Disclaimer */}
          <div className="mt-8 text-center">
            <Badge variant="outline" className="text-slate-400 border-slate-600 hover:border-blue-500 hover:text-blue-300 transition-all duration-300 cursor-default">
              Data provided by CoinLore • Auto-refreshes every minute • {cryptoData?.length || 0} coins tracked • Not investment advice
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
