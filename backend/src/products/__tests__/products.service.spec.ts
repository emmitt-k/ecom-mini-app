import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from '../products.service';
import { Product } from '../entities/product.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockRepository: jest.Mocked<any>;

  const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    imageUrl: 'http://example.com/image.jpg',
    stockQuantity: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockProduct2 = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Second Product',
    description: 'Another Description',
    price: 49.99,
    imageUrl: null,
    stockQuantity: 5,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  };

  beforeEach(async () => {
    mockRepository = {
      createQueryBuilder: jest.fn(() => ({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products without filters', async () => {
      const mockGetMany = jest
        .fn()
        .mockResolvedValue([mockProduct, mockProduct2]);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      const result = await service.findAll({});

      expect(result.data).toHaveLength(2);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.limit).toBe(20);
      expect(result.data[0]).toHaveProperty('id', mockProduct.id);
      expect(result.data[0]).toHaveProperty('price', mockProduct.price);
    });

    it('should apply search filter', async () => {
      const mockGetMany = jest.fn().mockResolvedValue([mockProduct]);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      await service.findAll({ search: 'Test' });

      const queryBuilder = mockRepository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%Test%' }),
      );
    });

    it('should apply minPrice filter', async () => {
      const mockGetMany = jest.fn().mockResolvedValue([mockProduct]);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      await service.findAll({ minPrice: 50 });

      const queryBuilder = mockRepository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price >= :minPrice',
        { minPrice: 50 },
      );
    });

    it('should apply maxPrice filter', async () => {
      const mockGetMany = jest.fn().mockResolvedValue([mockProduct2]);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      await service.findAll({ maxPrice: 60 });

      const queryBuilder = mockRepository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price <= :maxPrice',
        { maxPrice: 60 },
      );
    });

    it('should apply both minPrice and maxPrice filters', async () => {
      const mockGetMany = jest.fn().mockResolvedValue([mockProduct]);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      await service.findAll({ minPrice: 50, maxPrice: 100 });

      const queryBuilder = mockRepository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price BETWEEN :minPrice AND :maxPrice',
        { minPrice: 50, maxPrice: 100 },
      );
    });

    it('should apply cursor-based pagination', async () => {
      const cursor = Buffer.from(
        JSON.stringify({
          id: mockProduct.id,
          createdAt: mockProduct.createdAt.toISOString(),
        }),
      ).toString('base64url');

      const mockGetMany = jest.fn().mockResolvedValue([mockProduct2]);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      await service.findAll({ cursor, limit: 10 });

      const queryBuilder = mockRepository.createQueryBuilder();
      expect(queryBuilder.limit).toHaveBeenCalledWith(11);
    });

    it('should return hasMore=true when more products exist', async () => {
      const extraProducts = Array(21).fill(mockProduct);
      const mockGetMany = jest.fn().mockResolvedValue(extraProducts);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      const result = await service.findAll({ limit: 20 });

      expect(result.data).toHaveLength(20);
      expect(result.meta.hasMore).toBe(true);
      expect(result.meta.nextCursor).toBeTruthy();
    });

    it('should use custom limit', async () => {
      const mockGetMany = jest.fn().mockResolvedValue([mockProduct]);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      const result = await service.findAll({ limit: 10 });

      expect(result.meta.limit).toBe(10);
    });

    it('should default limit to 20', async () => {
      const mockGetMany = jest.fn().mockResolvedValue([mockProduct]);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      const result = await service.findAll({});

      expect(result.meta.limit).toBe(20);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProduct.id);

      expect(result).toHaveProperty('id', mockProduct.id);
      expect(result).toHaveProperty('name', mockProduct.name);
      expect(result).toHaveProperty('price', mockProduct.price);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cursor encoding/decoding', () => {
    it('should generate valid nextCursor for pagination', async () => {
      const mockGetMany = jest
        .fn()
        .mockResolvedValue([mockProduct, mockProduct2]);
      mockRepository.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      });

      const result = await service.findAll({ limit: 1 });

      expect(result.meta.nextCursor).toBeTruthy();

      // Verify cursor can be decoded
      const decoded = JSON.parse(
        Buffer.from(result.meta.nextCursor!, 'base64url').toString('utf-8'),
      );
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('createdAt');
    });

    it('should throw NotFoundException for invalid cursor', async () => {
      await expect(
        service.findAll({ cursor: 'invalid-cursor' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
