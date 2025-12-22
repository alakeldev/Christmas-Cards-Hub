// Get references to the input fields and span elements
const senderInput = document.getElementById('sender-name');
const receiverInput = document.getElementById('receiver-name');
const senderText = document.getElementById('sender-text');
const receiverText = document.getElementById('receiver-text');

// Add event listeners for real-time input changes
senderInput.addEventListener('input', () => {
  senderText.textContent = senderInput.value.trim() || "Filippo"; // Default to "Filippo"
});

receiverInput.addEventListener('input', () => {
  receiverText.textContent = receiverInput.value.trim() || "Franci"; // Default to "Franci"
});