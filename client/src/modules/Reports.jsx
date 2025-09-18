import React, { useEffect, useState } from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-LS", { style: "currency", currency: "LSL" }).format(
    value
  );

export default function Reports() {
  const [report, setReport] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/report").then((r) => r.json()).then(setReport);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("https://wings-cafe-backend.onrender.com/api/products")
  }, []);

  if (!report) {
    return <p>Loading...</p>;
  }

  const totalMoneyIn = report.transactions
    ? report.transactions
        .filter((t) => t.type === "sale")
        .reduce((sum, t) => sum + Number(t.moneyFlow || 0), 0)
    : 0;

  const totalMoneyOut = report.transactions
    ? report.transactions
        .filter((t) => t.type === "stock-in")
        .reduce((sum, t) => sum + Math.abs(Number(t.moneyFlow || 0)), 0)
    : 0;

  const totalRevenue = totalMoneyIn - totalMoneyOut;

  const salesTransactions = report.transactions
    ? report.transactions.filter((t) => t.type === "sale")
    : [];

  const salesByProduct = {};
  salesTransactions.forEach((t) => {
    salesByProduct[t.productId] =
      (salesByProduct[t.productId] || 0) + Number(t.quantity || 0);
  });

  let bestSeller = null;
  if (Object.keys(salesByProduct).length > 0) {
    const bestProductId = Object.keys(salesByProduct).reduce((a, b) =>
      salesByProduct[a] > salesByProduct[b] ? a : b
    );
    bestSeller = products.find((p) => p.id === bestProductId);
  }

  return (
    <div className="card">
      <h2>Reports</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Money In</th>
            <th>Money Out</th>
          </tr>
        </thead>
        <tbody>
          {report.transactions && report.transactions.length > 0 ? (
            report.transactions.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.date).toLocaleString()}</td>
                <td>{t.type}</td>
                <td>
                  {products.find((p) => p.id === t.productId)?.name ||
                    t.productId}
                </td>
                <td>{t.quantity}</td>
                <td>
                  {t.type === "sale" ? formatCurrency(t.moneyFlow) : "-"}
                </td>
                <td>
                  {t.type === "stock-in"
                    ? formatCurrency(Math.abs(t.moneyFlow))
                    : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No transactions yet</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4" style={{ fontWeight: "bold" }}>
              Totals
            </td>
            <td style={{ fontWeight: "bold" }}>
              {formatCurrency(totalMoneyIn)}
            </td>
            <td style={{ fontWeight: "bold" }}>
              {formatCurrency(totalMoneyOut)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div style={{ marginTop: "16px" }}>
        <p>
          <strong>Total Revenue:</strong> {formatCurrency(totalRevenue)}
        </p>
        <p>
          <strong>Best Selling Product:</strong>{" "}
          {bestSeller ? bestSeller.name : "None"}
        </p>
      </div>
    </div>
  );
}
