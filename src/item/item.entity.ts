import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Long } from 'typeorm/browser';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  maItem: string;

  @Column()
  ten: string;

  @Column()
  loai: string;

  @Column('text')
  moTa: string;

  @Column()
  soLuong: number;

  @Column()
  hanhTinh: string;

  @Column({ nullable: true })
  setKichHoat: string;

  @Column()
  soSaoPhaLe: number;

  @Column()
  soSaoPhaLeCuongHoa: number;

  @Column()
  soCap: number;

  @Column('float')
  hanSuDung: number;

  @Column()
  sucManhYeuCau: string;

  @Column()
  linkTexture: string;

  @Column()
  viTri: string;

  @Column('text', { nullable: true })
  chiso: string; // lưu dạng JSON string

  // Index trên userId phục vụ GetItemsByUser (load inventory khi vào game).
  //
  // Chi phí write:
  // - AddMultipleItems business đang là xóa row và insert lại -> mất  time O(n) + 2*O(logN) thay vì O(1) + O(n)
  // - O(log N) per insert nghe nặng nhưng thực tế B-Tree của InnoDB chỉ 5-6 levels
  //   với hàng triệu rows → gần như O(1) cố định, không đáng lo
  //
  // Page split (chi phí thực sự đáng lo hơn O(log N)):
  // - Khi B-Tree page đầy, InnoDB phải split page → tốn I/O và reorganize
  // - Tuy nhiên InnoDB secondary index KHÔNG lưu pointer vật lý đến data page
  //   mà lưu giá trị PRIMARY KEY → khi clustered index bị reorganize/page split,
  //   secondary index KHÔNG cần update địa chỉ, InnoDB tự xử lý hoàn toàn
  //
  // Kết luận: giữ index vì read inventory là critical path,
  // chi phí write được InnoDB hấp thụ tốt qua Change Buffer
  @Index()
  @Column()
  userId: number;

  @Column()
  uuid: string;
}