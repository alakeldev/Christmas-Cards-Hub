document.addEventListener('DOMContentLoaded', function() {
  
  // ------------------ Navbar Active Link ------------------
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
    if (link.getAttribute("href") === currentPage) link.classList.add("active");
  });

  // ------------------ Snowflakes Generation ------------------
  const heroSection = document.querySelector(".hero-section");
  if (heroSection) {
    const snowContainer = document.createElement("div");
    snowContainer.className = "snowflakes";
    heroSection.prepend(snowContainer);
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
  }
  // ------------------ Play Button Functionality ------------------
const playBtn = document.getElementById('play-btn');
const sound = new Audio("assets/audio/christmas-music.mp3")
playBtn.addEventListener('click' , function() {
   sound.play();
  if (playBtn) {
    const card = document.querySelector('.card');
    const messageScreen = document.getElementById('message-screen');
    if (card && messageScreen) {
      card.style.display = 'none';
      messageScreen.style.opacity = '1';
}
  }
});
});