function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCounter = document.getElementById("cart-counter");

  if (!cartCounter) return;

  if (totalItems > 0) {
    cartCounter.textContent = totalItems;
    cartCounter.style.display = "inline-block";
    return;
  }

  cartCounter.style.display = "none";
}

document.addEventListener("DOMContentLoaded", updateCartCounter);

window.updateCartCounter = updateCartCounter;
