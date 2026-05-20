export class ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}
