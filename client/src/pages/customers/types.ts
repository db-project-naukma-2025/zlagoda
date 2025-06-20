import { type CustomerCard } from "@/lib/api/customer-cards/types";

export type CustomerCardWithId = CustomerCard & { id: string };
