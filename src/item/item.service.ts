import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { In } from 'typeorm';
import { SwapItemRequest } from 'proto/item.pb';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async getItemsByUser(id: number): Promise<any[]> {

    const items = await this.itemRepository.find({
        where: { userId: id },
    });

    const resultItems = items.map(item => ({
        ...item,
        chiso: item.chiso || '{}', 
    }));

    return resultItems;
  }

  async getItemsByItemUuids(itemUuids: string[]): Promise<any[]> {
      if (!itemUuids || itemUuids.length === 0) {
          return [];
      }

      const items = await this.itemRepository.find({
          where: { uuid: In(itemUuids) },
      });

      const resultItems = items.map(item => ({
          ...item,
          chiso: item.chiso || '{}',
      }));

      return resultItems;
  }


  async getItem(id: number): Promise<Item | null> {
    return this.itemRepository.findOne({ where: { id } });
  }

  async saveItem(item: Item): Promise<Item> {
    return this.itemRepository.save(item);
  }

  async saveAll(items: Item[]): Promise<Item[]> {
    return this.itemRepository.save(items);
  }

  async deleteItem(id: number): Promise<void> {
    await this.itemRepository.delete(id);
  }

  async deleteByUser(id : number): Promise<void> {
    await this.itemRepository.delete({ userId : id });
  }

   // Tạo entity từ object thuần
  create(data: Partial<Item>): Item {
    return this.itemRepository.create(data);
  }

  async swapItem(data: SwapItemRequest): Promise<void> {
    const { itemUuids, swap_user_id } = data;
    if (!itemUuids || itemUuids.length === 0) return;

    const items = await this.itemRepository.find({
      where: { uuid: In(itemUuids) },
    });

    if (items.length === 0) return;

    const updatedItems = items.map(item => ({
      ...item,
      userId: swap_user_id,
    }));

    await this.itemRepository.save(updatedItems);
  }
}