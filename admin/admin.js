const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzJkZWY2ZTk1OTNmMTNhNmJiNDRmZSIsImlhdCI6MTc0ODE2NTIzOH0.RuSZLl0mJjFyK5Nd0qfgzZlCA9_3ye1aynJ5TEZcPt4";

let editingId = null;
let allProducts = [];

async function fetchProducts() {
  try {
    const res = await fetch("http://localhost:5000/api/products");
    allProducts = await res.json();
    displayProducts(allProducts);
  } catch (err) {
    console.error("Помилка при завантаженні товарів", err);
  }
}

function displayProducts(products) {
  const tbody = document.querySelector("#productsTable tbody");
  tbody.innerHTML = "";

  products.forEach(product => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><img src="${product.image}" alt="img" class="product-img" /></td>
      <td>${product.name}</td>
      <td>${product.price} грн</td>
      <td>${product.category}</td>
      <td class="actions">
        <button onclick='editProductById("${product._id}")'>✏️</button>
        <button onclick='deleteProduct("${product._id}")'>🗑️</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function editProductById(id) {
  const product = allProducts.find(p => p._id === id);
  if (!product) return;

  editingId = product._id;
  const form = document.getElementById("productForm");
  form.name.value = product.name;
  form.description.value = product.description || "";
  form.price.value = product.price;
  form.category.value = product.category;
  form.image.value = product.image || "";
  document.querySelector("button[type='submit']").textContent = "Оновити товар";
}

async function deleteProduct(id) {
  if (!confirm("Ви впевнені, що хочете видалити цей товар?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      document.getElementById("result").textContent = "✅ Товар видалено";
      fetchProducts();
    } else {
      document.getElementById("result").textContent = "❌ Не вдалося видалити товар";
    }
  } catch (err) {
    console.error("Помилка видалення", err);
  }
}

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const url = editingId 
    ? `http://localhost:5000/api/products/${editingId}`
    : "http://localhost:5000/api/products";

  const method = editingId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      document.getElementById("result").textContent = editingId
        ? "✅ Товар оновлено!"
        : "✅ Товар додано!";
      e.target.reset();
      editingId = null;
      document.querySelector("button[type='submit']").textContent = "Зберегти";
      fetchProducts();
    } else {
      document.getElementById("result").textContent = "❌ Помилка: " + result.error;
    }
  } catch (err) {
    document.getElementById("result").textContent = "❌ Помилка запиту";
    console.error(err);
  }
});

fetchProducts();
