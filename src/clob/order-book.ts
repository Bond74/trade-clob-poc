import { DoublyLinkedList, Node } from "./doubly-linked-list";
import { Order, Side, Trade, OrderBookState } from "./types";

export class PriceLevel {
  public orders: DoublyLinkedList = new DoublyLinkedList();
  public totalQuantity: number = 0;

  constructor(public price: number) {}

  addOrder(order: Order): Node {
    this.totalQuantity += order.remainingQuantity;
    return this.orders.append(order);
  }

  removeOrder(node: Node) {
    this.totalQuantity -= node.order.remainingQuantity;
    this.orders.remove(node);
  }
}

export class OrderBook {
  private bids: PriceLevel[] = []; // Sorted Descending (highest buy first)
  private asks: PriceLevel[] = []; // Sorted Ascending (lowest sell first)
  private ordersMap: Map<string, { priceLevel: PriceLevel; node: Node }> =
    new Map();

  constructor(public readonly ticker: string) {}

  public placeOrder(order: Order): Trade[] {
    const trades: Trade[] = [];
    const opposingSide = order.side === Side.BUY ? this.asks : this.bids;

    // Matching Logic
    while (order.remainingQuantity > 0 && opposingSide.length > 0) {
      const bestPriceLevel = opposingSide[0];

      // Check if price matches
      const isMatch =
        order.side === Side.BUY
          ? order.price >= bestPriceLevel.price
          : order.price <= bestPriceLevel.price;

      if (!isMatch) break;

      const head = bestPriceLevel.orders.getHead();
      if (!head) {
        opposingSide.shift();
        continue;
      }

      const matchingOrder = head.order;
      const matchedQuantity = Math.min(
        order.remainingQuantity,
        matchingOrder.remainingQuantity,
      );

      // Create Trade
      trades.push({
        id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ticker: this.ticker,
        price: bestPriceLevel.price,
        quantity: matchedQuantity,
        buyerId:
          order.side === Side.BUY ? order.traderId : matchingOrder.traderId,
        sellerId:
          order.side === Side.SELL ? order.traderId : matchingOrder.traderId,
        buyOrderId: order.side === Side.BUY ? order.id : matchingOrder.id,
        sellOrderId: order.side === Side.SELL ? order.id : matchingOrder.id,
        timestamp: Date.now(),
      });

      order.remainingQuantity -= matchedQuantity;
      matchingOrder.remainingQuantity -= matchedQuantity;
      bestPriceLevel.totalQuantity -= matchedQuantity;

      if (matchingOrder.remainingQuantity === 0) {
        bestPriceLevel.orders.remove(head);
        this.ordersMap.delete(matchingOrder.id);
        if (bestPriceLevel.orders.length === 0) {
          opposingSide.shift();
        }
      }
    }

    // Add remaining to book
    if (order.remainingQuantity > 0) {
      this.addOrderToBook(order);
    }

    return trades;
  }

  private addOrderToBook(order: Order) {
    const side = order.side === Side.BUY ? this.bids : this.asks;
    const isBuy = order.side === Side.BUY;

    // Binary search for price level
    let low = 0;
    let high = side.length - 1;
    let index = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (side[mid].price === order.price) {
        index = mid;
        break;
      }
      if (isBuy) {
        if (side[mid].price < order.price) high = mid - 1;
        else low = mid + 1;
      } else {
        if (side[mid].price > order.price) high = mid - 1;
        else low = mid + 1;
      }
    }

    let priceLevel: PriceLevel;
    if (index !== -1) {
      priceLevel = side[index];
    } else {
      priceLevel = new PriceLevel(order.price);
      // Insert at 'low' to keep sorted
      side.splice(low, 0, priceLevel);
    }

    const node = priceLevel.addOrder(order);
    this.ordersMap.set(order.id, { priceLevel, node });
  }

  public cancelOrder(orderId: string): boolean {
    const entry = this.ordersMap.get(orderId);
    if (!entry) return false;

    const { priceLevel, node } = entry;
    priceLevel.removeOrder(node);
    this.ordersMap.delete(orderId);

    // Clean up empty price level
    if (priceLevel.orders.length === 0) {
      const side = node.order.side === Side.BUY ? this.bids : this.asks;
      const index = side.findIndex((pl) => pl.price === priceLevel.price);
      if (index !== -1) side.splice(index, 1);
    }

    return true;
  }

  public getState(): OrderBookState {
    return {
      ticker: this.ticker,
      bids: this.bids.map((pl) => ({
        price: pl.price,
        totalQuantity: pl.totalQuantity,
        orders: pl.orders.toArray(),
      })),
      asks: this.asks.map((pl) => ({
        price: pl.price,
        totalQuantity: pl.totalQuantity,
        orders: pl.orders.toArray(),
      })),
    };
  }
}
