import { type ColumnDef } from "@tanstack/react-table";
import { Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import { PrintableChecksTable } from "@/components/printable-checks-table";
import { PrintableTable } from "@/components/printable-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Check } from "@/lib/api/checks/types";

interface BasePrintButtonProps {
  title: string;
  filterContext?: Record<string, string> | undefined;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  description?: string;
  buttonTitle?: string;
}

interface StandardTableProps<TData> extends BasePrintButtonProps {
  tableType: "standard";
  data: TData[];
  columns: ColumnDef<TData>[];
}

interface ChecksTableProps extends BasePrintButtonProps {
  tableType: "checks";
  data: Check[];
  employeeLookup: Record<string, string>;
  productLookup: Record<string, string>;
}

type PrintButtonProps<TData = unknown> =
  | StandardTableProps<TData>
  | ChecksTableProps;

export function PrintButton<TData = unknown>(props: PrintButtonProps<TData>) {
  const {
    title,
    filterContext,
    variant = "outline",
    description,
    buttonTitle,
  } = props;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${title} - ${new Date().toLocaleDateString()}`,
    onAfterPrint: () => {
      setIsPreviewOpen(false);
    },
  });

  const handlePreviewAndPrint = () => {
    setIsPreviewOpen(true);
  };

  const defaultDescription =
    props.tableType === "checks"
      ? "Review the detailed checks report before printing. This report shows each check with all its sales items listed below."
      : "Review the report before printing. Use the Print button to open your browser's print dialog.";

  const defaultButtonTitle =
    props.tableType === "checks"
      ? "Print Detailed Checks Report"
      : "Print Report";

  const renderTable = () => {
    if (props.tableType === "checks") {
      return (
        <PrintableChecksTable
          data={props.data}
          employeeLookup={props.employeeLookup}
          filterContext={filterContext}
          productLookup={props.productLookup}
          title={title}
        />
      );
    } else {
      return (
        <PrintableTable
          columns={props.columns}
          data={props.data}
          filterContext={filterContext}
          title={title}
        />
      );
    }
  };

  return (
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-9 w-9 p-0"
          size="icon"
          title={buttonTitle ?? defaultButtonTitle}
          variant={variant}
          onClick={handlePreviewAndPrint}
        >
          <Printer className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-[95vw] w-[95vw] max-h-[95vh] overflow-auto p-6"
        style={{ maxWidth: "95vw", width: "95vw" }}
      >
        <DialogHeader>
          <DialogTitle>Print Preview - {title}</DialogTitle>
          <DialogDescription>
            {description ?? defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mb-4">
          <Button className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsPreviewOpen(false);
            }}
          >
            Cancel
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-white" ref={printRef}>
            {renderTable()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
