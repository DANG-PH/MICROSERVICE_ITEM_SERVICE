import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { In } from 'typeorm';
import { Item as ItemProto } from 'proto/item.pb';

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

  async deleteOrphans(userId: number, keepUuids: string[]): Promise<void> {
    if (keepUuids.length === 0) {
      // Nếu client gửi list rỗng thì xóa hết
      await this.itemRepository.delete({ userId });
      return;
    }

    await this.itemRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('uuid NOT IN (:...keepUuids)', { keepUuids })
      .execute();
  }

  async upsertMany(items: Partial<Item>[]) {
    await this.itemRepository.upsert(items, ['uuid']);

    const uuids = items.map(i => i.uuid);
    return this.itemRepository.findBy({ uuid: In(uuids) });
  }
}