const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const DATAFILE = path.join(__dirname, "data.json");

const app = express();
app.use(cors());
app.use(bodyParser.json());

function readData() {
  if (!fs.existsSync(DATAFILE)) {
    fs.writeFileSync(
      DATAFILE,
      JSON.stringify({ products: [], transactions: [] }, null, 2)
    );
  }
  return JSON.parse(fs.readFileSync(DATAFILE));
}

function writeData(d) {
  fs.writeFileSync(DATAFILE, JSON.stringify(d, null, 2));
}

app.get("/api/products", (req, res) => {
  const d = readData();
  res.json(d.products);
});

app.post("/api/products", (req, res) => {
  const d = readData();
  const prod = req.body;
  prod.id = Date.now().toString();
  prod.quantity = prod.quantity || 0;
  d.products.push(prod);
  writeData(d);
  res.json(prod);
});

app.put("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const d = readData();
  const idx = d.products.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).send("Not found");
  d.products[idx] = { ...d.products[idx], ...req.body };
  writeData(d);
  res.json(d.products[idx]);
});

app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const d = readData();
  d.products = d.products.filter((p) => p.id !== id);
  writeData(d);
  res.json({ ok: true });
});

app.post("/api/transactions", (req, res) => {
  let { type, productId, quantity, unitPrice } = req.body;
  if (!type || !productId || !quantity) {
    return res.status(400).send("Missing fields");
  }

  type = type.toLowerCase(); 

  const d = readData();
  const prod = d.products.find((p) => p.id === productId);

  if (!prod) return res.status(404).send("Product not found");

  const q = Number(quantity);
  const price = Number(unitPrice) || Number(prod.price) || 0;

  if (type === "stock-in") {
    prod.quantity = (Number(prod.quantity) || 0) + q;
    const cost = price * q;
    const t = {
      id: Date.now().toString(),
      type: "stock-in",
      productId,
      productName: prod.name,
      quantity: q,
      unitPrice: price,
      moneyFlow: -Math.abs(cost), 
      date: new Date().toISOString(),
    };
    d.transactions.push(t);
    writeData(d);
    return res.json(t);
  } else if (type === "sale") {
    if (Number(prod.quantity) < q) {
      return res.status(400).send("Not enough stock");
    }
    prod.quantity = Number(prod.quantity) - q;
    const revenue = price * q;
    const t = {
      id: Date.now().toString(),
      type: "sale",
      productId,
      productName: prod.name,
      quantity: q,
      unitPrice: price,
      moneyFlow: revenue, 
      date: new Date().toISOString(),
    };
    d.transactions.push(t);
    writeData(d);
    return res.json(t);
  } else {
    return res.status(400).send("Invalid type (must be 'sale' or 'stock-in')");
  }
});

app.get("/api/transactions", (req, res) => {
  const d = readData();
  res.json(d.transactions);
});

app.get("/api/report", (req, res) => {
  const d = readData();
  const totalMoneyIn = d.transactions
    .filter((t) => t.type === "sale")
    .reduce((s, t) => s + t.moneyFlow, 0);
  const totalMoneyOut = d.transactions
    .filter((t) => t.type === "stock-in")
    .reduce((s, t) => s + Math.abs(t.moneyFlow), 0);

  const lowStock = d.products.filter(
    (p) => Number(p.quantity) <= (p.reorderLevel || 5)
  );

  res.json({
    totalMoneyIn,
    totalMoneyOut,
    lowStock,
    products: d.products,
    transactions: d.transactions, 
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("✅ Server running on port", PORT));
