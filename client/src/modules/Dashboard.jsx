import React, { useEffect, useState } from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-LS", { style: "currency", currency: "LSL" }).format(
    value
  );

export default function Dashboard() {
  const [report, setReport] = useState(null);
  const API_BASE = "https://wings-cafe-backend.onrender.com";

  useEffect(() => {
    fetch("/api/report")
    
      .then((r) => r.json())
      .then(setReport)
      .catch(() => null);
  }, []);

  if (!report) {
    return <p>Loading...</p>;
  }

  const totalStock = report.products.reduce(
    (sum, p) => sum + Number(p.quantity || 0),
    0
  );

  const salesTransactions = report.transactions
    ? report.transactions.filter((t) => t.type === "sale")
    : [];

  const salesCount = salesTransactions.length;

  const totalRevenue = salesTransactions.reduce(
    (sum, t) => sum + Number(t.moneyFlow || 0),
    0
  );

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
    bestSeller =
      report.products.find((p) => p.id === bestProductId) || {
        name:
          report.transactions.find((t) => t.productId === bestProductId)
            ?.productName || "Deleted Product",
      };
  }

  const categories = {};
  report.products.forEach((p) => {
    if (!categories[p.category]) {
      categories[p.category] = [];
    }
    categories[p.category].push(p);
  });

  return (
    <div className="dashboard-container">
      <h2>Overview</h2>

      <div className="overview-grid">
        <div className="overview-card">
          <h3>📦 Stock Available</h3>
          <p>{totalStock} items</p>
        </div>
        <div className="overview-card">
          <h3>🛒 Sales</h3>
          <p>{salesCount} transactions</p>
        </div>
        <div className="overview-card">
          <h3>💰 Total Revenue</h3>
          <p>{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="overview-card">
          <h3>⭐ Best Seller</h3>
          {bestSeller ? <p>{bestSeller.name}</p> : <p className="small">No sales yet</p>}
        </div>
      </div>

      <h3>Menu</h3>
      <div className="menu-grid">
        {Object.keys(categories).map((cat) => {
          const items = categories[cat];
          if (items.length === 0) return null;
          return (
            <div key={cat} className="menu-card">
              <h3 className="menu-title">{cat}</h3>
              <div className="category-items">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className={`item-row ${Number(p.quantity) <= 5 ? "low-stock" : ""}`}
                  >
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="item-img" />
                    ) : (
                      <div className="item-img placeholder">No Image</div>
                    )}
                    <div className="item-info">
                      <h4>{p.name}</h4>
                      <p>{p.description}</p>
                      <p>
                        {Number(p.quantity) === 0 ? (
                          <span className="soldout">SOLD OUT</span>
                        ) : (
                          `${p.quantity} left`
                        )}
                      </p>
                      <p className="price">{formatCurrency(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
