import { type Category } from "@/lib/api/categories/types";

export type CategoryWithId = Category & { id: number };
