export type Market = {
  country: string;
  code: string;
  flag: string;
  currencyCode: string;
  currencyLabel: string;
  symbol: string;
  usdRate: number;
};

export const DEFAULT_MARKET_CODE = 'US';

export const markets: Market[] = [
  { country: 'Australia', code: 'AU', flag: '🇦🇺', currencyCode: 'AUD', currencyLabel: 'AUD $', symbol: '$', usdRate: 1.52 },
  { country: 'Austria', code: 'AT', flag: '🇦🇹', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Belgium', code: 'BE', flag: '🇧🇪', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Canada', code: 'CA', flag: '🇨🇦', currencyCode: 'CAD', currencyLabel: 'CAD $', symbol: '$', usdRate: 1.36 },
  { country: 'Croatia', code: 'HR', flag: '🇭🇷', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Cyprus', code: 'CY', flag: '🇨🇾', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Denmark', code: 'DK', flag: '🇩🇰', currencyCode: 'DKK', currencyLabel: 'DKK kr.', symbol: 'kr.', usdRate: 6.86 },
  { country: 'Finland', code: 'FI', flag: '🇫🇮', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'France', code: 'FR', flag: '🇫🇷', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Georgia', code: 'GE', flag: '🇬🇪', currencyCode: 'GBP', currencyLabel: 'GBP £', symbol: '£', usdRate: 0.79 },
  { country: 'Germany', code: 'DE', flag: '🇩🇪', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Hungary', code: 'HU', flag: '🇭🇺', currencyCode: 'HUF', currencyLabel: 'HUF Ft', symbol: 'Ft', usdRate: 360 },
  { country: 'Iceland', code: 'IS', flag: '🇮🇸', currencyCode: 'ISK', currencyLabel: 'ISK kr', symbol: 'kr', usdRate: 139 },
  { country: 'Ireland', code: 'IE', flag: '🇮🇪', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Italy', code: 'IT', flag: '🇮🇹', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Luxembourg', code: 'LU', flag: '🇱🇺', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Monaco', code: 'MC', flag: '🇲🇨', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Netherlands', code: 'NL', flag: '🇳🇱', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'New Zealand', code: 'NZ', flag: '🇳🇿', currencyCode: 'NZD', currencyLabel: 'NZD $', symbol: '$', usdRate: 1.65 },
  { country: 'Norway', code: 'NO', flag: '🇳🇴', currencyCode: 'GBP', currencyLabel: 'GBP £', symbol: '£', usdRate: 0.79 },
  { country: 'Poland', code: 'PL', flag: '🇵🇱', currencyCode: 'PLN', currencyLabel: 'PLN zł', symbol: 'zł', usdRate: 3.94 },
  { country: 'Portugal', code: 'PT', flag: '🇵🇹', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Qatar', code: 'QA', flag: '🇶🇦', currencyCode: 'QAR', currencyLabel: 'QAR ر.ق', symbol: 'ر.ق', usdRate: 3.64 },
  { country: 'Romania', code: 'RO', flag: '🇷🇴', currencyCode: 'RON', currencyLabel: 'RON Lei', symbol: 'Lei', usdRate: 4.58 },
  { country: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', currencyCode: 'SAR', currencyLabel: 'SAR ر.س', symbol: 'ر.س', usdRate: 3.75 },
  { country: 'Serbia', code: 'RS', flag: '🇷🇸', currencyCode: 'RSD', currencyLabel: 'RSD РСД', symbol: 'РСД', usdRate: 107 },
  { country: 'Slovakia', code: 'SK', flag: '🇸🇰', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Spain', code: 'ES', flag: '🇪🇸', currencyCode: 'EUR', currencyLabel: 'EUR €', symbol: '€', usdRate: 0.92 },
  { country: 'Sweden', code: 'SE', flag: '🇸🇪', currencyCode: 'SEK', currencyLabel: 'SEK kr', symbol: 'kr', usdRate: 10.45 },
  { country: 'Switzerland', code: 'CH', flag: '🇨🇭', currencyCode: 'CHF', currencyLabel: 'CHF CHF', symbol: 'CHF', usdRate: 0.9 },
  { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', currencyCode: 'AED', currencyLabel: 'AED د.إ', symbol: 'د.إ', usdRate: 3.67 },
  { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', currencyCode: 'GBP', currencyLabel: 'GBP £', symbol: '£', usdRate: 0.79 },
  { country: 'United States', code: 'US', flag: '🇺🇸', currencyCode: 'USD', currencyLabel: 'USD $', symbol: '$', usdRate: 1 },
];

export function getMarketByCode(code: string | null | undefined) {
  return markets.find((market) => market.code === code) ?? markets.find((market) => market.code === DEFAULT_MARKET_CODE) ?? markets[0];
}

export function getFlagUrl(code: string) {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

export function formatMarketPrice(usdPrice: number, market: Market) {
  const value = usdPrice * market.usdRate;
  const roundedValue = ['HUF', 'ISK', 'RSD'].includes(market.currencyCode) ? Math.round(value) : Number(value.toFixed(2));
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: ['HUF', 'ISK', 'RSD'].includes(market.currencyCode) ? 0 : 2,
    maximumFractionDigits: ['HUF', 'ISK', 'RSD'].includes(market.currencyCode) ? 0 : 2,
  }).format(roundedValue);

  if (['USD', 'AUD', 'CAD', 'NZD'].includes(market.currencyCode)) {
    return `${market.currencyCode} ${market.symbol}${formatted}`;
  }

  if (['EUR', 'GBP'].includes(market.currencyCode)) {
    return `${market.currencyCode} ${market.symbol}${formatted}`;
  }

  return `${market.currencyCode} ${formatted} ${market.symbol}`;
}
