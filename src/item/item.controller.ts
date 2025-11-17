import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ItemService } from './item.service';
import { Item } from './item.entity';
import type { UserIdRequest, ItemIdRequest, AddItemRequest, AddMultipleItemsRequest, ItemResponse, ItemsResponse, MessageResponse } from 'proto/item.pb';
import { ITEM_SERVICE_NAME } from 'proto/item.pb';
import { status } from '@grpc/grpc-js';
@Controller()
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  // Lấy toàn bộ item của 1 user
  @GrpcMethod(ITEM_SERVICE_NAME, 'GetItemsByUser')
  async getItemsByUser(data: UserIdRequest): Promise<ItemsResponse> {
    const items = await this.itemService.getItemsByUser(data.user_id);
    return { items };
  }

  // Thêm item cho user
  @GrpcMethod(ITEM_SERVICE_NAME, 'AddItem')
  async addItem(data: AddItemRequest): Promise<ItemResponse> {
    if (!data.item) throw new RpcException({code: status.UNAUTHENTICATED ,message: 'Khong tim thay data item'});
    const itemSave = this.itemService.create({
            maItem: data.item.maItem || '',
            ten: data.item.ten || '',
            loai: data.item.loai || '',
            moTa: data.item.moTa || '',
            soLuong: data.item.soLuong || 0,
            hanhTinh: data.item.hanhTinh || '',
            setKichHoat: data.item.setKichHoat || 'null', 
            soSaoPhaLe: data.item.soSaoPhaLe || 0,
            soSaoPhaLeCuongHoa: data.item.soSaoPhaLeCuongHoa || 0,
            soCap: data.item.soCap || 0,
            hanSuDung: data.item.hanSuDung || 0,
            sucManhYeuCau: data.item.sucManhYeuCau?.toString() || '0',
            linkTexture: data.item.linkTexture || '',
            viTri: data.item.viTri || '',
            chiso: data.item.chiso || '[]',
            userId: data.user_id,
            });
    const item = await this.itemService.saveItem(itemSave);
    return { item };
  }

  // Cập nhật item
  @GrpcMethod(ITEM_SERVICE_NAME, 'UpdateItem')
  async updateItem(data: Item): Promise<ItemResponse> {
    const item = await this.itemService.getItem(data.id);
    if (!item) {
      throw new RpcException({code: status.NOT_FOUND ,message: 'Khong tim thay item'});
    }

    item.ten = data.ten;
    item.loai = data.loai;
    item.moTa = data.moTa;
    item.soLuong = data.soLuong;
    item.viTri = data.viTri;
    item.chiso = data.chiso;

    const updated = await this.itemService.saveItem(item);
    return { item: updated };
  }

  // Xóa item
  @GrpcMethod(ITEM_SERVICE_NAME, 'DeleteItem')
  async deleteItem(data: ItemIdRequest): Promise<MessageResponse> {
    await this.itemService.deleteItem(data.id);
    return { message: 'Xóa item thành công!' };
  }

  // Thêm nhiều item (replace toàn bộ list)
  @GrpcMethod(ITEM_SERVICE_NAME, 'AddMultipleItems')
  async addMultipleItems(data: AddMultipleItemsRequest): Promise<ItemsResponse> {
    const { items, user_id } = data;

    if (!Array.isArray(items)) {
        throw new RpcException({code: status.INVALID_ARGUMENT,message: 'danh sach item khong hop le'});
    }

    await this.itemService.deleteByUser(user_id);

    const itemsToSave = items.map(item => {

        return this.itemService.create({
            maItem: item.maItem || '',
            ten: item.ten || '',
            loai: item.loai || '',
            moTa: item.moTa || '',
            soLuong: item.soLuong || 0,
            hanhTinh: item.hanhTinh || '',
            setKichHoat: item.setKichHoat || 'null', 
            soSaoPhaLe: item.soSaoPhaLe || 0,
            soSaoPhaLeCuongHoa: item.soSaoPhaLeCuongHoa || 0,
            soCap: item.soCap || 0,
            hanSuDung: item.hanSuDung || 0,
            sucManhYeuCau: item.sucManhYeuCau?.toString() || '0',
            linkTexture: item.linkTexture || '',
            viTri: item.viTri || '',
            chiso: item.chiso || '[]',
            userId: user_id,
            });
    });

    const savedItems = await this.itemService.saveAll(itemsToSave);
    return { items: savedItems };
  }
}
