export enum Side {
  BUY = "BUY",
  SELL = "SELL",
}

export interface Order {
  id: string;
  ticker: string;
  side: Side;
  price: number;
  quantity: number;
  remainingQuantity: number;
  traderId: string;
  timestamp: number;
}

export type OrderPayload = Omit<
  Order,
  "id" | "remainingQuantity" | "timestamp"
>;

export interface Trade {
  id: string;
  ticker: string;
  price: number;
  quantity: number;
  buyerId: string;
  sellerId: string;
  buyOrderId: string;
  sellOrderId: string;
  timestamp: number;
}

export interface PriceLevelInfo {
  price: number;
  totalQuantity: number;
  orders: Order[];
}

export interface OrderBookState {
  ticker: string;
  bids: PriceLevelInfo[];
  asks: PriceLevelInfo[];
}
