import React, { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    quantity: 0,
    reorderLevel: 5,
    image: ""
  });

  function load() {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }

  useEffect(() => load(), []);

  function add() {
    fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    }).then(() => {
      setForm({
        name: "",
        description: "",
        category: "",
        price: 0,
        quantity: 0,
        reorderLevel: 5,
        image: ""
      });
      load();
    });
  }

  function remove(id) {
    fetch("/api/products/" + id, { method: "DELETE" }).then(() => load());
    fetch("https://wings-cafe-backend.onrender.com/api/products")
  }

  return (
    <div className="card">
      <h2>Products</h2>
      <div className="form-row">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: parseFloat(e.target.value) })
          }
        />
        <input
          placeholder="Qty"
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: parseInt(e.target.value) })
          }
        />
        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
        <button onClick={add}>Add</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Cat</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: "50px", height: "40px", objectFit: "cover" }}
                  />
                ) : (
                  "No Image"
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.price}</td>
              <td>{p.quantity}</td>
              <td>
                <button onClick={() => remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
