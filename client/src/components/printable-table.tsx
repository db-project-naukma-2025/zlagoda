import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

interface PrintableTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title: string;
  filterContext?: Record<string, string> | undefined;
}

export function PrintableTable<TData>({
  data,
  columns,
  title,
  filterContext,
}: PrintableTableProps<TData>) {
  const printableColumns = React.useMemo(() => {
    return columns.filter((col) => {
      const id = typeof col.id === "string" ? col.id : "";
      return !id.includes("actions") && !id.includes("select");
    });
  }, [columns]);

  const table = useReactTable({
    data,
    columns: printableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const getSimpleHeaderText = (column: Column<TData>): string => {
    if (column.id) {
      return column.id
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str: string) => str.toUpperCase())
        .trim();
    }

    return "Column";
  };

  return (
    <div className="printable-content">
      <style>{`
        .printable-content {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 20px;
          background: white;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #000;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #000;
        }
        
        .print-title {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #000;
        }
        
        .print-filters {
          font-size: 16px;
          color: #666;
          margin-top: 8px;
          line-height: 1.4;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          font-size: 14px;
          table-layout: fixed;
        }
        
        .print-table th,
        .print-table td {
          border: 1px solid #ddd;
          padding: 12px 10px;
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.4;
        }
        
        .print-table th {
          background-color: #f8f9fa;
          font-weight: 700;
          font-size: 13px;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 14px 10px;
        }
        
        .print-table td {
          font-size: 13px;
          color: #1f2937;
          font-weight: 500;
        }
        
        .print-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .print-table tbody tr:hover {
          background-color: #f3f4f6;
        }
        
        .print-footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }
        
        .print-footer p {
          margin: 0;
        }

        @media print {
          .printable-content {
            padding: 0;
            margin: 0;
            width: 100%;
            max-width: none;
          }
          
          .print-header {
            margin-bottom: 20px;
            padding-bottom: 12px;
          }
          
          .print-title {
            font-size: 20px;
          }
          
          .print-filters {
            font-size: 12px;
          }
          
          .print-table {
            font-size: 11px;
          }
          
          .print-table th {
            font-size: 10px;
            background-color: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            padding: 10px 8px;
          }
          
          .print-table td {
            font-size: 10px;
            padding: 10px 8px;
          }
          
          .print-table th,
          .print-table td {
            padding: 10px 8px;
          }
          
          .print-footer {
            margin-top: 24px;
            padding-top: 12px;
            font-size: 10px;
            flex-direction: column;
            gap: 4px;
          }
          
          .print-table tbody tr:nth-child(even) {
            background-color: #f9f9f9 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          /* Ensure table breaks properly across pages */
          .print-table {
            page-break-inside: auto;
          }
          
          .print-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .print-table thead {
            display: table-header-group;
          }
          
          .print-table tfoot {
            display: table-footer-group;
          }
        }
      `}</style>

      <div className="print-header">
        <h1 className="print-title">{title}</h1>
        {filterContext && (
          <div className="print-filters">
            {Object.entries(filterContext).map(([key, value]) => (
              <div key={key}>
                {key === "productName" && `Product: ${value}`}
                {key === "employeeName" && `Employee: ${value}`}
                {key === "dateRange" && `Date Range: ${value}`}
              </div>
            ))}
          </div>
        )}
      </div>

      <table className="print-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>{getSimpleHeaderText(header.column)}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-footer">
        <p>Generated: {new Date().toLocaleString()}</p>
        <p>Total: {data.length} records</p>
      </div>
    </div>
  );
}
