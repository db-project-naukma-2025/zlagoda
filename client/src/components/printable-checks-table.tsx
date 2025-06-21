import { format } from "date-fns";

import { type Check } from "@/lib/api/checks/types";

interface PrintableChecksTableProps {
  data: Check[];
  title: string;
  filterContext?: Record<string, string> | undefined;
  employeeLookup: Record<string, string>;
  productLookup: Record<string, string>;
}

export function PrintableChecksTable({
  data,
  title,
  filterContext,
  employeeLookup,
  productLookup,
}: PrintableChecksTableProps) {
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
        
        .checks-container {
          margin-bottom: 24px;
          page-break-inside: avoid;
        }
        
        .check-header {
          background-color: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 8px 8px 0 0;
          padding: 16px 20px;
          margin-bottom: 0;
          font-weight: 600;
          font-size: 16px;
          color: #212529;
        }
        
        .check-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          align-items: flex-start;
        }
        
        .check-detail {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .check-detail-label {
          font-size: 12px;
          color: #6c757d;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 2px;
        }
        
        .check-detail-value {
          font-size: 15px;
          font-weight: 600;
          color: #212529;
          line-height: 1.3;
        }
        
        .sales-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          font-size: 14px;
          border: 2px solid #dee2e6;
          border-top: none;
          border-radius: 0;
        }
        
        .sales-table th {
          background-color: #e9ecef;
          border: 1px solid #dee2e6;
          padding: 12px 14px;
          text-align: left;
          font-weight: 700;
          font-size: 13px;
          color: #495057;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .sales-table td {
          border: 1px solid #dee2e6;
          padding: 12px 14px;
          font-size: 13px;
          color: #212529;
          vertical-align: middle;
          line-height: 1.4;
        }
        
        .sales-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .sales-table tbody tr:hover {
          background-color: #e9ecef;
        }
        
        .check-totals {
          background-color: #fff3cd;
          border: 2px solid #ffeaa7;
          border-top: none;
          padding: 16px 20px;
          border-radius: 0 0 8px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 15px;
          font-weight: 600;
          color: #856404;
        }
        
        .check-totals-center {
          flex: 1;
          text-align: center;
          font-size: 16px;
          font-weight: 700;
        }
        
        .check-totals-side {
          font-size: 14px;
          font-weight: 600;
        }
        
        .monetary-value {
          font-family: 'Courier New', monospace;
          font-weight: 700;
        }
        
        .card-badge {
          background-color: #d1ecf1;
          color: #0c5460;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }
        
        .no-card {
          color: #6c757d;
          font-style: italic;
          font-size: 13px;
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
            font-size: 22px;
          }
          
          .print-filters {
            font-size: 12px;
          }
          
          .checks-container {
            margin-bottom: 20px;
          }
          
          .check-header {
            font-size: 14px;
            padding: 12px 16px;
          }
          
          .check-detail-label {
            font-size: 10px;
          }
          
          .check-detail-value {
            font-size: 13px;
          }
          
          .sales-table {
            font-size: 12px;
          }
          
          .sales-table th {
            font-size: 11px;
            padding: 8px 10px;
          }
          
          .sales-table td {
            font-size: 11px;
            padding: 8px 10px;
          }
          
          .check-totals {
            font-size: 13px;
            padding: 12px 16px;
          }
          
          .check-totals-center {
            font-size: 14px;
          }
          
          .check-totals-side {
            font-size: 12px;
          }
          
          .print-footer {
            margin-top: 24px;
            padding-top: 12px;
            font-size: 10px;
            flex-direction: column;
            gap: 4px;
          }
          
          .checks-container {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .check-header {
            page-break-after: avoid;
          }
          
          .sales-table {
            page-break-inside: auto;
          }
          
          .sales-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
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

      {data.map((check) => {
        const totalItems = check.sales.reduce(
          (sum, sale) => sum + sale.product_number,
          0,
        );
        const employeeName =
          employeeLookup[check.id_employee] ?? "Unknown Employee";
        const checkDate = new Date(check.print_date);

        return (
          <div className="checks-container" key={check.check_number}>
            <div className="check-header">
              <div className="check-info">
                <div className="check-detail">
                  <div className="check-detail-label">Check Number</div>
                  <div className="check-detail-value">{check.check_number}</div>
                </div>
                <div className="check-detail">
                  <div className="check-detail-label">Date & Time</div>
                  <div className="check-detail-value">
                    {format(checkDate, "MMM dd, yyyy 'at' HH:mm")}
                  </div>
                </div>
                <div className="check-detail">
                  <div className="check-detail-label">Cashier</div>
                  <div className="check-detail-value">{employeeName}</div>
                </div>
                <div className="check-detail">
                  <div className="check-detail-label">Customer Card</div>
                  <div className="check-detail-value">
                    {check.card_number ? (
                      <span className="card-badge">{check.card_number}</span>
                    ) : (
                      <span className="no-card">No card</span>
                    )}
                  </div>
                </div>
                <div className="check-detail">
                  <div className="check-detail-label">Items</div>
                  <div className="check-detail-value">
                    {check.sales.length} types, {totalItems} total
                  </div>
                </div>
              </div>
            </div>

            <table className="sales-table">
              <thead>
                <tr>
                  <th>UPC</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {check.sales.length > 0 ? (
                  check.sales.map((sale, index) => {
                    const productName =
                      productLookup[sale.UPC] ??
                      `Unknown Product (${sale.UPC})`;
                    const lineTotal = sale.selling_price * sale.product_number;

                    return (
                      <tr key={`${sale.UPC}-${index.toString()}`}>
                        <td style={{ fontFamily: "Courier New, monospace" }}>
                          {sale.UPC}
                        </td>
                        <td>{productName}</td>
                        <td style={{ textAlign: "center" }}>
                          {sale.product_number}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="monetary-value">
                            ₴{sale.selling_price.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="monetary-value">
                            ₴{lineTotal.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        color: "#6c757d",
                        fontStyle: "italic",
                      }}
                    >
                      No sales items in this check
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="check-totals">
              <div className="check-totals-side">
                <strong>VAT (20%): </strong>
                <span className="monetary-value">₴{check.vat.toFixed(2)}</span>
              </div>
              <div className="check-totals-center">
                <strong>TOTAL: </strong>
                <span className="monetary-value">
                  ₴{check.sum_total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <div className="print-footer">
        <p>Generated: {new Date().toLocaleString()}</p>
        <p>Total: {data.length} checks</p>
      </div>
    </div>
  );
}
