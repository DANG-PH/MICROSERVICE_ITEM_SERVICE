import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { Item } from './item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item])], // Đăng ký repository cho Item
  providers: [ItemService],
  controllers: [ItemController],
  exports: [ItemService], // nếu muốn dùng ở module khác
})
export class ItemModule {}