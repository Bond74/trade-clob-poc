import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  MessageBody,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { OrderBookService } from "./order-book.service";
import { OrderPayload, Side } from "../clob/types";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class OrderBookGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly orderBookService: OrderBookService) {}

  handleConnection(client: { id: string }) {
    console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage("placeOrder")
  handlePlaceOrder(
    @MessageBody()
    data: OrderPayload,
  ) {
    const { trades, orderBookState } = this.orderBookService.placeOrder(data);

    // Broadcast state update
    this.server.emit(`orderBookUpdate:${data.ticker}`, orderBookState);

    // Broadcast trades
    if (trades.length > 0) {
      this.server.emit(`trades:${data.ticker}`, trades);
    }

    return { success: true };
  }

  @SubscribeMessage("cancelOrder")
  handleCancelOrder(@MessageBody() data: { ticker: string; orderId: string }) {
    const { success, orderBookState } = this.orderBookService.cancelOrder(
      data.ticker,
      data.orderId,
    );

    if (success) {
      this.server.emit(`orderBookUpdate:${data.ticker}`, orderBookState);
    }

    return { success };
  }

  @SubscribeMessage("getBookState")
  handleGetBookState(@MessageBody() data: { ticker: string }) {
    return this.orderBookService.getBookState(data.ticker);
  }
}
