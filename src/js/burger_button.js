document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("headerNav");
  const closeMenu = document.getElementById("closeMenu");

  burger.addEventListener("click", () => {
    nav.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  });

  closeMenu.addEventListener("click", () => {
    nav.classList.remove("active");
    document.body.classList.remove("no-scroll");
  });
});
