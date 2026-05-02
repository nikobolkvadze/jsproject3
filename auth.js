const USERS_STORAGE_KEY = "restaurant_users";
const CURRENT_USER_STORAGE_KEY = "restaurant_current_user";

function getUsers() {
  const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!savedUsers) return [];

  try {
    const parsed = JSON.parse(savedUsers);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse users from localStorage:", error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error("Failed to parse current user:", error);
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  updateAuthNavbar();
}

function isLoggedIn() {
  return Boolean(getCurrentUser());
}

function requireAuth() {
  if (isLoggedIn()) {
    return true;
  }

  const cartAuthMessage = document.getElementById("cartAuthMessage");
  if (cartAuthMessage) {
    cartAuthMessage.innerHTML = `
      <div class="auth-warning">
        <p>You need to login to view your cart.</p>
        <div class="auth-warning-actions">
          <a class="btn-danger auth-link-btn" href="./login.html">Login</a>
          <a class="btn-primary auth-link-btn" href="./register.html">Register</a>
        </div>
      </div>
    `;
  }
  return false;
}

function updateAuthNavbar() {
  const authNav = document.getElementById("authNav");
  if (!authNav) return;

  const user = getCurrentUser();
  if (user) {
    authNav.innerHTML = `
      <span class="auth-user">${user.fullName || user.email}</span>
      <button id="logoutBtn" class="btn-danger auth-logout-btn" type="button">Logout</button>
    `;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        logoutUser();
        window.location.href = "./index.html";
      });
    }
  } else {
    authNav.innerHTML = `
      <a href="./login.html">Login</a>
      <a href="./register.html">Register</a>
    `;
  }
}

function setFormMessage(element, message, isError) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("error-text", "success-text");
  element.classList.add(isError ? "error-text" : "success-text");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleRegister() {
  const registerForm = document.getElementById("registerForm");
  const registerMessage = document.getElementById("registerMessage");
  if (!registerForm) return;

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const fullName = registerForm.fullName.value.trim();
    const email = registerForm.email.value.trim().toLowerCase();
    const password = registerForm.password.value;
    const confirmPassword = registerForm.confirmPassword.value;

    if (!fullName || !email || !password || !confirmPassword) {
      setFormMessage(registerMessage, "All fields are required.", true);
      return;
    }

    if (!isValidEmail(email)) {
      setFormMessage(registerMessage, "Please enter a valid email address.", true);
      return;
    }

    if (password.length < 6) {
      setFormMessage(registerMessage, "Password must be at least 6 characters.", true);
      return;
    }

    if (password !== confirmPassword) {
      setFormMessage(registerMessage, "Password and confirm password must match.", true);
      return;
    }

    const users = getUsers();
    const alreadyExists = users.some((user) => user.email === email);
    if (alreadyExists) {
      setFormMessage(registerMessage, "This email is already registered.", true);
      return;
    }

    users.push({ fullName, email, password });
    saveUsers(users);
    setFormMessage(registerMessage, "Registration successful. Redirecting to login...", false);
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 800);
  });
}

function handleLogin() {
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  if (!loginForm) return;

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = loginForm.email.value.trim().toLowerCase();
    const password = loginForm.password.value;

    if (!email || !password) {
      setFormMessage(loginMessage, "Email and password are required.", true);
      return;
    }

    const users = getUsers();
    const matchedUser = users.find((user) => user.email === email && user.password === password);
    if (!matchedUser) {
      setFormMessage(loginMessage, "Wrong email or password.", true);
      return;
    }

    setCurrentUser({
      fullName: matchedUser.fullName,
      email: matchedUser.email,
    });
    setFormMessage(loginMessage, "Login successful. Redirecting...", false);
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 700);
  });
}

function initAuthPages() {
  updateAuthNavbar();
  handleRegister();
  handleLogin();
}

initAuthPages();
