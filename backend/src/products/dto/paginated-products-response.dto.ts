import { ProductResponseDto } from './product-response.dto';

export class PaginatedProductsResponseDto {
  data: ProductResponseDto[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}
