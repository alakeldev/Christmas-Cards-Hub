// ------------------ Navbar Active Link ------------------
const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
  if (link.getAttribute("href") === currentPage) link.classList.add("active");
});

// ------------------ Snowflakes Generation ------------------
const snowContainer = document.createElement("div");
snowContainer.className = "snowflakes";
document.querySelector(".hero-section").prepend(snowContainer);
const numberOfSnowflakes = 30;
for (let i = 0; i < numberOfSnowflakes; i++) {
  const snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  snowflake.textContent = "❄";
  snowflake.style.left = Math.random() * 100 + "%";
  snowflake.style.fontSize = (0.8 + Math.random() * 0.7) + "rem";
  const duration = 6 + Math.random() * 9;
  snowflake.style.animationDuration = duration + "s";
  const startY = Math.random() * 100;
  snowflake.style.top = "-" + startY + "vh";
  snowflake.style.animationDelay = Math.random() * duration + "s";
  snowContainer.appendChild(snowflake);
}