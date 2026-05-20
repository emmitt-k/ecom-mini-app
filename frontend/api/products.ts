import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { httpClient } from "./http-client";

// Types
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export interface ProductsFilter {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  cursor?: string;
  limit?: number;
}

// API Functions
export async function getProducts(
  filter: ProductsFilter
): Promise<ProductsResponse> {
  const { data } = await httpClient.get("/products", { params: filter });
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await httpClient.get(`/products/${id}`);
  return data;
}

// React Query Hooks
export function useProducts(filter: Omit<ProductsFilter, "cursor">) {
  return useInfiniteQuery({
    queryKey: ["products", filter],
    queryFn: ({ pageParam }) =>
      getProducts({ ...filter, cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}
