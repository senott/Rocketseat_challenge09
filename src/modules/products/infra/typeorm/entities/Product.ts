import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity('products')
class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @OneToMany(() => OrdersProducts, ordersProducts => ordersProducts.product, {
    cascade: true,
  })
  ordersProducts: OrdersProducts[];

  @CreateDateColumn({ update: false })
  created_at: Date;

  @UpdateDateColumn({ update: false })
  updated_at: Date;
}

export default Product;
