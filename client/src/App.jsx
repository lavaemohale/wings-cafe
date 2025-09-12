import React, { useState } from "react";
import Dashboard from "./modules/Dashboard";
import Products from "./modules/Products";
import Sales from "./modules/Sales";
import Reports from "./modules/Reports";
import Inventory from "./modules/Inventory";
import Footer from "./components/Footer"; 

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const tabs = ["dashboard", "products", "inventory", "sales", "reports"]; 

  return (
    <div className="app">
      <header className="header">
        <h1>Wings Cafe</h1>
      </header>

      <nav className="nav">
        {tabs.map((t) => (
          <button
            key={t}
            className={t === tab ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === "dashboard" && <Dashboard />}
        {tab === "products" && <Products />}
        {tab === "inventory" && <Inventory />}
        {tab === "sales" && <Sales />}
        {tab === "reports" && <Reports />}
      </main>

      <Footer />
    </div>
  );
}
