import { OrderBook } from './order-book';
import { Side, Order } from './types';

describe('OrderBook Matching Logic', () => {
  let orderBook: OrderBook;

  beforeEach(() => {
    orderBook = new OrderBook('AAPL');
  });

  const createOrder = (id: string, side: Side, price: number, quantity: number, traderId: string = 'T1'): Order => ({
    id,
    ticker: 'AAPL',
    side,
    price,
    quantity,
    remainingQuantity: quantity,
    traderId,
    timestamp: Date.now(),
  });

  it('should match a full fill buy order against an existing sell order', () => {
    orderBook.placeOrder(createOrder('o1', Side.SELL, 100, 10));
    const trades = orderBook.placeOrder(createOrder('o2', Side.BUY, 100, 10));

    expect(trades.length).toBe(1);
    expect(trades[0].quantity).toBe(10);
    expect(trades[0].price).toBe(100);
    
    const state = orderBook.getState();
    expect(state.bids.length).toBe(0);
    expect(state.asks.length).toBe(0);
  });

  it('should handle partial fills correctly', () => {
    orderBook.placeOrder(createOrder('o1', Side.SELL, 100, 10));
    const trades = orderBook.placeOrder(createOrder('o2', Side.BUY, 100, 5));

    expect(trades.length).toBe(1);
    expect(trades[0].quantity).toBe(5);
    
    const state = orderBook.getState();
    expect(state.asks.length).toBe(1);
    expect(state.asks[0].totalQuantity).toBe(5);
    expect(state.asks[0].orders[0].remainingQuantity).toBe(5);
  });

  it('should follow price-time priority (price priority)', () => {
    orderBook.placeOrder(createOrder('o1', Side.SELL, 101, 10));
    orderBook.placeOrder(createOrder('o2', Side.SELL, 100, 10)); // Better price for buyer

    const trades = orderBook.placeOrder(createOrder('o3', Side.BUY, 101, 5));

    expect(trades.length).toBe(1);
    expect(trades[0].price).toBe(100); // Should match o2 first
    expect(trades[0].sellOrderId).toBe('o2');
  });

  it('should follow price-time priority (time priority)', () => {
    orderBook.placeOrder(createOrder('o1', Side.SELL, 100, 10)); // Arrived first
    orderBook.placeOrder(createOrder('o2', Side.SELL, 100, 10)); // Arrived second

    const trades = orderBook.placeOrder(createOrder('o3', Side.BUY, 100, 15));

    expect(trades.length).toBe(2);
    expect(trades[0].sellOrderId).toBe('o1');
    expect(trades[0].quantity).toBe(10);
    expect(trades[1].sellOrderId).toBe('o2');
    expect(trades[1].quantity).toBe(5);
  });

  it('should handle order cancellation', () => {
    orderBook.placeOrder(createOrder('o1', Side.SELL, 100, 10));
    const cancelled = orderBook.cancelOrder('o1');

    expect(cancelled).toBe(true);
    const state = orderBook.getState();
    expect(state.asks.length).toBe(0);
  });

  it('should match multiple price levels', () => {
    orderBook.placeOrder(createOrder('o1', Side.SELL, 100, 10));
    orderBook.placeOrder(createOrder('o2', Side.SELL, 101, 10));

    const trades = orderBook.placeOrder(createOrder('o3', Side.BUY, 105, 15));

    expect(trades.length).toBe(2);
    expect(trades[0].price).toBe(100);
    expect(trades[1].price).toBe(101);
    
    const state = orderBook.getState();
    expect(state.asks.length).toBe(1);
    expect(state.asks[0].totalQuantity).toBe(5);
  });
});
