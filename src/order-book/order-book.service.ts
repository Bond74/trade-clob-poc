import { Injectable } from "@nestjs/common";
import { OrderBook } from "../clob/order-book";
import { Order, Trade, OrderBookState, OrderPayload } from "../clob/types";
import { randomBytes } from "node:crypto";

@Injectable()
export class OrderBookService {
  private orderBooks: Map<string, OrderBook> = new Map();
  private readonly prefix = "order-";

  private getOrderBook(ticker: string): OrderBook {
    let ob = this.orderBooks.get(ticker);
    if (!ob) {
      ob = new OrderBook(ticker);
      this.orderBooks.set(ticker, ob);
    }
    return ob;
  }

  public placeOrder(orderData: OrderPayload): {
    trades: Trade[];
    orderBookState: OrderBookState;
  } {
    const ob = this.getOrderBook(orderData.ticker);
    const order: Order = {
      id: this.getOrderId(),
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

  public cancelOrder(
    ticker: string,
    orderId: string,
  ): { success: boolean; orderBookState: OrderBookState } {
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

  private getOrderId(): string {
    return this.prefix + randomBytes(12).toString("hex");
  }
}
