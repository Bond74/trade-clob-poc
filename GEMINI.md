# GEMINI.md

## Project: Tradeweb CLOB (Central Limit Order Book)

This project is a high-performance, in-memory Central Limit Order Book (CLOB) built using NestJS and TypeScript. It follows strict "Price-Time Priority" matching logic.

### Architectural Decisions

1. **In-Memory Matching**: For high performance and low latency, all order book data is stored in memory. No database is used as per requirements.
2. **Data Structures**:
    - **`Map<string, { priceLevel: PriceLevel; node: Node }>`**: Provides O(1) order lookups by ID, essential for fast cancellations.
    - **Sorted Array for Price Levels**: Used to maintain bids (descending) and asks (ascending). Binary search is employed for O(log N) insertion points.
    - **Doubly Linked List at Each Price Level**: Ensures that within a specific price level, orders are processed in the order they arrived (time priority) with O(1) insertion and removal.
3. **WebSockets (Socket.io)**: Chosen for real-time bidirectional communication between the server and trading clients.
4. **Ticker-based Sharding**: Each ticker has its own `OrderBook` instance, allowing for clean separation and future horizontal scaling.

### Development Workflow

- **Unit Tests**: Core matching logic is heavily tested in `src/clob/order-book.spec.ts` to ensure correct handling of full/partial fills and priority rules.
- **WebSocket Gateway**: `OrderBookGateway` handles incoming `placeOrder` and `cancelOrder` events and broadcasts state updates to all connected clients.

### Future Improvements

- **Order Types**: Support for Market, Fill-or-Kill (FOK), and Immediate-or-Cancel (IOC) orders.
- **Red-Black Tree for Price Levels**: For even better performance with a massive number of price levels.
- **Persistence**: Snapshotting and WAL (Write Ahead Logging) for recovery.
- **Microservices**: Split matching engines for different tickers into separate services.
