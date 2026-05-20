import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual, Like, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(query: ListProductsQueryDto): Promise<PaginatedProductsResponseDto> {
    const { search, minPrice, maxPrice, limit = 20, cursor } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Apply cursor-based pagination
    // Using createdAt as cursor for consistent ordering
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      queryBuilder.andWhere(
        '(product.createdAt < :cursorDate OR (product.createdAt = :cursorDate AND product.id < :cursorId))',
        {
          cursorDate: decodedCursor.createdAt,
          cursorId: decodedCursor.id,
        },
      );
    }

    // Order by createdAt desc, then id desc for consistent pagination
    queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('product.id', 'DESC')
      .limit(limit + 1); // Fetch one extra to check if there's more

    const products = await queryBuilder.getMany();

    // Check if there's more data
    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, limit) : products;

    // Generate next cursor
    const nextCursor = hasMore && data.length > 0
      ? this.encodeCursor(data[data.length - 1])
      : null;

    return {
      data: data.map(this.toResponseDto),
      meta: {
        nextCursor,
        hasMore,
        limit,
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return this.toResponseDto(product);
  }

  private encodeCursor(product: Product): string {
    const cursorData = {
      id: product.id,
      createdAt: product.createdAt.toISOString(),
    };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64url');
  }

  private decodeCursor(cursor: string): { id: string; createdAt: string } {
    try {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      throw new NotFoundException('Invalid cursor format');
    }
  }

  private toResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price.toString()),
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
