// Handle form submission and show toast
document.querySelector("#christmasContactForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent actual form submission

  // Close the Modal
  const modal = bootstrap.Modal.getInstance(document.querySelector("#contactModal"));
  modal.hide();

  // Show the toast
  const toast = document.querySelector("#successToast");
  const toastBootstrap = new bootstrap.Toast(toast);

  toast.style.display = "block"; // Ensure it's visible before triggering the toast
  toastBootstrap.show();
});