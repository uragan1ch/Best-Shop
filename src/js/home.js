async function loadProductData() {
  try {
    const response = await fetch("./assets/data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();

    const products = jsonData.data.map((product) => ({
      ...product,
      imageUrl: product.imageUrl
        ? product.imageUrl.replace(/^\.\.\/assets\//, "./assets/")
        : "",
    }));

    return products;
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.setAttribute("data-id", product.id);

  card.innerHTML = `
    <div class="product-card__image">
      <img src="${product.imageUrl}" alt="${product.name}" />
      ${
        product.salesStatus
          ? '<span class="product-card__badge">SALE</span>'
          : ""
      }
    </div>
    <div class="product-card__info">
      <h3 class="product-card__name">${product.name}</h3>
      <p class="product-card__price">$${product.price}</p>
      <button class="product-card__btn" data-product-id="${product.id}">
        Add To Cart
      </button>
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (!e.target.classList.contains("product-card__btn")) {
      window.location.href = `./html/product.html?id=${product.id}`;
    }
  });

  const addToCartBtn = card.querySelector(".product-card__btn");
  addToCartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    addToCart(product);
  });

  return card;
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find(
    (item) =>
      item.id === product.id &&
      item.color === product.color &&
      item.size === product.size
  );

  if (existingItem) {
    existingItem.quantity += 1;

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCounter();
    return;
  }

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

function renderProductsInSection(products, block, containerId) {
  const container = document.getElementById(containerId);
  if (!container)
    return console.error(`Container with id "${containerId}" not found`);

  const filteredProducts = products.filter((product) =>
    product.blocks?.includes(block)
  );

  container.innerHTML = "";

  if (!filteredProducts.length) {
    container.innerHTML = "<p>No products available</p>";
    return;
  }

  filteredProducts.forEach((product) =>
    container.appendChild(createProductCard(product))
  );
}

async function initHomePage() {
  try {
    const products = await loadProductData();
    if (products.length === 0) {
      console.error("No products loaded");
      return;
    }

    renderProductsInSection(
      products,
      "Selected Products",
      "selected-products-container"
    );
    renderProductsInSection(
      products,
      "New Products Arrival",
      "new-products-container"
    );
    updateCartCounter();
  } catch (error) {
    console.error(error);
  }
}

document.getElementById("cart-icon")?.addEventListener("click", () => {
  window.location.href = "./html/cart.html";
});

document.addEventListener("DOMContentLoaded", initHomePage);

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".travel-suitcases__cards");
  const prevBtn = document.querySelector(".travel-suitcases__button--prev");
  const nextBtn = document.querySelector(".travel-suitcases__button--next");

  if (!slider || !prevBtn || !nextBtn) return;

  const cards = Array.from(
    document.querySelectorAll(".travel-suitcases__card")
  );
  const totalCards = cards.length;
  let currentIndex = 0;
  let isTransitioning = false;
  let isMobile = window.innerWidth <= 768;

  function checkMobile() {
    return window.innerWidth <= 768;
  }

  function getCardWidth() {
    const card = cards?.[0];
    if (!card) return 0;

    const gap = parseInt(window.getComputedStyle(slider)?.gap) || 0;
    return card.offsetWidth + gap;
  }

  function updateSlider() {
    if (!checkMobile()) {
      slider.style.transform = "translateX(0)";
      currentIndex = 0;
      return;
    }

    if (isTransitioning) return;

    isTransitioning = true;
    const cardWidth = getCardWidth();
    const offset = -currentIndex * cardWidth;
    slider.style.transform = `translateX(${offset}px)`;

    setTimeout(() => {
      isTransitioning = false;
    }, 300);
  }

  function showPrevious() {
    if (!checkMobile() || isTransitioning) return;
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateSlider();
  }

  function showNext() {
    if (!checkMobile() || isTransitioning) return;
    currentIndex = (currentIndex + 1) % totalCards;
    updateSlider();
  }

  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showPrevious();
  });

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showNext();
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      const wasMobile = isMobile;
      isMobile = checkMobile();

      if (wasMobile && !isMobile) {
        currentIndex = 0;
        slider.style.transform = "translateX(0)";
        return;
      }

      if (!wasMobile && isMobile) {
        currentIndex = 0;
        updateSlider();
        return;
      }

      if (isMobile) {
        updateSlider();
      }
    }, 250);
  });

  let startX = 0;
  let endX = 0;
  let isDragging = false;

  slider.addEventListener(
    "touchstart",
    (e) => {
      if (!checkMobile()) return;
      startX = e.touches[0].clientX;
      isDragging = true;
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchmove",
    (e) => {
      if (!checkMobile() || !isDragging) return;
      endX = e.touches[0].clientX;
    },
    { passive: true }
  );

  slider.addEventListener("touchend", (e) => {
    if (!checkMobile() || !isDragging) return;

    isDragging = false;

    const diff = startX - endX;
    const minSwipeDistance = 50;

    if (Math.abs(diff) <= minSwipeDistance) return;

    if (diff > 0) {
      showNext();
      return;
    }

    showPrevious();
  });

  updateSlider();
});
