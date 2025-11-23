const accountBtn = document.getElementById("account-icon");
const loginModal = document.getElementById("loginModal");
const closeLoginModal = document.getElementById("closeLoginModal");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordToggleImg = document.getElementById("passwordToggleImg");
const validationMessage = document.getElementById("validationMessage");

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

const eyePath = "../assets/images/modal/eye.svg";

if (accountBtn) {
  accountBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
    validationMessage.style.display = "none";
    validationMessage.textContent = "";
    loginForm.reset();
  });
}

closeLoginModal.addEventListener("click", () => {
  loginModal.style.display = "none";
});

loginModal.addEventListener("click", (e) => {
  if (e.target.id === "loginModal") {
    loginModal.style.display = "none";
  }
});

togglePasswordBtn.addEventListener("click", function () {
  const isPassword = passwordInput.getAttribute("type") === "password";

  passwordInput.setAttribute("type", isPassword ? "text" : "password");
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();
  let isValid = true;

  validationMessage.textContent = "";
  validationMessage.style.display = "none";

  if (!passwordValue) {
    validationMessage.textContent = "Error: enter the correct pass.";
    validationMessage.style.display = "block";
    isValid = false;
  }

  if (isValid && !emailRegex.test(emailValue)) {
    validationMessage.textContent = "Error: enter the correct pass.";
    validationMessage.style.display = "block";
    isValid = false;
  }

  if (isValid) {
    alert("Login successful!");
    loginModal.style.display = "none";
    loginForm.reset();
    passwordInput.setAttribute("type", "password");
    passwordToggleImg.src = eyePath;
  }
});
