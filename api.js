const API_BASE_URL = "https://restaurant.stepprojects.ge";
const LOCAL_CART_KEY = "restaurant_cart";

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function getLocalCart() {
  const saved = localStorage.getItem(LOCAL_CART_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to parse saved cart:", error);
    return [];
  }
}

function setLocalCart(cartItems) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
}

function upsertCartItem(product) {
  const cart = getLocalCart();
  const existing = cart.find((item) => item.productId === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  setLocalCart(cart);
}

function updateCartItemQuantity(productId, quantity) {
  const cart = getLocalCart();
  const item = cart.find((entry) => entry.productId === productId);
  if (!item) return;

  item.quantity = Math.max(1, quantity);
  setLocalCart(cart);
}

function removeCartItem(productId) {
  const cart = getLocalCart();
  const updated = cart.filter((item) => item.productId !== productId);
  setLocalCart(updated);
}
