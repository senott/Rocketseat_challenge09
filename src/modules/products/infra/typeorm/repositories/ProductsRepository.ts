import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

export interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const returnedProducts = await this.ormRepository.find({
      id: In(products.map(product => product.id)),
    });

    return returnedProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProducts = await this.ormRepository.findByIds(
      products.map(product => product.id),
    );

    products.forEach(product => {
      const updatedProduct = updatedProducts.find(
        item => item.id === product.id,
      );

      if (!updatedProduct) {
        throw new Error('Product not found.');
      }

      updatedProduct.quantity = product.quantity;

      updatedProducts.push(updatedProduct);
    });

    return this.ormRepository.save(updatedProducts);
  }
}

export default ProductsRepository;
