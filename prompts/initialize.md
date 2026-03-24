Act as a Senior Backend Engineer specializing in High-Frequency Trading (HFT) systems. Generate a complete, production-grade Node.js project based on the following specifications:

### Tech Stack

- Platform: Node.js (latest LTS)
- Language: TypeScript
- Framework: NestJS
- Communication: WebSockets (@nestjs/websockets)
- Testing: Jest (Unit and Integration)

### Core Requirement: Central Limit Order Book (CLOB)

Implement a CLOB that handles multiple tickers (e.g., AAPL, BTC/USD).
The engine must follow "Price-Time Priority" logic:

1. Highest Buy (Bid) and Lowest Sell (Ask) have priority.
2. At the same price level, the order that arrived first (earliest timestamp) is filled first.

### Performance & Data Structures

- Use an in-memory approach (no database).
- For efficiency, the OrderBook should use a Map for O(1) order lookups and a sorted structure (like a sorted Array with Binary Search) for price levels.
- Each price level should contain a Doubly Linked List of orders to ensure O(1) insertions and removals while maintaining time priority.

### Functional Requirements

1. **WebSocket API**:
   - `placeOrder`: Accepts Side (Buy/Sell), Ticker, Quantity, Price, and TraderID.
   - `cancelOrder`: Removes an order from the book.
2. **Matching Engine**:
   - When a new order arrives, attempt to match it against the opposing side.
   - If a match occurs, generate a `Trade` event and update/remove the involved orders.
   - If partially filled or unfilled, add the remainder to the book.
3. **Broadcasting**:
   - Every state change (New Order, Trade, Cancel) must broadcast the updated state of the Order Book to connected clients.

### Project Structure

- Standard NestJS folder structure.
- Dedicated `OrderBook` service and `MatchingEngine` logic.
- Well-defined Types/Interfaces for `Order`, `Trade`, and `Ticker`.
- Comprehensive Unit Tests for the matching logic (handling partial fills, full fills, and price-time priority).

### Execution

Ensure the project includes a `package.json` with all dependencies and a `README.md`. It must run immediately using `npm install && npm start`. The code should be modular, clean, and follow SOLID principles.
