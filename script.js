const API_URL = "http://3.83.54.153:3000/api/products"; // Replace with your API server IP

const grid = document.getElementById("grid");
const cartItems = document.getElementById("cartItems");
const totalElement = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout");

let products = []; // Fetched from API
let cart = [];

// Fetch products from the API
async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    products = await response.json();
    renderProductGrid();
  } catch (err) {
    console.error("Failed to load products:", err);
  }
}

// Display product cards
function renderProductGrid() {
  grid.innerHTML = "";

  products.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>$${item.price.toFixed(2)}</p>
      <p><small>In stock: ${item.quantity}</small></p>
      <button onclick="addToCart(${index})" ${
      item.quantity === 0 ? "disabled" : ""
    }>Add to Cart</button>
    `;

    grid.appendChild(card);
  });
}

function addToCart(index) {
  const item = products[index];
  if (item.quantity > 0) {
    cart.push({ ...item, index }); // Save the index to link back to products
    products[index].quantity -= 1;
    updateCart();
    renderProductGrid();
  }
}

function removeFromCart(cartIndex) {
  const removed = cart.splice(cartIndex, 1)[0];
  products[removed.index].quantity += 1;
  updateCart();
  renderProductGrid();
}

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const li = document.createElement("li");

    const itemNameDiv = document.createElement("div");
    itemNameDiv.className = "cart-item-name";
    itemNameDiv.textContent = `${item.name} - $${item.price.toFixed(2)}`;

    const actionDiv = document.createElement("div");
    actionDiv.className = "cart-item-action";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "✖";
    removeBtn.onclick = () => removeFromCart(index);

    actionDiv.appendChild(removeBtn);
    li.appendChild(itemNameDiv);
    li.appendChild(actionDiv);

    cartItems.appendChild(li);
  });

  totalElement.textContent = total.toFixed(2);
}

checkoutBtn.addEventListener("click", async () => {
  if (cart.length === 0) {
    alert("Cart is already empty!");
    return;
  }

  // Count quantities per product to update
  const quantityMap = {};
  cart.forEach((item) => {
    if (!quantityMap[item._id]) quantityMap[item._id] = 0;
    quantityMap[item._id] += 1;
  });

  // Send POST requests to update quantities
  for (const [id, count] of Object.entries(quantityMap)) {
    const product = products.find((p) => p._id === id);
    const newQuantity = product.quantity;

    await fetch(`${API_URL}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQuantity }),
    });
  }

  alert("Thank you for your purchase!");
  cart = [];
  updateCart();
});

window.onload = loadProducts;
