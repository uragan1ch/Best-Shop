async function loadProductData() {
  try {
    const response = await fetch("../assets/data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData.data;
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;
  return "★".repeat(fullStars) + "☆".repeat(emptyStars);
}

function displayProduct(product) {
  if (!product) {
    console.error("Product not found");
    return;
  }

  window.currentProduct = product;

  const mainImage = document.querySelector(".product__image-main");
  if (mainImage) {
    mainImage.src = product.imageUrl;
    mainImage.alt = product.name;
  }

  const thumbs = document.querySelectorAll(".product__thumb");
  thumbs.forEach((thumb) => {
    thumb.src = product.imageUrl;
    thumb.alt = product.name;
  });

  const title = document.querySelector(".product__title");
  if (title) {
    title.textContent = product.name;
  }

  const starsElement = document.querySelector(".product__stars");
  if (starsElement) {
    starsElement.textContent = generateStars(product.rating);
  }

  const priceElement = document.querySelector(".product__price");
  if (priceElement) {
    priceElement.textContent = `$${product.price}`;
  }
}

function setupQuantityControls() {
  const minusBtn = document.querySelector(
    '.product__quantity-btn[type="button"]:first-of-type'
  );
  const plusBtn = document.querySelector(
    '.product__quantity-btn[type="button"]:last-of-type'
  );
  const quantityInput = document.querySelector(".product__quantity-input");

  if (minusBtn && plusBtn && quantityInput) {
    minusBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });

    plusBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const currentValue = parseInt(quantityInput.value) || 1;
      quantityInput.value = currentValue + 1;
    });
  }
}

function addToCart(product, quantity, size, color) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find(
    (item) =>
      item.id === product.id && item.color === color && item.size === size
  );

  if (existingItem) {
    existingItem.quantity += quantity;

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCounter();
    return;
  }

  cart.push({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    color: color || product.color,
    size: size || product.size,
    quantity: quantity,
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
}

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

function setupAddToCartButton() {
  const addToCartBtn = document.querySelector(".product__add-btn");
  const quantityInput = document.querySelector(".product__quantity-input");
  const sizeSelect = document.getElementById("size");
  const colorSelect = document.getElementById("color");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const quantity = parseInt(quantityInput?.value) || 1;
      const size = sizeSelect?.value || window.currentProduct.size;
      const color = colorSelect?.value || window.currentProduct.color;

      addToCart(window.currentProduct, quantity, size, color);
    });
  }
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".product-tabs__btn");
  const tabPanes = document.querySelectorAll(".product-tabs__pane");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");

      tabButtons.forEach((btn) =>
        btn.classList.remove("product-tabs__btn--active")
      );
      tabPanes.forEach((pane) =>
        pane.classList.remove("product-tabs__pane--active")
      );

      button.classList.add("product-tabs__btn--active");
      const targetPane = document.getElementById(tabName);
      if (targetPane) {
        targetPane.classList.add("product-tabs__pane--active");
      }
    });
  });
}

function setupThumbnailClicks() {
  const mainImage = document.querySelector(".product__image-main");
  const thumbs = document.querySelectorAll(".product__thumb");

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      if (mainImage) {
        mainImage.src = thumb.src;
      }
    });
  });
}

function renderYouMayAlsoLike(products) {
  const grid = document.getElementById("you-may-also-like-grid");
  if (!grid) return;

  const eligibleProducts = products.filter((product) =>
    product.blocks?.includes("You May Also Like")
  );

  if (!eligibleProducts.length) {
    console.warn('No products found for "You May Also Like" section');
    return;
  }

  const shuffled = [...eligibleProducts].sort(() => Math.random() - 0.5);
  const selectedProducts = shuffled.slice(0, 4);

  grid.innerHTML = "";
  selectedProducts.forEach((product) =>
    grid.appendChild(createProductCard(product))
  );

  addProductCardHandlers();
}

function createProductCard(product) {
  const stars = generateStars(product.rating);
  const saleBadge = product.salesStatus
    ? '<div class="product-card__badge">SALE</div>'
    : "";

  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card__image">
        ${saleBadge}
        <img src="${product.imageUrl}" alt="${product.name}" />
      </div>
      <div class="product-card__info">
        <h3 class="product-card__name">${product.name}</h3>
        <div class="product-card__rating">${stars}</div>
        <p class="product-card__price">$${product.price}</p>
        <button class="product-card__btn" data-product-id="${product.id}">Add To Cart</button>
      </div>
    </div>
  `;
}

function addProductCardHandlers() {
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("product-card__btn")) {
        e.stopPropagation();
        const productId = e.target.dataset.productId;
        handleAddToCartFromCard(productId);
        return;
      }

      const productId = card.dataset.productId;
      navigateToProduct(productId);
    });
  });
}

async function handleAddToCartFromCard(productId) {
  const products = await loadProductData();
  const product = products.find((p) => p.id === productId);

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find(
    (item) =>
      item.id === productId &&
      item.color === product.color &&
      item.size === product.size
  );

  if (existingItem) {
    existingItem.quantity += 1;

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCounter();
    return;
  }

  // Если товара ещё нет в корзине
  cart.push({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    color: product.color,
    size: product.size,
    quantity: 1,
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
}

function navigateToProduct(productId) {
  window.location.href = `../html/product.html?id=${productId}`;
}

function setupReviewForm() {
  const reviewForm = document.getElementById("reviewForm");
  const starContainer = document.getElementById("reviewStars");
  const ratingInput = document.getElementById("reviewRating");

  if (!reviewForm || !starContainer || !ratingInput) return;

  const stars = starContainer.querySelectorAll("span");
  let currentRating = 0;

  function updateStars(rating) {
    stars.forEach((star) => {
      const starValue = parseInt(star.dataset.value);
      star.classList.toggle("filled", starValue <= rating);
      star.textContent = starValue <= rating ? "★" : "☆";
    });
  }

  starContainer.addEventListener("mouseover", (e) => {
    if (e.target.tagName === "SPAN") {
      updateStars(parseInt(e.target.dataset.value));
    }
  });

  starContainer.addEventListener("mouseout", () => updateStars(currentRating));

  starContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "SPAN") {
      currentRating = parseInt(e.target.dataset.value);
      ratingInput.value = currentRating;
      updateStars(currentRating);
    }
  });

  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();

    reviewForm.reset();
    currentRating = 0;
    ratingInput.value = 0;
    updateStars(0);

    alert("Your review has been successfully recorded");
  });
}

async function initProductPage() {
  try {
    const productId = getProductIdFromURL();
    if (!productId) {
      console.error("Product ID not found in URL");
      return;
    }

    const products = await loadProductData();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      console.error(`Product with ID ${productId} not found`);
      return;
    }

    displayProduct(product);
    setupQuantityControls();
    setupAddToCartButton();
    setupTabs();
    setupThumbnailClicks();
    setupReviewForm();
    updateCartCounter();

    renderYouMayAlsoLike(products);
  } catch (error) {
    console.error(error);
  }
}

document.getElementById("cart-icon")?.addEventListener("click", () => {
  window.location.href = "./cart.html";
});

document.addEventListener("DOMContentLoaded", initProductPage);
