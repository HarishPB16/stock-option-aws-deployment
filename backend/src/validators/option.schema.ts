// Basic robust regex matching: only A-Z, max 15 chars.
export const stockTickerRegex = /^[A-Z]{1,15}$/;

export const validateStockTicker = (ticker: string): boolean => {
    return stockTickerRegex.test(ticker);
};
