const scopes = {
  employee: {
    can_view: "employee.can_view",
    can_create: "employee.can_create",
    can_update: "employee.can_update",
    can_delete: "employee.can_delete",
  },
  product: {
    can_view: "product.can_view",
    can_create: "product.can_create",
    can_update: "product.can_update",
    can_delete: "product.can_delete",
  },
  store_product: {
    can_view: "storeproduct.can_view",
    can_create: "storeproduct.can_create",
    can_update: "storeproduct.can_update",
    can_delete: "storeproduct.can_delete",
  },
  category: {
    can_view: "category.can_view",
    can_create: "category.can_create",
    can_update: "category.can_update",
    can_delete: "category.can_delete",
  },
  customer_card: {
    can_view: "customercard.can_view",
    can_create: "customercard.can_create",
    can_update: "customercard.can_update",
    can_delete: "customercard.can_delete",
  },
};

export default scopes;
