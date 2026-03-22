# Tradeweb CLOB - Central Limit Order Book

Tradeweb CLOB is a production-grade Central Limit Order Book (CLOB) matching engine for high-frequency trading, built with NestJS, TypeScript and WebSockets.

## Purpose

It implements a price-time priority matching algorithm where orders are filled based on:

1. Best price first
2. Earliest arrival time for orders at the same price level

## Features

- **Price-Time Priority Matching Engine**: Implements core matching logic where orders are filled based on price first, and then by arrival time.
- **Efficient Data Structures**:
  - `Map` for O(1) order lookups and cancellations.
  - Sorted price levels with Binary Search for fast order insertion.
  - `Doubly Linked List` at each price level for O(1) order insertion/removal.
- **WebSocket API**: Real-time order placement, cancellation, and state broadcasting.
- **Multi-ticker support**: Handles multiple assets independently (e.g., AAPL, BTC/USD).

## Architecture

- clob: Core matching engine with custom data structures and order book logic
- order-book: NestJS services and WebSocket gateway for client communication
- WebSocket Events: Clients can place orders, cancel orders, and receive real-time - orderBookUpdate and trades broadcasts

## Tech Stack

- **Framework**: NestJS
- **Communication**: Socket.io (WebSockets)
- **Language**: TypeScript
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js (LTS version)
- npm

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the project root to configure the server port (optional, default: 3000):

```env
# Server Port (HTTP and WebSocket)
PORT=3000
```

### Running the application

```bash
npm start
```

The application will be running on `http://localhost:3000` with WebSocket server on the same port.

### Running Tests

```bash
npm test
```

## WebSocket API

Connect to `ws://localhost:3000`.

### Events

#### Client to Server

- `placeOrder`:
  ```json
  {
    "ticker": "AAPL",
    "side": "BUY",
    "price": 150.0,
    "quantity": 100,
    "traderId": "TRADER1"
  }
  ```
- `cancelOrder`:
  ```json
  {
    "ticker": "AAPL",
    "orderId": "order-12345"
  }
  ```
- `getBookState`:
  ```json
  {
    "ticker": "AAPL"
  }
  ```

#### Server to Client

- `orderBookUpdate:<ticker>`: Broadcasts the updated L2 order book state.
- `trades:<ticker>`: Broadcasts executed trades.

## Project Structure

- `src/clob/`: Core matching engine and data structures.
- `src/order-book/`: NestJS services and WebSocket gateways.
- `src/main.ts`: Application entry point.
