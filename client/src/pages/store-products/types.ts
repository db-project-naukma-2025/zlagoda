import { type StoreProduct } from "@/lib/api/store-products/types";

export type StoreProductWithId = StoreProduct & {
  id: string;
};
