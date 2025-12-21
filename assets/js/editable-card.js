// Edit sender and receiver names

// Get references to the input fields and span elements
const senderInput = document.getElementById('sender-name');
const receiverInput = document.getElementById('receiver-name');
const senderText = document.getElementById('sender-text');
const receiverText = document.getElementById('receiver-text');

// Add event listeners for real-time input changes
senderInput.addEventListener('input', () => {
  senderText.textContent = senderInput.value.trim() || "SenderName"; // Default for sender
});

receiverInput.addEventListener('input', () => {
  receiverText.textContent = receiverInput.value.trim() || "ReceiverName"; // Default for receiver
});


// // Download card as image

// // Get references to the elements
// const cardContainer = document.getElementById('card-container');
// const confirmButton = document.getElementById('confirm-button');

// // Constants for GIF configuration
// const gifDuration = 20000; // Total duration: 20 seconds (in milliseconds)
// const frameInterval = 50; // Capture a frame every 50ms
// const gifWidth = 600; // Width of the GIF
// const gifHeight = 400; // Height of the GIF

// // Add event listener to the "Confirm" button
// confirmButton.addEventListener('click', () => {
//   // Create a new GIF using gif.js
//   const gif = new GIF({
//     workers: 4, // Use 4 workers for faster processing
//     quality: 10, // Quality of the gif
//     width: gifWidth, 
//     height: gifHeight,
//   });

//   // Frame capture logic
//   let startTime = null;

//   const captureFrame = (currentTime) => {
//     if (!startTime) startTime = currentTime; // Record the start time
//     const elapsedTime = currentTime - startTime;

//     if (elapsedTime > gifDuration) {
//       // Stop when the GIF duration is complete and render the GIF
//       gif.on('finished', (blob) => {
//         const downloadLink = document.createElement('a');
//         downloadLink.href = URL.createObjectURL(blob);
//         downloadLink.download = 'christmas-card.gif';
//         downloadLink.click();
//       });
//       gif.render(); // Render the GIF and trigger "finished"
//       return;
//     }

//     // Capture the current state of the card using html2canvas
//     html2canvas(cardContainer, {
//       width: gifWidth,
//       height: gifHeight,
//       scale: 2, // Higher resolution
//     }).then((canvas) => {
//       gif.addFrame(canvas, { delay: frameInterval }); // Add the frame to the GIF
//     });

//     // Schedule the next frame
//     setTimeout(() => requestAnimationFrame(captureFrame), frameInterval);
//   };

//   // Start capturing frames
//   requestAnimationFrame(captureFrame);
// });


// Download card as video

const card = document.getElementById("card-container");
const recordBtn = document.getElementById("recordBtn");

const RECORD_DURATION = 19000;
const FPS = 30;

recordBtn.addEventListener("click", async () => {
  recordBtn.disabled = true;
  console.log("Recording started");

  restartAnimations(card);

  // Ensure fonts/icons are ready
  await document.fonts.ready;

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = card.offsetWidth;
  canvas.height = card.offsetHeight;
  const ctx = canvas.getContext("2d");

  // 🔴 DRAW FIRST FRAME (CRITICAL)
  const firstFrame = await html2canvas(card, {
    backgroundColor: null,
    scale: 1
  });
  ctx.drawImage(firstFrame, 0, 0);

  // ✅ NOW capture stream (canvas is NOT empty)
  const stream = canvas.captureStream(FPS);

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm; codecs=vp8"
  });

  const chunks = [];
  mediaRecorder.ondataavailable = e => {
    if (e.data.size) chunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    console.log("Recording stopped");

    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "christmas-card.webm";
    a.click();

    URL.revokeObjectURL(url);
    recordBtn.disabled = false;
  };

  mediaRecorder.start();

  // Frame loop
  const frameInterval = setInterval(async () => {
    const snapshot = await html2canvas(card, {
      backgroundColor: null,
      scale: 1
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(snapshot, 0, 0);
  }, 1000 / FPS);

  // Stop after 19s (hard stop)
  setTimeout(() => {
    clearInterval(frameInterval);
    mediaRecorder.stop();
  }, RECORD_DURATION);
});


function restartAnimations(container) {
  const animated = container.querySelectorAll("*");

  animated.forEach(el => {
    el.style.animation = "none";
    el.offsetHeight;
    el.style.animation = "";
  });
}
