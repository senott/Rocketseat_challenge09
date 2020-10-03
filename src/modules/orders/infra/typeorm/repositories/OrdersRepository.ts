import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';
import OrdersProducts from '../entities/OrdersProducts';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const ordersProducts: OrdersProducts[] = [];

    const order = this.ormRepository.create({ customer_id: customer.id });

    products.forEach(product => {
      const orderProduct = new OrdersProducts();

      Object.assign(orderProduct, {
        product_id: product.product_id,
        order_id: order.id,
        price: product.price,
        quantity: product.quantity,
      });

      ordersProducts.push(orderProduct);
    });

    order.order_products = ordersProducts;

    await this.ormRepository.save(order);

    const returnedOrder = await this.ormRepository.findOne(order.id);

    if (!returnedOrder) {
      throw new Error('Order not found.');
    }

    return returnedOrder;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne(id);

    return order;
  }
}

export default OrdersRepository;
