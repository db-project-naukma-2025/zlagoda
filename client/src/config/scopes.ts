const scopes = {
  employee: {
    can_view: "employee.can_view",
    can_create: "employee.can_create",
    can_update: "employee.can_update",
    can_delete: "employee.can_delete",
    print_to_pdf: "employee.print_to_pdf",
    view_self: "employee.view_self",
  },
  product: {
    can_view: "product.can_view",
    can_create: "product.can_create",
    can_update: "product.can_update",
    can_delete: "product.can_delete",
    print_to_pdf: "product.print_to_pdf",
  },
  store_product: {
    can_view: "storeproduct.can_view",
    can_create: "storeproduct.can_create",
    can_update: "storeproduct.can_update",
    can_delete: "storeproduct.can_delete",
    print_to_pdf: "storeproduct.print_to_pdf",
  },
  category: {
    can_view: "category.can_view",
    can_create: "category.can_create",
    can_update: "category.can_update",
    can_delete: "category.can_delete",
    print_to_pdf: "category.print_to_pdf",
  },
  customer_card: {
    can_view: "customercard.can_view",
    can_create: "customercard.can_create",
    can_update: "customercard.can_update",
    can_delete: "customercard.can_delete",
    print_to_pdf: "customercard.print_to_pdf",
  },
  check: {
    can_view: "relationalcheck.can_view",
    can_create: "relationalcheck.can_create",
    print_to_pdf: "relationalcheck.print_to_pdf",
  },
};

export default scopes;
