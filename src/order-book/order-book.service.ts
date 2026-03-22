import { Injectable } from '@nestjs/common';
import { OrderBook } from '../clob/order-book';
import { Order, Side, Trade, OrderBookState } from '../clob/types';

@Injectable()
export class OrderBookService {
  private orderBooks: Map<string, OrderBook> = new Map();

  private getOrderBook(ticker: string): OrderBook {
    let ob = this.orderBooks.get(ticker);
    if (!ob) {
      ob = new OrderBook(ticker);
      this.orderBooks.set(ticker, ob);
    }
    return ob;
  }

  public placeOrder(orderData: {
    ticker: string;
    side: Side;
    price: number;
    quantity: number;
    traderId: string;
  }): { trades: Trade[]; orderBookState: OrderBookState } {
    const ob = this.getOrderBook(orderData.ticker);
    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ticker: orderData.ticker,
      side: orderData.side,
      price: orderData.price,
      quantity: orderData.quantity,
      remainingQuantity: orderData.quantity,
      traderId: orderData.traderId,
      timestamp: Date.now(),
    };

    const trades = ob.placeOrder(order);
    return {
      trades,
      orderBookState: ob.getState(),
    };
  }

  public cancelOrder(ticker: string, orderId: string): { success: boolean; orderBookState: OrderBookState } {
    const ob = this.getOrderBook(ticker);
    const success = ob.cancelOrder(orderId);
    return {
      success,
      orderBookState: ob.getState(),
    };
  }

  public getBookState(ticker: string): OrderBookState {
    return this.getOrderBook(ticker).getState();
  }
}
