import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../products.controller';
import { ProductsService } from '../products.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: jest.Mocked<ProductsService>;

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

  const mockPaginatedResponse = {
    data: [mockProduct],
    meta: {
      nextCursor: null,
      hasMore: false,
      limit: 20,
    },
  };

  beforeEach(async () => {
    mockProductsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<ProductsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      mockProductsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockProductsService.findAll).toHaveBeenCalledWith({});
      expect(mockProductsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should pass query parameters to service', async () => {
      mockProductsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const query = {
        search: 'test',
        minPrice: 10,
        maxPrice: 100,
        limit: 10,
        cursor: 'some-cursor',
      };

      await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle empty query', async () => {
      mockProductsService.findAll.mockResolvedValue({
        data: [],
        meta: {
          nextCursor: null,
          hasMore: false,
          limit: 20,
        },
      });

      const result = await controller.findAll({});

      expect(result.data).toEqual([]);
      expect(result.meta.hasMore).toBe(false);
    });

    it('should handle search query', async () => {
      mockProductsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const query = { search: 'laptop' };
      await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle price range query', async () => {
      mockProductsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const query = { minPrice: 50, maxPrice: 200 };
      await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle pagination with cursor', async () => {
      mockProductsService.findAll.mockResolvedValue({
        data: [mockProduct],
        meta: {
          nextCursor: 'next-page-cursor',
          hasMore: true,
          limit: 10,
        },
      });

      const result = await controller.findAll({
        limit: 10,
        cursor: 'current-cursor',
      });

      expect(result.meta.hasMore).toBe(true);
      expect(result.meta.nextCursor).toBe('next-page-cursor');
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(mockProduct.id);
      expect(mockProductsService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw when product not found', async () => {
      mockProductsService.findOne.mockRejectedValue(
        new Error('Product not found'),
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        'Product not found',
      );
      expect(mockProductsService.findOne).toHaveBeenCalledWith(
        'non-existent-id',
      );
    });

    it('should handle valid UUID format', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = await controller.findOne(validUuid);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(validUuid);
    });
  });
});
