import { type ChecksMetadata } from "@/lib/api/checks/types";

interface ChecksMetadataProps {
  metadata?: ChecksMetadata | undefined;
  filterContext?:
    | {
        productName?: string | undefined;
        employeeName?: string | undefined;
        dateRange?: string | undefined;
      }
    | undefined;
}

export function ChecksMetadataDisplay({
  metadata,
  filterContext,
}: ChecksMetadataProps) {
  if (!metadata) {
    return null;
  }

  const getContextTitle = () => {
    const contexts = [];
    if (filterContext?.productName) {
      contexts.push(`Product: ${filterContext.productName}`);
    }
    if (filterContext?.employeeName) {
      contexts.push(`Employee: ${filterContext.employeeName}`);
    }
    if (filterContext?.dateRange) {
      contexts.push(`Period: ${filterContext.dateRange}`);
    }

    if (contexts.length > 0) {
      return `Summary Statistics - ${contexts.join(" | ")}`;
    }
    return "Summary Statistics - All Records";
  };

  const getLabel = (baseLabel: string) => {
    if (filterContext?.productName) {
      return `${baseLabel} (${filterContext.productName})`;
    }
    return baseLabel;
  };

  return (
    <div className="px-4">
      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="font-medium mb-3 text-sm">{getContextTitle()}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₴{metadata.total_sum.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {getLabel("Total Sales")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
            ₴{metadata.total_vat.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {getLabel("Total VAT")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metadata.total_items_count.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {filterContext?.productName ? "Units Sold" : "Total Items"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {metadata.total_product_types.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {filterContext?.productName
                ? "Checks with Product"
                : "Product Types"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {metadata.checks_count.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Checks</div>
          </div>
        </div>
      </div>
    </div>
  );
}
