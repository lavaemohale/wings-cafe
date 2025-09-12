import React, { useEffect, useState } from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-LS", { style: "currency", currency: "LSL" }).format(
    value
  );

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [transactions, setTransactions] = useState([]);

  function load() {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/transactions").then((r) => r.json()).then(setTransactions);
  }

  useEffect(() => load(), []);

  function sell() {
    const product = products.find(
      (p) => p.name.toLowerCase() === productName.toLowerCase()
    );

    if (!product) {
      alert("Product not found. Please type an existing product name.");
      return;
    }

    fetch("/api/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "sale",
        productId: product.id,
        quantity: qty,
        unitPrice: unitPrice || product.price,
      }),
    }).then(() => {
      setQty(1);
      setUnitPrice(0);
      setProductName("");
      load();
    });
  }

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.quantity || 0),
    0
  );

  const salesTransactions = transactions.filter((t) => t.type === "sale");
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
      products.find((p) => p.id === bestProductId) || { name: "Deleted Product" };
  }

  return (
    <div className="main">
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
          <h3>💰 Revenue</h3>
          <p>{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="overview-card">
          <h3>⭐ Best Seller</h3>
          {bestSeller ? <p>{bestSeller.name}</p> : <p className="small">No sales yet</p>}
        </div>
      </div>
      <div className="card">
        <h2>Sales</h2>
        <div className="form-row">
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Type product name"
          />
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            placeholder="Quantity"
          />
          
          <button onClick={sell}>Record Sale (money in)</button>
        </div>

        <h3>Recent transactions</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Money</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions
              .slice()
              .reverse()
              .map((t) => (
                <tr key={t.id}>
                  <td>{t.type}</td>
                  <td>
                    {t.productName ||
                      products.find((p) => p.id === t.productId)?.name ||
                      "Deleted Product"}
                  </td>
                  <td>{t.quantity}</td>
                  <td>{formatCurrency(t.moneyFlow)}</td>
                  <td>{new Date(t.date).toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
