function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCounter = document.getElementById("cart-counter");

  if (!cartCounter) return;

  cartCounter.style.display = totalItems > 0 ? "inline-block" : "none";
  if (totalItems > 0) cartCounter.textContent = totalItems;
}

document.addEventListener("DOMContentLoaded", updateCartCounter);

window.updateCartCounter = updateCartCounter;
