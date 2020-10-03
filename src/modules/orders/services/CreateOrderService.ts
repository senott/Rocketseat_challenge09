import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import { IFindProducts } from '@modules/products/infra/typeorm/repositories/ProductsRepository';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found with the ID provided.');
    }

    const productsId: IFindProducts[] = products.map(product => {
      return { id: product.id };
    });

    const findProducts = await this.productsRepository.findAllById(productsId);

    if (findProducts.length !== products.length) {
      throw new AppError('Invalid product(s) in the order received.', 400);
    }

    const productsToUpdate: IUpdateProductsQuantityDTO[] = [];

    const orderProducts: {
      product_id: string;
      price: number;
      quantity: number;
    }[] = [];

    findProducts.forEach(foundProduct => {
      const sentProduct = products.find(item => item.id === foundProduct.id);

      /*
      Check if the product sent is valid
      */
      if (!sentProduct) {
        throw new AppError('Product not found.', 400);
      }

      /*
      Check if there is enough product to fullfil order
      */
      if (sentProduct.quantity > foundProduct.quantity) {
        throw new AppError(
          `Product ${foundProduct.name} don't have enough quantity in stock.`,
          400,
        );
      }

      const orderProduct = {
        product_id: foundProduct.id,
        price: foundProduct.price,
        quantity: sentProduct.quantity,
      };

      orderProducts.push(orderProduct);

      productsToUpdate.push({
        id: foundProduct.id,
        quantity: foundProduct.quantity - sentProduct.quantity,
      });
    });

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    /*
    Update products quantity
    */
    await this.productsRepository.updateQuantity(productsToUpdate);

    return order;
  }
}

export default CreateOrderService;
