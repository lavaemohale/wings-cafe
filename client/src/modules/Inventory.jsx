import React, {useEffect, useState} from "react";
export default function Inventory(){
  const [products,setProducts]=useState([]);
  const [sel,setSel]=useState('');
  const [qty,setQty]=useState(0);
  const [price,setPrice]=useState(0);
  function load(){ fetch('/api/products').then(r=>r.json()).then(setProducts); }
  useEffect(()=>load(),[]);
  function stockIn(){
    fetch('/api/transactions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type:'stock-in',productId:sel,quantity:qty,unitPrice:price})})
    fetch("https://wings-cafe-backend.onrender.com/api/products")
    .then(()=>{ setQty(0); setPrice(0); load(); });
  }
  return (
    <div className="card">
      <h2>Inventory (Stock In)</h2>
      <div className="form-row">
        <select value={sel} onChange={e=>setSel(e.target.value)}>
          <option value="">Select product</option>
          {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="number" value={qty} onChange={e=>setQty(parseInt(e.target.value)||0)} placeholder="Quantity"/>
        <input type="number" value={price} onChange={e=>setPrice(parseFloat(e.target.value)||0)} placeholder="Unit cost"/>
        <button onClick={stockIn}>Stock In (money out)</button>
      </div>
      <h3>Current stock</h3>
      <table className="table">
        <thead><tr><th>Name</th><th>Qty</th><th>Reorder Level</th></tr></thead>
        <tbody>
          {products.map(p=><tr key={p.id}><td>{p.name}</td><td>{p.quantity}</td><td>{p.reorderLevel||5}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}