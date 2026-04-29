const cartList = document.getElementById("cartList");
const cartEmpty = document.getElementById("cartEmpty");
const totalPrice = document.getElementById("totalPrice");

function renderCart() {
  const cart = getLocalCart();
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartEmpty.style.display = "block";
    totalPrice.textContent = "$0.00";
    return;
  }

  cartEmpty.style.display = "none";
  let total = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const article = document.createElement("article");
    article.className = "cart-item";

    article.innerHTML = `
      <div class="remove-x" data-action="remove" data-product-id="${item.productId}">×</div>
      <div class="cart-product">
        <img src="${item.image}" alt="${item.name}" />
        <h3>${item.name}</h3>
      </div>
      <div>
        <div class="qty-controls">
          <button class="qty-btn" data-action="decrease" data-product-id="${item.productId}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-action="increase" data-product-id="${item.productId}">+</button>
        </div>
      </div>
      <strong>$ ${item.price.toFixed(1)}</strong>
      <strong>$ ${itemTotal.toFixed(1)}</strong>
    `;

    cartList.appendChild(article);
  });

  totalPrice.textContent = `$${total.toFixed(1)}`;
}

function bindCartEvents() {
  cartList.addEventListener("click", (event) => {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const productId = Number(control.dataset.productId);
    const action = control.dataset.action;
    const cart = getLocalCart();
    const item = cart.find((entry) => entry.productId === productId);
    if (!item) return;

    if (action === "remove") {
      removeCartItem(productId);
    } else if (action === "increase") {
      updateCartItemQuantity(productId, item.quantity + 1);
    } else if (action === "decrease") {
      if (item.quantity <= 1) {
        removeCartItem(productId);
      } else {
        updateCartItemQuantity(productId, item.quantity - 1);
      }
    }

    renderCart();
  });
}

bindCartEvents();
renderCart();
