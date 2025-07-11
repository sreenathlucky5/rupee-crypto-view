
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

interface CryptoTableProps {
  data: CryptoData[];
  showUSD: boolean;
}

const CryptoTable: React.FC<CryptoTableProps> = ({ data, showUSD }) => {
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    const symbol = img.alt.split(' ')[0].toLowerCase();
    
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

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          Complete Cryptocurrency List ({data.length} coins) - {showUSD ? 'USD' : 'INR'} Prices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Rank</TableHead>
                <TableHead className="text-slate-300">Logo</TableHead>
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Symbol</TableHead>
                <TableHead className="text-slate-300 text-right">Price ({showUSD ? 'USD' : 'INR'})</TableHead>
                <TableHead className="text-slate-300 text-right">24h Change</TableHead>
                <TableHead className="text-slate-300 text-right">Market Cap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((coin, index) => (
                <TableRow key={coin.id} className="border-slate-700 hover:bg-slate-700/30">
                  <TableCell className="text-slate-400 font-medium">
                    #{index + 1}
                  </TableCell>
                  <TableCell>
                    <img 
                      src={coin.image} 
                      alt={`${coin.name} ${coin.symbol}`}
                      className="w-8 h-8 rounded-full bg-slate-600 p-1"
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {coin.name}
                  </TableCell>
                  <TableCell className="text-slate-400 uppercase font-mono">
                    {coin.symbol}
                  </TableCell>
                  <TableCell className="text-right text-white font-semibold">
                    {formatPrice(showUSD ? coin.current_price_usd : coin.current_price, showUSD)}
                    {!showUSD && coin.current_price_usd > 0 && (
                      <div className="text-xs text-slate-500">
                        ${coin.current_price_usd.toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-white font-medium">
                    {formatMarketCap(showUSD ? coin.market_cap_usd : coin.market_cap, showUSD)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoTable;
