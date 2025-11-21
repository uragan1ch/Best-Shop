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
      window.location.href = `./product.html?id=${product.id}`;
    }
  });

  const addToCartBtn = card.querySelector(".product-card__btn");
  addToCartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    addToCart(product);
  });

  return card;
}

function createBestSellItem(product) {
  const item = document.createElement("div");
  item.className = "product-card product-card--small";
  item.setAttribute("data-id", product.id);

  const stars =
    "★".repeat(Math.floor(product.rating)) +
    "☆".repeat(5 - Math.floor(product.rating));

  item.innerHTML = `
    <div class="product-card__image">
      <img src="${product.imageUrl}" alt="${product.name}">
    </div>
    <div class="product-card__info">
      <h4 class="product-card__name">${product.name}</h4>
      <div class="product-card__rating">${stars}</div>
      <p class="product-card__price">$${product.price}</p>
    </div>
  `;

  item.addEventListener("click", () => {
    window.location.href = `./product.html?id=${product.id}`;
  });

  return item;
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

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

  cart.push({ ...product, quantity: 1 });

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

let currentPage = 1;
const itemsPerPage = 12;

function renderCatalogProducts(products, container, page = 1) {
  if (!container) {
    console.error("Catalog container not found");
    return;
  }

  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>Product not found</p>";
    updateResultsText(0, 0, 0);
    updatePagination(0);
    return;
  }

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageProducts = products.slice(startIndex, endIndex);

  pageProducts.forEach((product) => {
    const card = createProductCard(product);
    container.appendChild(card);
  });

  updateResultsText(
    startIndex + 1,
    Math.min(endIndex, products.length),
    products.length
  );

  updatePagination(products.length);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateResultsText(start, end, total) {
  const resultsElement = document.querySelector(".catalog__results");
  if (resultsElement) {
    resultsElement.textContent = `Showing ${start}-${end} Of ${total} Results`;
  }
}

function updatePagination(totalProducts) {
  const paginationContainer = document.querySelector(".catalog__pagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  if (totalPages <= 1) {
    paginationContainer.style.display = "none";
    return;
  }

  paginationContainer.style.display = "flex";

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.className = "catalog__pagination-btn catalog__pagination-btn--prev";
    prevBtn.textContent = "‹ PREV";
    prevBtn.addEventListener("click", () => {
      goToPage(currentPage - 1);
    });
    paginationContainer.appendChild(prevBtn);
  }

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      const pageBtn = document.createElement("button");
      pageBtn.className = "catalog__pagination-btn";
      if (i === currentPage)
        pageBtn.classList.add("catalog__pagination-btn--active");
      pageBtn.textContent = i;
      pageBtn.addEventListener("click", () => goToPage(i));
      paginationContainer.appendChild(pageBtn);
      continue;
    }

    if (i === currentPage - 2 || i === currentPage + 2) {
      const dots = document.createElement("span");
      dots.className = "catalog__pagination-dots";
      dots.textContent = "...";
      paginationContainer.appendChild(dots);
    }
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.className = "catalog__pagination-btn catalog__pagination-btn--next";
    nextBtn.textContent = "NEXT ›";
    nextBtn.addEventListener("click", () => goToPage(currentPage + 1));
    paginationContainer.appendChild(nextBtn);
  }
}

function goToPage(page) {
  currentPage = page;
  const cardsContainer = document.getElementById("catalog-cards");

  window.applyFiltersAndRender(
    window.allProductsCache,
    cardsContainer,
    currentPage
  );
}

function renderBestSells(products, container) {
  if (!container) return;

  container.innerHTML = "";

  const shuffledProducts = [...products];

  shuffledProducts.sort(() => Math.random() - 0.5);

  const randomProducts = shuffledProducts.slice(0, 5);

  randomProducts.forEach((product) => {
    const item = createBestSellItem(product);
    container.appendChild(item);
  });
}

function sortProducts(products, sortType) {
  const sorted = [...products];
  switch (sortType) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "popularity":
      return sorted.sort((a, b) => b.popularity - a.popularity);
    default:
      return sorted;
  }
}

function searchProducts(products, query) {
  if (!query) return products;
  const lowerQuery = query.toLowerCase();
  return products.filter((product) =>
    product.name.toLowerCase().includes(lowerQuery)
  );
}

