let productsData = [];

async function loadProductsData() {
  try {
    const response = await fetch("../assets/data.json");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const rawData = await response.json();

    productsData = rawData.data || [];

    renderCart();
  } catch (error) {
    console.error(error);
  }
}

function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function findProduct(id) {
  return productsData.find((p) => p.id === id);
}

function updateCartCounter() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCounter = document.getElementById("cart-counter");

  if (!cartCounter) return;

  cartCounter.style.display = totalItems > 0 ? "inline-block" : "none";

  if (totalItems > 0) {
    cartCounter.textContent = totalItems;
  }
}

function renderCart() {
  const cart = getCart();
  const cartItemsContainer = document.getElementById("cart-items");

  if (productsData.length === 0 && cart.length > 0) {
    cartItemsContainer.innerHTML = "<div>Download...</div>";
    return;
  }

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some items to get started!</p>
      </div>
    `;
    updateSummary();
    updateCartCounter();
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map((item) => {
      const product = findProduct(item.id);

      if (!product) return "";

      const itemTotal = product.price * item.quantity;

      return `
  <div class="cart-item">
    <img src="${product.imageUrl}" alt="${product.name}" class="cart-item__img">

    <div class="cart-item__name">${product.name}</div>

    <div class="cart-item__price">$${product.price}</div>

    <div class="cart-item__quantity">
      <button class="cart-item__quantity-btn" onclick="updateQuantity('${
        item.id
      }', -1)">−</button>
      <span class="cart-item__quantity-value">${item.quantity}</span>
      <button class="cart-item__quantity-btn" onclick="updateQuantity('${
        item.id
      }', 1)">+</button>
    </div>

    <div class="cart-item__total">$${itemTotal.toFixed(2)}</div>

    <button class="cart-item__delete-btn" onclick="removeItem('${item.id}')">
      <img src="../assets/images/cart/delete_button.svg" alt="delete" class="cart-item__delete-icon">
    </button>
  </div>
`;
    })
    .join("");

  updateSummary();
  updateCartCounter();
}

function updateQuantity(id, change) {
  let cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === id);

  if (itemIndex !== -1) {
    cart[itemIndex].quantity += change;

    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }

    saveCart(cart);
    renderCart();
    updateCartCounter();
  }
}

function removeItem(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
  renderCart();
  updateCartCounter();
}

function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    localStorage.removeItem("cart");
    renderCart();
    updateCartCounter();
  }
}

function updateSummary() {
  const cart = getCart();
  let subtotal = 0;

  cart.forEach((item) => {
    const product = findProduct(item.id);
    if (product) subtotal += product.price * item.quantity;
  });

  const shipping = cart.length > 0 ? 30 : 0;

  const discount = subtotal >= 3000 ? subtotal * 0.1 : 0;

  const subtotalAfterDiscount = subtotal - discount;
  const total = subtotalAfterDiscount + shipping;

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);

  const discountRow = document.getElementById("discount-row");

  if (discountRow) {
    discountRow.style.display = discount > 0 ? "flex" : "none";

    if (discount > 0) {
      document.getElementById("discount").textContent = `-${discount.toFixed(
        2
      )}`;
    }
  }

  document.getElementById("shipping").textContent = shipping.toFixed(2);
  document.getElementById("total").textContent = total.toFixed(2);
}

function continueShopping() {
  window.location.href = "../../index.html";
}

function checkout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  alert("Thanks for your purchase");
  localStorage.removeItem("cart");
  renderCart();
  updateCartCounter();
}

document.addEventListener("DOMContentLoaded", updateCartCounter);

window.updateCartCounter = updateCartCounter;

loadProductsData();
