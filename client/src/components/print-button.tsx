import { type ColumnDef } from "@tanstack/react-table";
import { Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

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

interface PrintButtonProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
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
}

export function PrintButton<TData>({
  data,
  columns,
  title,
  filterContext,
  variant = "outline",
}: PrintButtonProps<TData>) {
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

  return (
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-9 w-9 p-0"
          size="icon"
          title="Print Report"
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
            Review the report before printing. Use the Print button to open your
            browser's print dialog.
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
            <PrintableTable
              columns={columns}
              data={data}
              filterContext={filterContext}
              title={title}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