function filterProducts(products, filters) {
  return products.filter(
    (product) =>
      (!filters.category || product.category === filters.category) &&
      (!filters.color || product.color === filters.color) &&
      (!filters.size || product.size === filters.size) &&
      (!filters.sales || product.salesStatus)
  );
}

function getCurrentFilters() {
  return {
    category: document.getElementById("filter-category")?.value || "",
    color: document.getElementById("filter-color")?.value || "",
    size: document.getElementById("filter-size")?.value || "",
    sales: document.getElementById("filter-sales")?.checked || false,
  };
}

function clearFilters() {
  const filterCategory = document.getElementById("filter-category");
  const filterColor = document.getElementById("filter-color");
  const filterSize = document.getElementById("filter-size");
  const filterSales = document.getElementById("filter-sales");

  if (filterCategory) filterCategory.value = "";
  if (filterColor) filterColor.value = "";
  if (filterSize) filterSize.value = "";
  if (filterSales) filterSales.checked = false;

  document.querySelectorAll(".catalog__filter-select").forEach((select) => {
    select.classList.remove("catalog__filter-select--active");
  });
}

function applyFiltersAndRender(allProducts, cardsContainer, page = 1) {
  const filters = getCurrentFilters();
  const searchQuery = document.getElementById("search-input")?.value || "";
  const sortType = document.getElementById("sort-select")?.value || "default";

  let filtered = filterProducts(allProducts, filters);
  filtered = searchProducts(filtered, searchQuery);
  filtered = sortProducts(filtered, sortType);

  window.filteredProductsCache = filtered;

  renderCatalogProducts(filtered, cardsContainer, page);
}

async function initCatalogPage() {
  try {
    const allProducts = await loadProductData();
    if (allProducts.length === 0) {
      console.error("No products loaded");
      return;
    }

    window.allProductsCache = allProducts;
    window.applyFiltersAndRender = applyFiltersAndRender;

    const cardsContainer = document.getElementById("catalog-cards");
    const bestSellsContainer = document.getElementById("best-sells");
    const sortSelect = document.getElementById("sort-select");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");

    const filterToggleBtn = document.getElementById("filter-toggle-btn");
    const filtersPanel = document.getElementById("filters-panel");
    const hideFiltersBtn = document.getElementById("hide-filters");
    const clearFiltersBtn = document.getElementById("clear-filters");
    const filterCategory = document.getElementById("filter-category");
    const filterColor = document.getElementById("filter-color");
    const filterSize = document.getElementById("filter-size");
    const filterSales = document.getElementById("filter-sales");

    renderCatalogProducts(allProducts, cardsContainer, 1);
    renderBestSells(allProducts, bestSellsContainer);
    updateCartCounter();

    if (filterToggleBtn && filtersPanel) {
      filterToggleBtn.addEventListener("click", () => {
        filtersPanel.classList.toggle("catalog__filters--visible");
      });
    }

    if (hideFiltersBtn && filtersPanel) {
      hideFiltersBtn.addEventListener("click", () => {
        filtersPanel.classList.remove("catalog__filters--visible");
      });
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => {
        clearFilters();
        currentPage = 1;
        applyFiltersAndRender(allProducts, cardsContainer, 1);
      });
    }

    const applyFilters = () => {
      currentPage = 1;
      applyFiltersAndRender(allProducts, cardsContainer, 1);

      document.querySelectorAll(".catalog__filter-select").forEach((select) => {
        const method = select.value ? "add" : "remove";
        select.classList[method]("catalog__filter-select--active");
      });
    };

    if (filterCategory) filterCategory.addEventListener("change", applyFilters);
    if (filterColor) filterColor.addEventListener("change", applyFilters);
    if (filterSize) filterSize.addEventListener("change", applyFilters);
    if (filterSales) filterSales.addEventListener("change", applyFilters);

    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        currentPage = 1;
        applyFiltersAndRender(allProducts, cardsContainer, 1);
      });
    }

    const handleSearch = () => {
      currentPage = 1;
      applyFiltersAndRender(allProducts, cardsContainer, 1);
    };

    if (searchBtn) searchBtn.addEventListener("click", handleSearch);
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSearch();
      });
    }
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", initCatalogPage);
