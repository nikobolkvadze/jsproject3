const categoryTabs = document.getElementById("categoryTabs");
const searchFilter = document.getElementById("searchFilter");
const searchSuggestions = document.getElementById("searchSuggestions");
const spicinessFilter = document.getElementById("spicinessFilter");
const spicinessValue = document.getElementById("spicinessValue");
const nutsFilter = document.getElementById("nutsFilter");
const vegFilter = document.getElementById("vegFilter");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const menuLoading = document.getElementById("menuLoading");
const menuError = document.getElementById("menuError");
const productsGrid = document.getElementById("productsGrid");

const state = {
  products: [],
  categories: [],
  selectedCategory: "",
  selectedSearch: "",
};

function getCategoryName(categoryId) {
  const category = state.categories.find((item) => item.id === categoryId);
  return category ? category.name : "Unknown";
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <div class="card-body">
      <h3>${product.name}</h3>
      <p class="muted card-category">${getCategoryName(product.categoryId)}</p>
      <p class="muted">Spiciness: ${product.spiciness}</p>
      <div class="details-line">
        <span>${product.nuts ? "● Nuts" : "○ Nuts"}</span>
        <span>${product.vegeterian ? "● Vegetarian" : "○ Vegetarian"}</span>
      </div>
      <div class="price-row">
        <strong>$ ${product.price.toFixed(1)}</strong>
        <button class="btn-primary" data-product-id="${product.id}">Add to cart</button>
      </div>
    </div>
  `;

  return card;
}

function filterProducts() {
  const searchTerm = state.selectedSearch.trim().toLowerCase();
  const maxSpiciness = Number(spicinessFilter.value) || null;

  return state.products.filter((product) => {
    if (state.selectedCategory && product.categoryId !== Number(state.selectedCategory)) {
      return false;
    }

    if (searchTerm && !product.name.toLowerCase().includes(searchTerm)) {
      return false;
    }

    if (maxSpiciness !== null && product.spiciness > maxSpiciness) {
      return false;
    }

    if (nutsFilter.checked && product.nuts) {
      return false;
    }

    if (vegFilter.checked && !product.vegeterian) {
      return false;
    }

    return true;
  });
}

function renderProducts(products) {
  productsGrid.innerHTML = "";

  if (products.length === 0) {
    productsGrid.innerHTML = "<p>No dishes match your filters.</p>";
    return;
  }

  products.forEach((product) => {
    productsGrid.appendChild(createProductCard(product));
  });
}

function renderCategories() {
  categoryTabs.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.className = "tab-btn";
  allButton.textContent = "All";
  allButton.dataset.categoryId = "";
  allButton.classList.toggle("active", state.selectedCategory === "");
  categoryTabs.appendChild(allButton);

  state.categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "tab-btn";
    button.textContent = category.name;
    button.dataset.categoryId = String(category.id);
    button.classList.toggle("active", state.selectedCategory === String(category.id));
    categoryTabs.appendChild(button);
  });
}

function renderSearchSuggestions() {
  const term = state.selectedSearch.trim().toLowerCase();
  if (!term) {
    searchSuggestions.hidden = true;
    searchSuggestions.innerHTML = "";
    return;
  }

  const suggestions = filterProducts().slice(0, 6);
  searchSuggestions.hidden = false;
  searchSuggestions.innerHTML = "";

  if (suggestions.length === 0) {
    searchSuggestions.innerHTML =
      '<button type="button" class="suggestion-item" disabled>No products found</button>';
    return;
  }

  suggestions.forEach((product) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "suggestion-item";
    item.dataset.productName = product.name;
    item.textContent = product.name;
    searchSuggestions.appendChild(item);
  });
}

function updateMenuView() {
  const filteredProducts = filterProducts();
  renderProducts(filteredProducts);
  renderCategories();
  renderSearchSuggestions();
}

function handleCategoryClick(event) {
  const tab = event.target.closest(".tab-btn");
  if (!tab) return;

  state.selectedCategory = tab.dataset.categoryId || "";
  updateMenuView();
}

function handleSearchInput() {
  state.selectedSearch = searchFilter.value;
  updateMenuView();
}

function bindEvents() {
  categoryTabs.addEventListener("click", handleCategoryClick);
  searchFilter.addEventListener("input", handleSearchInput);

  searchSuggestions.addEventListener("click", (event) => {
    const suggestion = event.target.closest(".suggestion-item");
    if (!suggestion || suggestion.disabled) return;

    state.selectedSearch = suggestion.dataset.productName;
    searchFilter.value = suggestion.dataset.productName;
    searchSuggestions.hidden = true;
    updateMenuView();
  });

  spicinessFilter.addEventListener("input", () => {
    const maxSpiciness = Number(spicinessFilter.value) || null;
    spicinessValue.textContent = maxSpiciness === null ? "Not Chosen" : maxSpiciness;
    updateMenuView();
  });

  nutsFilter.addEventListener("change", updateMenuView);
  vegFilter.addEventListener("change", updateMenuView);

  resetFiltersBtn.addEventListener("click", () => {
    state.selectedCategory = "";
    state.selectedSearch = "";
    searchFilter.value = "";
    searchSuggestions.hidden = true;
    spicinessFilter.value = "0";
    spicinessValue.textContent = "Not Chosen";
    nutsFilter.checked = false;
    vegFilter.checked = false;
    updateMenuView();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".products-tools")) {
      searchSuggestions.hidden = true;
    }
  });

  productsGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-product-id]");
    if (!button) return;

    const productId = Number(button.dataset.productId);
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;

    upsertCartItem(product);
    alert("Dish added to cart!");
  });
}

async function initMenuPage() {
  try {
    menuLoading.hidden = false;
    menuError.hidden = true;
    const [products, categories] = await Promise.all([
      fetchJson(`${API_BASE_URL}/api/Products/GetAll`),
      fetchJson(`${API_BASE_URL}/api/Categories/GetAll`),
    ]);

    state.products = products;
    state.categories = categories;

    bindEvents();
    updateMenuView();
  } catch (error) {
    menuError.hidden = false;
    productsGrid.innerHTML = "";
    console.error(error);
  } finally {
    menuLoading.hidden = true;
  }
}

initMenuPage();
