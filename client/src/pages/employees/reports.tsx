import { useState } from "react";

import { ReportDialog } from "@/components/common/report-dialog";
import { ReportTable } from "@/components/common/report-table";
import { useGetEmployeesOnlyWithPromotionalSales } from "@/lib/api/employees";

import { createEmployeeColumns } from "./table";

export function EmployeesOnlyWithPromotionalSalesReportDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: reportData, isLoading } =
    useGetEmployeesOnlyWithPromotionalSales();

  const columns = createEmployeeColumns(false, false);

  return (
    <ReportDialog
      description="Find employees who have made only promotional sales, either itself promotional, or that have a promotional variant."
      isOpen={isOpen}
      title="Employees Only With Promotional Sales Report"
      triggerText="Employees Only With Promotional Sales Report"
      onOpenChange={setIsOpen}
    >
      <ReportTable
        columns={columns}
        data={reportData}
        isLoading={isLoading}
        keyField="id_employee"
      />
    </ReportDialog>
  );
}
