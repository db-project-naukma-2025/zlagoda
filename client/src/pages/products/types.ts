import { type Product } from "@/lib/api/products/types";

export type ProductWithId = Product & { id: number };
