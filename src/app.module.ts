import { Module } from '@nestjs/common';
import { OrderBookService } from './order-book/order-book.service';
import { OrderBookGateway } from './order-book/order-book.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [OrderBookService, OrderBookGateway],
})
export class AppModule {}
