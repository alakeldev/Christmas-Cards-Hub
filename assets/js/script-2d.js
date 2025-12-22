// Get canvas and context
const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size to match window
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

// Call resize initially and on window resize
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const card = {
	width: 300,
	height: 410,
	cornerRadius: 15,
	glowColor: "#00ff88",
	glowIntensity: 15,
	glowMax: 25,
	rotation: 0,
	glowHue: 140,
	glowSaturation: 100,
	glowLightness: 50,
	x: 0,
	y: 0,
	soundVolume: 1
,
	// Text content
	title: "Merry Christmas",
	message: "May your Christmas be merry and bright!",
	sender: "Sender Name"
,
	// Toggles for decorative elements
	showSanta: false,
	showTree: true,
	showRudolph: false
};

const particleSettings = {
	count: 100,
	minSize: 1,
	maxSize: 4,
	minSpeed: 0.25,
	maxSpeed: 0.5,
	minOpacity: 0.1,
	maxOpacity: 0.6
};

const lineSettings = {
	count: 15,
	minWidth: 0.5,
	maxWidth: 2,
	minSpeed: 0.01,
	maxSpeed: 0.03,
	minOpacity: 0.05,
	maxOpacity: 0.2,
	waveHeight: 10,
	numPoints: 5 // Added numPoints to lineSettings
};

const particles = [];
const lines = [];
const clickEffects = [];

let isCardClicked = false;
let clickTime = 0;
let cardShakeAmount = 0;
let activeHue = 140;
let mouseX = 0;
let mouseY = 0;
let isHovering = false;
let pulseTime = 0;

// Pre-allocate particle objects
for (let i = 0; i < particleSettings.count; i++) {
	particles.push({
		x: 0,
		y: 0,
		size: 0,
		speedX: 0,
		speedY: 0,
		opacity: 0
	});
}

// Pre-allocate line objects and points arrays
for (let i = 0; i < lineSettings.count; i++) {
	const points = [];
	for (let j = 0; j < lineSettings.numPoints; j++) {
		points.push({ x: 0, y: 0, originalY: 0 });
	}
	lines.push({
		points: points,
		width: 0,
		speed: 0,
		offset: 0,
		opacity: 0,
		color: ""
	});
}

const clickEffectPool = [];
const MAX_CLICK_EFFECTS = 50; // Limit the number of stored effects
for (let i = 0; i < MAX_CLICK_EFFECTS; i++) {
	clickEffectPool.push({
		type: "",
		x: 0,
		y: 0,
		radius: 0,
		maxRadius: 0,
		opacity: 0,
		color: "",
		speedX: 0,
		speedY: 0,
		size: 0,
		decay: 0,
		angle: 0,
		length: 0,
		maxLength: 0,
		width: 0
	});
}

function getClickEffect() {
	if (clickEffectPool.length > 0) {
		return clickEffectPool.pop();
	} else {
		// If the pool is empty, create a new effect (less efficient, but prevents errors)
		return {
			type: "",
			x: 0,
			y: 0,
			radius: 0,
			maxRadius: 0,
			opacity: 0,
			color: "",
			speedX: 0,
			speedY: 0,
			size: 0,
			decay: 0,
			angle: 0,
			length: 0,
			maxLength: 0,
			width: 0
		};
	}
}

function returnClickEffect(effect) {
	if (clickEffects.length < MAX_CLICK_EFFECTS) {
		clickEffectPool.push(effect);
	}
	//  else:  Silently discard if pool is full (to prevent memory issues)
}

function createParticles() {
	// Clear existing particles before creating new ones
	particles.length = 0;

	// Create new particle objects based on the current count
for (let i = 0; i < particleSettings.count; i++) {
  particles.push({
    x: Math.random() * card.width,
    y: Math.random() * card.height, // or use 0 for strict top
    size:
      Math.random() *
        (particleSettings.maxSize - particleSettings.minSize) +
      particleSettings.minSize,

    // slight horizontal drift
    speedX:
      Math.random() * particleSettings.maxSpeed -
      particleSettings.maxSpeed / 2,

    // ALWAYS downward
    speedY:
      Math.random() *
        (particleSettings.maxSpeed - particleSettings.minSpeed) +
      particleSettings.minSpeed,

    opacity:
      Math.random() *
        (particleSettings.maxOpacity - particleSettings.minOpacity) +
      particleSettings.minOpacity
  });
}
}

function createLines() {
	// Clear existing lines before creating new ones
	lines.length = 0;

	for (let i = 0; i < lineSettings.count; i++) {
		const points = [];
		const startY = Math.random() * card.height;

		for (let j = 0; j < lineSettings.numPoints; j++) {
			const point = {
				x: j * (card.width / (lineSettings.numPoints - 1)),
				y: startY + Math.random() * 30 - 15,
				originalY: startY + Math.random() * 30 - 15
			};
			points.push(point);
		}

		lines.push({
			points: points,
			width:
				Math.random() * (lineSettings.maxWidth - lineSettings.minWidth) +
				lineSettings.minWidth,
			speed:
				Math.random() * (lineSettings.maxSpeed - lineSettings.minSpeed) +
				lineSettings.minSpeed,
			offset: Math.random() * Math.PI * 2,
			opacity:
				Math.random() * (lineSettings.maxOpacity - lineSettings.minOpacity) +
				lineSettings.minOpacity,
			color: `hsl(${activeHue}, 100%, 60%)`
		});
	}
}

function createClickEffect(x, y) {
	const numClickParticles = 20;

	if (
		x >= card.x &&
		x <= card.x + card.width &&
		y >= card.y &&
		y <= card.y + card.height
	) {
		isCardClicked = true;
		clickTime = 0;
		cardShakeAmount = 5;

		// Ring effect
		let ringEffect = getClickEffect();
		ringEffect.type = "ring";
		ringEffect.x = x;
		ringEffect.y = y;
		ringEffect.radius = 0;
		ringEffect.maxRadius = 80;
		ringEffect.opacity = 1;
		ringEffect.color = `hsl(${activeHue}, 100%, 50%)`;
		clickEffects.push(ringEffect);

		// Particles
		for (let i = 0; i < numClickParticles; i++) {
			let particleEffect = getClickEffect();
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 4 + 2;
			particleEffect.type = "particle";
			particleEffect.x = x;
			particleEffect.y = y;
			particleEffect.speedX = Math.cos(angle) * speed;
			particleEffect.speedY = Math.sin(angle) * speed;
			particleEffect.size = Math.random() * 6 + 2;
			particleEffect.opacity = 1;
			particleEffect.decay = Math.random() * 0.04 + 0.02;
			particleEffect.color = `hsl(${
				activeHue + Math.random() * 30 - 15
			}, 100%, 60%)`;
			clickEffects.push(particleEffect);
		}

		// Burst lines
		for (let i = 0; i < 8; i++) {
			let burstLineEffect = getClickEffect();
			burstLineEffect.type = "burstLine";
			burstLineEffect.x = x;
			burstLineEffect.y = y;
			burstLineEffect.angle = (i / 8) * Math.PI * 2;
			burstLineEffect.length = 0;
			burstLineEffect.maxLength = Math.random() * 50 + 30;
			burstLineEffect.width = Math.random() * 2 + 1;
			burstLineEffect.opacity = 1;
			burstLineEffect.speed = Math.random() * 5 + 3;
			burstLineEffect.decay = Math.random() * 0.05 + 0.02;
			burstLineEffect.color = `hsl(${
				activeHue + Math.random() * 30 - 15
			}, 100%, 60%)`;
			clickEffects.push(burstLineEffect);
		}

		lines.forEach((line) => {
			line.color = `hsl(${activeHue}, 100%, 60%)`;
		});
	}
}

function updateCardPosition() {
	card.x = canvas.width / 2 - card.width / 2;
	card.y = canvas.height / 2 - card.height / 2;
}

canvas.addEventListener("mousemove", (e) => {
	const rect = canvas.getBoundingClientRect();
	mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
	mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
	isHovering = true;
});

canvas.addEventListener("mouseleave", () => {
	isHovering = false;
});

canvas.addEventListener("click", (e) => {
	const rect = canvas.getBoundingClientRect();
	const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
	const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
	createClickEffect(clickX, clickY);

	if (isCardClicked) {
		const soundKeys = Object.keys(sounds);
		const randomSound = soundKeys[Math.floor(Math.random() * soundKeys.length)];
		sounds[randomSound]();
	}
});

function roundedRect(x, y, width, height, radius) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.arcTo(x + width, y, x + width, y + radius, radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
	ctx.lineTo(x + radius, y + height);
	ctx.arcTo(x, y + height, x, y + height - radius, radius);
	ctx.lineTo(x, y + radius);
	ctx.arcTo(x, y, x + radius, y, radius);
	ctx.closePath();
}

function drawBackgroundEffects() {
	ctx.save();
	roundedRect(card.x, card.y, card.width, card.height, card.cornerRadius);
	ctx.clip();

	// Draw gradient background
	const gradient = ctx.createLinearGradient(
		card.x,
		card.y,
		card.x + card.width,
		card.y + card.height
	);
	gradient.addColorStop(0, "#1a1a1a");
	gradient.addColorStop(1, "#0c0c0c");
	ctx.fillStyle = gradient;
	ctx.fillRect(card.x, card.y, card.width, card.height);

	// Draw flowing lines
	for (const line of lines) {
		ctx.beginPath();
		ctx.moveTo(card.x + line.points[0].x, card.y + line.points[0].y);
		for (let i = 0; i < lineSettings.numPoints; i++) {
			const point = line.points[i];
			point.y =
				point.originalY +
				Math.sin(pulseTime * line.speed + line.offset + i * 0.5) *
					lineSettings.waveHeight;
			if (i > 0) {
				ctx.lineTo(card.x + point.x, card.y + point.y);
			}
		}
		ctx.strokeStyle = line.color
			.replace("rgb", "rgba")
			.replace(")", `, ${line.opacity})`);
		ctx.lineWidth = line.width;
		ctx.stroke();
	}

	// Draw particles
	for (const particle of particles) {
		particle.x += particle.speedX;
		particle.y += particle.speedY;
		if (particle.x < 0) particle.x = card.width;
		if (particle.x > card.width) particle.x = 0;
		if (particle.y < 0) particle.y = card.height;
		if (particle.y > card.height) particle.y = 0;

		ctx.beginPath();
		ctx.arc(
			card.x + particle.x,
			card.y + particle.y,
			particle.size,
			0,
			Math.PI * 2
		);
		ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
		ctx.fill();
	}

	// Subtle noise texture
	for (let i = 0; i < 100; i++) {
		const x = card.x + Math.random() * card.width;
		const y = card.y + Math.random() * card.height;
		const size = Math.random() * 0.8;
		const opacity = Math.random() * 0.04;
		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
		ctx.fill();
	}

	ctx.restore();
}

function drawClickEffects() {
	for (let i = clickEffects.length - 1; i >= 0; i--) {
		const effect = clickEffects[i];

		if (effect.type === "ring") {
			effect.radius += 2;
			effect.opacity -= 0.02;
			if (effect.radius >= effect.maxRadius || effect.opacity <= 0) {
				returnClickEffect(effect); // Return to pool
				clickEffects.splice(i, 1);
				continue;
			}
			ctx.beginPath();
			ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
			ctx.strokeStyle = effect.color
				.replace("rgb", "rgba")
				.replace(")", `, ${effect.opacity})`);
			ctx.lineWidth = 2;
			ctx.stroke();
		} else if (effect.type === "particle") {
			effect.x += effect.speedX;
			effect.speedX *= 0.95;
			effect.y += effect.speedY;
			effect.speedY *= 0.95;
			effect.opacity -= effect.decay;
			if (effect.opacity <= 0) {
				returnClickEffect(effect); // Return to pool
				clickEffects.splice(i, 1);
				continue;
			}
			ctx.beginPath();
			ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
			ctx.fillStyle = effect.color
				.replace(")", `, ${effect.opacity})`)
				.replace("rgb", "rgba");
			ctx.fill();
		} else if (effect.type === "burstLine") {
			if (effect.length < effect.maxLength) {
				effect.length += effect.speed;
			} else {
				effect.opacity -= effect.decay;
			}
			if (effect.opacity <= 0) {
				returnClickEffect(effect); // Return to pool
				clickEffects.splice(i, 1);
				continue;
			}
			const endX = effect.x + Math.cos(effect.angle) * effect.length;
			const endY = effect.y + Math.sin(effect.angle) * effect.length;
			ctx.beginPath();
			ctx.moveTo(effect.x, effect.y);
			ctx.lineTo(endX, endY);
			ctx.strokeStyle = effect.color
				.replace(")", `, ${effect.opacity})`)
				.replace("hsl", "hsla");
			ctx.lineWidth = effect.width;
			ctx.stroke();
		}
	}
}

function drawCardContent() {
	let cardOffsetX = 0;
	let cardOffsetY = 0;

	if (isCardClicked) {
		clickTime += 0.1;
		cardShakeAmount *= 0.9;
		if (clickTime > 2 || cardShakeAmount < 0.1) {
			isCardClicked = false;
			cardShakeAmount = 0;
		}
		cardOffsetX = Math.sin(clickTime * 10) * cardShakeAmount;
		cardOffsetY = Math.cos(clickTime * 8) * cardShakeAmount;
	}

	const shiftedX = card.x + cardOffsetX;
	const shiftedY = card.y + cardOffsetY;

	ctx.save();
	roundedRect(shiftedX, shiftedY, card.width, card.height, card.cornerRadius);
	ctx.clip();

	// Draw background
	const gradient = ctx.createLinearGradient(
		shiftedX,
		shiftedY,
		shiftedX + card.width,
		shiftedY + card.height
	);
	gradient.addColorStop(0, "#1a1a1a");
	gradient.addColorStop(1, "#0c0c0c");
	ctx.fillStyle = gradient;
	ctx.fillRect(shiftedX, shiftedY, card.width, card.height);

	// Draw lines
	for (const line of lines) {
		ctx.beginPath();
		ctx.moveTo(shiftedX + line.points[0].x, shiftedY + line.points[0].y);
		for (let i = 0; i < lineSettings.numPoints; i++) {
			const point = line.points[i];
			point.y =
				point.originalY +
				Math.sin(pulseTime * line.speed + line.offset + i * 0.5) *
					lineSettings.waveHeight;
			if (i > 0) {
				ctx.lineTo(shiftedX + point.x, shiftedY + point.y);
			}
		}
		ctx.strokeStyle = line.color
			.replace("rgb", "rgba")
			.replace(")", `, ${line.opacity})`);
		ctx.lineWidth = line.width;
		ctx.stroke();
	}

	// Draw particles
	for (const particle of particles) {
		particle.x += particle.speedX;
		particle.y += particle.speedY;
		if (particle.x < 0) particle.x = card.width;
		if (particle.x > card.width) particle.x = 0;
		if (particle.y < 0) particle.y = card.height;
		if (particle.y > card.height) particle.y = 0;

		ctx.beginPath();
		ctx.arc(
			shiftedX + particle.x,
			shiftedY + particle.y,
			particle.size,
			0,
			Math.PI * 2
		);
		ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
		ctx.fill();
	}

	// Noise texture
	for (let i = 0; i < 100; i++) {
		const x = shiftedX + Math.random() * card.width;
		const y = shiftedY + Math.random() * card.height;
		const size = Math.random() * 0.8;
		const opacity = Math.random() * 0.04;
		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
		ctx.fill();
	}

	ctx.restore();

	// Card border
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2;
	roundedRect(shiftedX, shiftedY, card.width, card.height, card.cornerRadius);
	ctx.stroke();

	// Card title
	ctx.fillStyle = "#fff";
	ctx.font = "bold 24px Arial";
	ctx.textAlign = "center";
	ctx.fillText(card.title, shiftedX + card.width / 2, shiftedY + 50);

	// Card image
	const centerX = shiftedX + card.width / 2;
	const centerY = shiftedY + card.height / 2;

	// 🎄 Christmas Tree (optional)
	if (card.showTree) {
		ctx.save();
		ctx.translate(centerX, centerY - 50);
		// gentle sway for leaves
		const treeSway = Math.sin(pulseTime * 1.8) * 0.06;
		ctx.rotate(treeSway);
		drawChristmasTree(ctx, activeHue);
		// trunk (does not sway as much)
		ctx.restore();
	}

// Santa horizontal movement
	if (card.showSanta) {
		ctx.save();
		ctx.translate(centerX, centerY);
		const santaOffsetX = Math.sin(pulseTime * 1.2) * 80; // distance
		const santaOffsetY = -20; // fixed vertical position
		ctx.translate(santaOffsetX, santaOffsetY);
		drawSanta(ctx, activeHue, pulseTime);
		ctx.restore();
	}

// 🎁 Gifts under the tree (draw under tree area if tree exists)
ctx.save();
ctx.translate(centerX, centerY);
if (card.showTree) {
	drawGift(ctx, -60, 50, 30, "#e53935"); // red
	drawGift(ctx, 0,   55, 34, "#1e88e5"); // blue
	drawGift(ctx, 60,  50, 30, "#43a047"); // green
} else {
	// If tree hidden, keep gifts near center under Santa
	drawGift(ctx, -60, 50, 30, "#e53935");
	drawGift(ctx, 0,   55, 34, "#1e88e5");
	drawGift(ctx, 60,  50, 30, "#43a047");
}

// Rudolph (optional): slightly below and to the side of the tree
if (card.showRudolph) {
	ctx.save();
	ctx.translate(40, -30);
	const rudgle = Math.sin(pulseTime * 2.4) * 6; // small bob
	ctx.translate(-40 + rudgle, 0);
	drawRudolph(ctx, activeHue, pulseTime);
	ctx.restore();
}

ctx.restore();

	// Card description (message can include newlines)
	ctx.fillStyle = "#fff";
	ctx.font = "16px Arial";
	ctx.textAlign = "center";
	const msgLines = (card.message || "").split('\n');
	const startY = centerY + 100;
	for (let i = 0; i < msgLines.length; i++) {
		ctx.fillText(msgLines[i], centerX, startY + i * 24);
	}

	// Card footer (sender)
	ctx.fillStyle = "#888";
	ctx.font = "12px Arial";
	ctx.fillText(card.sender, centerX, shiftedY + card.height - 20);
}

function drawSnowOnLeaves(ctx, layers) {
  ctx.fillStyle = "rgba(255,255,255,0.85)";

  layers.forEach(layer => {
    ctx.beginPath();
    ctx.ellipse(
      0,
      layer.y - layer.h + 6,
      layer.w * 0.35,
      6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}


function drawTreeLights(ctx, pulseTime) {
  const lights = [
    { x: -20, y: -25 },
    { x: 15,  y: -10 },
    { x: -10, y: 5 },
    { x: 20,  y: 15 }
  ];

  lights.forEach((l, i) => {
    const glow = (Math.sin(pulseTime * 4 + i) + 1) / 2;

    ctx.beginPath();
    ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + glow * 0.6})`;
    ctx.shadowColor = "gold";
    ctx.shadowBlur = 6 + glow * 6;
    ctx.fill();
  });

  ctx.shadowBlur = 0;
}

function drawGift(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);

  // Box
  ctx.fillStyle = color;
  ctx.fillRect(-size / 2, -size / 2, size, size);

  // Ribbon (vertical)
  ctx.fillStyle = "gold";
  ctx.fillRect(-size * 0.1, -size / 2, size * 0.2, size);

  // Ribbon (horizontal)
  ctx.fillRect(-size / 2, -size * 0.1, size, size * 0.2);

  // Bow
  ctx.beginPath();
  ctx.arc(-size * 0.15, -size / 2, size * 0.15, 0, Math.PI * 2);
  ctx.arc(size * 0.15, -size / 2, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawTreeLeaves(ctx, hue) {
  const layers = [
    { y: -40, w: 90, h: 45 },
    { y: -10, w: 70, h: 40 },
    { y: 20,  w: 50, h: 35 }
  ];

  ctx.fillStyle = "rgba(0, 180, 90, 0.4)";
  ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
  ctx.lineWidth = 2;

  layers.forEach(layer => {
    ctx.beginPath();
    ctx.moveTo(0, layer.y - layer.h);
    ctx.lineTo(-layer.w / 2, layer.y + layer.h / 2);
    ctx.lineTo(layer.w / 2, layer.y + layer.h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  // ❄️ Snow + 💡 Lights
  
  drawTreeLights(ctx, pulseTime);
}

function drawTreeTrunk(ctx) {
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(-8, 45, 16, 22);
}



function drawSanta(ctx, hue, pulseTime) {
  ctx.save();

  /* Hat */
  ctx.beginPath();
  ctx.moveTo(-30, -45);
  ctx.lineTo(30, -45);
  ctx.lineTo(0, -80);
  ctx.closePath();
  ctx.fillStyle = "#c62828";
  ctx.fill();

  // Hat trim
  ctx.fillStyle = "#fff";
  ctx.fillRect(-32, -45, 64, 8);

  // Hat pom
  ctx.beginPath();
  ctx.arc(0, -82, 6, 0, Math.PI * 2);
  ctx.fill();

  /* Face */
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fillStyle = "#f1c27d";
  ctx.fill();
  ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  /* Eyes */
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(-10, -5, 3, 0, Math.PI * 2);
  ctx.arc(10, -5, 3, 0, Math.PI * 2);
  ctx.fill();

  /* Nose */
  ctx.beginPath();
  ctx.arc(0, 5, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#e57373";
  ctx.fill();

  /* Beard */
  ctx.beginPath();
  ctx.moveTo(-25, 10);
  ctx.quadraticCurveTo(0, 40, 25, 10);
  ctx.quadraticCurveTo(0, 55, -25, 10);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.fill();

  /* Mustache */
  ctx.beginPath();
  ctx.arc(-8, 10, 6, Math.PI, Math.PI * 2);
  ctx.arc(8, 10, 6, Math.PI, Math.PI * 2);
  ctx.fill();

  /* Subtle glow pulse */
  ctx.shadowColor = "rgba(255,255,255,0.6)";
  ctx.shadowBlur = 6 + Math.sin(pulseTime * 2) * 2;

  ctx.restore();
}


function drawRudolph(ctx, hue, pulseTime) {
  ctx.save();

  /* Head */
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(160, 100, 50, 0.9)";
  ctx.fill();
  ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  /* Eyes */
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(-10, -5, 3, 0, Math.PI * 2);
  ctx.arc(10, -5, 3, 0, Math.PI * 2);
  ctx.fill();

  /* Nose (Red & Glowing) */
  const glow = 6 + Math.sin(pulseTime * 3) * 3;
  ctx.shadowColor = "red";
  ctx.shadowBlur = glow;

  ctx.beginPath();
  ctx.arc(0, 12, 6, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();

  ctx.shadowBlur = 0;

  /* Antlers */
  ctx.strokeStyle = "#6b3f1d";
  ctx.lineWidth = 4;

  // Left antler
  ctx.beginPath();
  ctx.moveTo(-18, -30);
  ctx.lineTo(-30, -60);
  ctx.lineTo(-45, -80);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-30, -55);
  ctx.lineTo(-40, -65);
  ctx.stroke();

  // Right antler
  ctx.beginPath();
  ctx.moveTo(18, -30);
  ctx.lineTo(30, -60);
  ctx.lineTo(45, -80);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(30, -55);
  ctx.lineTo(40, -65);
  ctx.stroke();

  ctx.restore();
}


function drawChristmasTree(ctx, hue) {
  // Tree layers (triangles)
  const layers = [
    { y: -30, w: 80, h: 40 },
    { y: 0,  w: 60, h: 35 },
    { y: 25, w: 40, h: 30 }
  ];

  ctx.fillStyle = "rgba(0, 180, 90, 0.35)";
  ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
  ctx.lineWidth = 2;

  layers.forEach(layer => {
    ctx.beginPath();
    ctx.moveTo(0, layer.y - layer.h);
    ctx.lineTo(-layer.w / 2, layer.y + layer.h / 2);
    ctx.lineTo(layer.w / 2, layer.y + layer.h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Trunk
  ctx.fillStyle = "rgba(120, 70, 20, 0.8)";
  ctx.fillRect(-8, 45, 16, 18);

  // Star on top
  ctx.beginPath();
  ctx.arc(0, -55, 5, 0, Math.PI * 2);
  ctx.fillStyle = "gold";
  ctx.fill();
}


function animate() {
	requestAnimationFrame(animate);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	updateCardPosition();
	pulseTime += 0.02;

	const centerX = card.x + card.width / 2;
	const centerY = card.y + card.height / 2;
	let glowSize = card.glowIntensity;
	let hue = 140;

	if (isHovering) {
		const dx = mouseX - centerX;
		const dy = mouseY - centerY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		glowSize = card.glowIntensity + Math.max(0, card.glowMax - distance / 10);
		hue = (((Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2)) * 360) % 360;
		// Update line colors here based on mouse position
		lines.forEach((line) => {
			line.color = `hsl(${hue}, 100%, 60%)`;
		});
	} else {
		glowSize = card.glowIntensity + Math.sin(pulseTime) * 5;
	}

	activeHue = hue;

	ctx.shadowBlur = glowSize * (isCardClicked ? 1.5 : 1);
	ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;

	drawCardContent();
	ctx.shadowBlur = 0;
	drawClickEffects();
}

// ===============================
// Control Panel
// ===============================

function createControlPanel() {
	const panel = document.createElement("div");
	panel.className = "control-panel";

	// Card Size Controls
	const sizeHeader = document.createElement("h3");
	sizeHeader.className = "control-group";
	sizeHeader.textContent = "Card Size";
	panel.appendChild(sizeHeader);
	panel.appendChild(
		createSliderControl(
			"Width",
			"card-width",
			200, // Min width
			800, // Max width
			card.width,
			(value) => {
				card.width = value;
				updateCardPosition(); // Update position when size changes
				createParticles(); // Regenerate particles for new size
				createLines(); // Regenerate lines for new size
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Height",
			"card-height",
			400, // Min height
			800, // Max height
			card.height,
			(value) => {
				card.height = value;
				updateCardPosition(); // Update position when size changes
				createParticles(); // Regenerate particles for new size
				createLines(); // Regenerate lines for new size
			}
		)
	);

	// Sound Controls
	const soundHeader = document.createElement("h3");
	soundHeader.className = "control-group";
	soundHeader.textContent = "Sound SFX";
	panel.appendChild(soundHeader);
	panel.appendChild(
		createSliderControl(
			"Volume",
			"sound-volume",
			0,
			1,
			card.soundVolume,
			(value) => {
				card.soundVolume = value;
			}
		)
	);

	// Glow Controls
	const glowHeader = document.createElement("h3");
	glowHeader.className = "control-group";
	glowHeader.textContent = "Glow Controls";
	panel.appendChild(glowHeader);
	panel.appendChild(
		createSliderControl(
			"Intensity",
			"glow-intensity",
			0,
			30,
			card.glowIntensity,
			(value) => {
				card.glowIntensity = value;
			}
		)
	);
	panel.appendChild(
		createSliderControl("Max", "glow-max", 10, 50, card.glowMax, (value) => {
			card.glowMax = value;
		})
	);

	// Text controls (Title, Message, Sender)
	const textHeader = document.createElement("h3");
	textHeader.className = "control-group";
	textHeader.textContent = "Card Text";
	panel.appendChild(textHeader);

	// Title
	const titleLabel = document.createElement('label');
	titleLabel.textContent = 'Title: ';
	titleLabel.htmlFor = 'card-title';
	const titleInput = document.createElement('input');
	titleInput.type = 'text';
	titleInput.id = 'card-title';
	titleInput.value = card.title;
	titleInput.style.width = '200px';
	titleInput.addEventListener('input', () => {
		card.title = titleInput.value;
	});
	panel.appendChild(titleLabel);
	panel.appendChild(titleInput);

	// Message (multiline)
	const msgLabel = document.createElement('label');
	msgLabel.textContent = ' Message: ';
	msgLabel.htmlFor = 'card-message';
	const msgInput = document.createElement('textarea');
	msgInput.id = 'card-message';
	msgInput.rows = 3;
	msgInput.style.width = '260px';
	msgInput.value = card.message;
	msgInput.addEventListener('input', () => {
		card.message = msgInput.value;
	});
	panel.appendChild(document.createElement('br'));
	panel.appendChild(msgLabel);
	panel.appendChild(msgInput);

	// Sender
	const senderLabel = document.createElement('label');
	senderLabel.textContent = ' Sender: ';
	senderLabel.htmlFor = 'card-sender';
	const senderInput = document.createElement('input');
	senderInput.type = 'text';
	senderInput.id = 'card-sender';
	senderInput.value = card.sender;
	senderInput.style.width = '200px';
	senderInput.addEventListener('input', () => {
		card.sender = senderInput.value;
	});
	panel.appendChild(document.createElement('br'));
	panel.appendChild(senderLabel);
	panel.appendChild(senderInput);

	// Element toggles (Santa, Tree, Rudolph)
	panel.appendChild(document.createElement('br'));
	const elemHeader = document.createElement('label');
	elemHeader.textContent = 'Show elements: ';
	panel.appendChild(elemHeader);

	const santaChk = document.createElement('input');
	santaChk.type = 'checkbox';
	santaChk.id = 'show-santa';
	santaChk.checked = card.showSanta;
	santaChk.addEventListener('change', () => (card.showSanta = santaChk.checked));
	const santaLbl = document.createElement('label');
	santaLbl.htmlFor = 'show-santa';
	santaLbl.textContent = ' Santa ';
	panel.appendChild(santaChk);
	panel.appendChild(santaLbl);

	const treeChk = document.createElement('input');
	treeChk.type = 'checkbox';
	treeChk.id = 'show-tree';
	treeChk.checked = card.showTree;
	treeChk.addEventListener('change', () => (card.showTree = treeChk.checked));
	const treeLbl = document.createElement('label');
	treeLbl.htmlFor = 'show-tree';
	treeLbl.textContent = ' Tree ';
	panel.appendChild(treeChk);
	panel.appendChild(treeLbl);

	const rudChk = document.createElement('input');
	rudChk.type = 'checkbox';
	rudChk.id = 'show-rudolph';
	rudChk.checked = card.showRudolph;
	rudChk.addEventListener('change', () => (card.showRudolph = rudChk.checked));
	const rudLbl = document.createElement('label');
	rudLbl.htmlFor = 'show-rudolph';
	rudLbl.textContent = ' Rudolph ';
	panel.appendChild(rudChk);
	panel.appendChild(rudLbl);

	// Particle Controls
	const particleHeader = document.createElement("h3");
	particleHeader.className = "control-group";
	particleHeader.textContent = "Particle Controls";
	panel.appendChild(particleHeader);
	panel.appendChild(
		createSliderControl(
			"Count",
			"particle-count",
			0,
			500,
			particleSettings.count,
			(value) => {
				particleSettings.count = value;
				createParticles();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Min Size",
			"particle-min-size",
			0.1,
			5,
			particleSettings.minSize,
			(value) => {
				particleSettings.minSize = value;
				createParticles();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Max Size",
			"particle-max-size",
			0.1,
			5,
			particleSettings.maxSize,
			(value) => {
				particleSettings.maxSize = value;
				createParticles();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Min Speed",
			"particle-min-speed",
			0,
			1,
			particleSettings.minSpeed,
			(value) => {
				particleSettings.minSpeed = value;
				createParticles();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Max Speed",
			"particle-max-speed",
			0,
			1,
			particleSettings.maxSpeed,
			(value) => {
				particleSettings.maxSpeed = value;
				createParticles();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Min Opacity",
			"particle-min-opacity",
			0,
			1,
			particleSettings.minOpacity,
			(value) => {
				particleSettings.minOpacity = value;
				createParticles();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Max Opacity",
			"particle-max-opacity",
			0,
			1,
			particleSettings.maxOpacity,
			(value) => {
				particleSettings.maxOpacity = value;
				createParticles();
			}
		)
	);

	const lineHeader = document.createElement("h3");
	lineHeader.textContent = "Line Controls";
	lineHeader.style.marginTop = "20px";
	panel.appendChild(lineHeader);
	panel.appendChild(
		createSliderControl(
			"Count",
			"line-count",
			0,
			50,
			lineSettings.count,
			(value) => {
				lineSettings.count = value;
				createLines();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Min Width",
			"line-min-width",
			0.1,
			5,
			lineSettings.minWidth,
			(value) => {
				lineSettings.minWidth = value;
				createLines();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Max Width",
			"line-max-width",
			0.1,
			3,
			lineSettings.maxWidth,
			(value) => {
				lineSettings.maxWidth = value;
				createLines();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Min Speed",
			"line-min-speed",
			0,
			0.1,
			lineSettings.minSpeed,
			(value) => {
				lineSettings.minSpeed = value;
				createLines();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Max Speed",
			"line-max-speed",
			0,
			0.1,
			lineSettings.maxSpeed,
			(value) => {
				lineSettings.maxSpeed = value;
				createLines();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Min Opacity",
			"line-min-opacity",
			0,
			0.5,
			lineSettings.minOpacity,
			(value) => {
				lineSettings.minOpacity = value;
				createLines();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Max Opacity",
			"line-max-opacity",
			0,
			0.5,
			lineSettings.maxOpacity,
			(value) => {
				lineSettings.maxOpacity = value;
				createLines();
			}
		)
	);
	panel.appendChild(
		createSliderControl(
			"Wave Height",
			"line-wave-height",
			1,
			30,
			lineSettings.waveHeight,
			(value) => {
				lineSettings.waveHeight = value;
			}
		)
	);

	const randomizeBtn = document.createElement("button");
	randomizeBtn.className = "control-btn";
	randomizeBtn.textContent = "Randomize All";
	randomizeBtn.style.marginTop = "20px";
	randomizeBtn.addEventListener("click", randomizeAllSettings);
	panel.appendChild(randomizeBtn);

	// Export / Download Animation Controls
	const exportHeader = document.createElement("h3");
	exportHeader.textContent = "Export";
	exportHeader.style.marginTop = "20px";
	panel.appendChild(exportHeader);

	const exportContainer = document.createElement("div");
	exportContainer.className = "export-controls";

	const durationLabel = document.createElement("label");
	durationLabel.textContent = "Duration (s): ";
	durationLabel.htmlFor = "export-duration";
	exportContainer.appendChild(durationLabel);

	const durationInput = document.createElement("input");
	durationInput.type = "number";
	durationInput.id = "export-duration";
	durationInput.min = 1;
	durationInput.max = 30;
	durationInput.value = 5;
	durationInput.style.width = "60px";
	exportContainer.appendChild(durationInput);

	const downloadBtn = document.createElement("button");
	downloadBtn.className = "control-btn";
	downloadBtn.textContent = "Download Animation";
	downloadBtn.style.marginLeft = "10px";
	downloadBtn.addEventListener("click", () => {
		const dur = Math.max(1, Math.min(30, parseFloat(durationInput.value) || 5));
		startRecording(dur, downloadBtn);
	});
	exportContainer.appendChild(downloadBtn);

	// GIF export controls
	const gifFpsLabel = document.createElement("label");
	gifFpsLabel.textContent = " GIF FPS: ";
	gifFpsLabel.htmlFor = "gif-fps";
	exportContainer.appendChild(gifFpsLabel);

	const gifFpsInput = document.createElement("input");
	gifFpsInput.type = "number";
	gifFpsInput.id = "gif-fps";
	gifFpsInput.min = 2;
	gifFpsInput.max = 30;
	gifFpsInput.value = 15;
	gifFpsInput.style.width = "50px";
	exportContainer.appendChild(gifFpsInput);

	const downloadGifBtn = document.createElement("button");
	downloadGifBtn.className = "control-btn";
	downloadGifBtn.textContent = "Download GIF";
	downloadGifBtn.style.marginLeft = "8px";
	downloadGifBtn.addEventListener("click", () => {
		const dur = Math.max(1, Math.min(30, parseFloat(durationInput.value) || 5));
		const fps = Math.max(2, Math.min(30, parseInt(gifFpsInput.value) || 15));
		startGifExport(dur, fps, downloadGifBtn);
	});
	exportContainer.appendChild(downloadGifBtn);

	const exportStatus = document.createElement("span");
	exportStatus.className = "export-status";
	exportStatus.style.marginLeft = "12px";
	exportContainer.appendChild(exportStatus);

	panel.appendChild(exportContainer);

	const toggleBtn = document.createElement("button");
	toggleBtn.className = "toggle-controls-btn";
	panel.classList.toggle("hidden");
	toggleBtn.textContent = "Show Controls";
	toggleBtn.addEventListener("click", () => {
		panel.classList.toggle("hidden");
		toggleBtn.textContent = panel.classList.contains("hidden")
			? "Show Controls"
			: "Hide Controls";
	});
	document.body.appendChild(toggleBtn);
	document.body.appendChild(panel);
	return panel;
}

// Recording / Export functions
function startRecording(durationSeconds = 5, triggerButton = null) {
	if (!canvas.captureStream) {
		alert("Your browser does not support canvas.captureStream(), recording is not available.");
		return;
	}

	const fps = 60;
	const stream = canvas.captureStream(fps);

	let mimeType = "video/webm";
	try {
		if (!MediaRecorder.isTypeSupported(mimeType)) {
			if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) mimeType = "video/webm;codecs=vp9";
			else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) mimeType = "video/webm;codecs=vp8";
			else mimeType = "";
		}
	} catch (e) {
		// Some browsers may throw; fall back
		mimeType = "";
	}

	const options = mimeType ? { mimeType } : undefined;

	let recorder;
	try {
		recorder = new MediaRecorder(stream, options);
	} catch (err) {
		alert("Could not start MediaRecorder: " + err.message);
		return;
	}

	const chunks = [];
	recorder.ondataavailable = (e) => {
		if (e.data && e.data.size) chunks.push(e.data);
	};

	recorder.onstart = () => {
		if (triggerButton) {
			triggerButton.disabled = true;
			triggerButton.textContent = "Recording...";
		}
	};

	recorder.onstop = () => {
		const blob = new Blob(chunks, { type: mimeType || "video/webm" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.style.display = "none";
		a.href = url;
		a.download = `christmas-card-${Date.now()}.webm`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(url), 10000);

		if (triggerButton) {
			triggerButton.disabled = false;
			triggerButton.textContent = "Download Animation";
		}
	};

	recorder.start();

	// Safety: stop after duration
	setTimeout(() => {
		if (recorder && recorder.state === "recording") recorder.stop();
	}, durationSeconds * 1000);
}

// Dynamically load gif.js from CDN if needed
function loadGifJs() {
	if (window.GIF) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js';
		script.onload = () => {
			// give a tiny delay to ensure worker URL is accessible
			setTimeout(() => resolve(), 50);
		};
		script.onerror = () => reject(new Error('Failed to load gif.js'));
		document.head.appendChild(script);
	});
}

// Fetch the worker script and return a blob URL (helps when origin is null/file://)
let _cachedGifWorkerUrl = null;
async function loadGifWorkerScript() {
	if (_cachedGifWorkerUrl) return _cachedGifWorkerUrl;

	const cdn = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js';

	// Try fetching the worker source and create a blob URL
	try {
		const resp = await fetch(cdn, { mode: 'cors' });
		if (!resp.ok) throw new Error('Network response was not ok');
		const text = await resp.text();
		const blob = new Blob([text], { type: 'application/javascript' });
		const url = URL.createObjectURL(blob);
		_cachedGifWorkerUrl = url;
		return url;
	} catch (err) {
		// If fetch fails (CORS or other), try a direct Worker test (may throw SecurityError)
		try {
			// This will throw in contexts where constructing a Worker from CDN is blocked
			new Worker(cdn);
			// If it didn't throw, we can return the CDN URL
			_cachedGifWorkerUrl = cdn;
			return cdn;
		} catch (e) {
			throw new Error('Failed to load worker script from CDN (CORS or file:// restriction)');
		}
	}
}

async function startGifExport(durationSeconds = 5, fps = 15, triggerButton = null) {
	if (!('Promise' in window)) {
		alert('GIF export requires a modern browser.');
		return;
	}

	if (triggerButton) {
		triggerButton.disabled = true;
		triggerButton.textContent = 'Preparing GIF...';
	}

	try {
		await loadGifJs();
	} catch (err) {
		alert('Could not load GIF encoder: ' + err.message);
		if (triggerButton) {
			triggerButton.disabled = false;
			triggerButton.textContent = 'Download GIF';
		}
		return;
	}

	// Configure GIF encoder
	const totalFrames = Math.max(1, Math.round(durationSeconds * fps));

	// Load worker script as a blob URL to avoid Worker cross-origin restrictions
	let workerScriptUrl;
	try {
		workerScriptUrl = await loadGifWorkerScript();
	} catch (err) {
		// Give a helpful message if running from file:// where Workers from CDN are blocked
		const msg = `Could not load GIF worker script: ${err.message}.\n` +
			`If you're opening the page via file:// the browser may block CDN workers.\n` +
			`Run a local static server (e.g. 'npx http-server' or 'python -m http.server') or place 'gif.worker.js' in your project and set its path.`;
		alert(msg);
		if (triggerButton) {
			triggerButton.disabled = false;
			triggerButton.textContent = 'Download GIF';
		}
		return;
	}

	const gif = new GIF({
		workers: 2,
		quality: 10,
		workerScript: workerScriptUrl,
		width: canvas.width,
		height: canvas.height
	});

	gif.on('progress', function(p) {
		if (triggerButton) triggerButton.textContent = `Encoding GIF ${Math.round(p*100)}%`;
	});

	gif.on('finished', function(blob) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = `christmas-card-${Date.now()}.gif`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(url), 10000);

		if (triggerButton) {
			triggerButton.disabled = false;
			triggerButton.textContent = 'Download GIF';
		}
		// release blob URL used for worker script
		if (workerScriptUrl && workerScriptUrl.startsWith('blob:')) {
			URL.revokeObjectURL(workerScriptUrl);
		}
	});

	// Capture frames over time so the animation progresses naturally
	for (let i = 0; i < totalFrames; i++) {
		// Add the current canvas frame
		try {
			gif.addFrame(canvas, { copy: true, delay: Math.round(1000 / fps) });
		} catch (e) {
			// fallback: draw canvas to an offscreen canvas and add imageData
			const off = document.createElement('canvas');
			off.width = canvas.width;
			off.height = canvas.height;
			off.getContext('2d').drawImage(canvas, 0, 0);
			gif.addFrame(off, { copy: true, delay: Math.round(1000 / fps) });
		}

		// Wait for the next frame to let animation progress
		await new Promise((res) => setTimeout(res, Math.round(1000 / fps)));
	}

	gif.render();
}

function randomizeAllSettings() {
	card.glowIntensity = Math.random() * 30;
	card.glowMax = Math.random() * 40 + 10;

	// Randomize Card Size
	// card.width = Math.floor(Math.random() * (600 - 100 + 1)) + 100;
	// card.height = Math.floor(Math.random() * (800 - 150 + 1)) + 150;
	// updateCardPosition(); // Update position after randomizing size
	// updateSlider("card-width", card.width);
	// updateSlider("card-height", card.height);

	particleSettings.count = Math.floor(Math.random() * 250);
	particleSettings.minSize = Math.random() * 4.9 + 0.1;
	particleSettings.maxSize = Math.random() * 4.9 + 0.1;
	if (particleSettings.maxSize < particleSettings.minSize)
		particleSettings.maxSize = particleSettings.minSize;
	particleSettings.minSpeed = Math.random();
	particleSettings.maxSpeed = Math.random();
	if (particleSettings.maxSpeed < particleSettings.minSpeed)
		particleSettings.maxSpeed = particleSettings.minSpeed;
	particleSettings.minOpacity = Math.random() * 0.5;
	particleSettings.maxOpacity = Math.random() * 0.5 + 0.5;
	if (particleSettings.maxOpacity < particleSettings.minOpacity)
		particleSettings.maxOpacity = particleSettings.minOpacity;

	lineSettings.count = Math.floor(Math.random() * 25);
	lineSettings.minWidth = Math.random() * 2.9 + 0.1;
	lineSettings.maxWidth = Math.random() * 2.9 + 0.1;
	if (lineSettings.maxWidth < lineSettings.minWidth)
		lineSettings.maxWidth = lineSettings.minWidth;
	lineSettings.minSpeed = Math.random() * 0.1;
	lineSettings.maxSpeed = Math.random() * 0.1;
	if (lineSettings.maxSpeed < lineSettings.minSpeed)
		lineSettings.maxSpeed = lineSettings.minSpeed;
	lineSettings.minOpacity = Math.random() * 0.3;
	lineSettings.maxOpacity = Math.random() * 0.2 + 0.3;
	if (lineSettings.maxOpacity < lineSettings.minOpacity)
		lineSettings.maxOpacity = lineSettings.minOpacity;
	lineSettings.waveHeight = Math.random() * 29 + 1;

	updateSlider("glow-intensity", card.glowIntensity);
	updateSlider("glow-max", card.glowMax);
	updateSlider("particle-count", particleSettings.count);
	updateSlider("particle-min-size", particleSettings.minSize);
	updateSlider("particle-max-size", particleSettings.maxSize);
	updateSlider("particle-min-speed", particleSettings.minSpeed);
	updateSlider("particle-max-speed", particleSettings.maxSpeed);
	updateSlider("particle-min-opacity", particleSettings.minOpacity);
	updateSlider("particle-max-opacity", particleSettings.maxOpacity);
	updateSlider("line-count", lineSettings.count);
	updateSlider("line-min-width", lineSettings.minWidth);
	updateSlider("line-max-width", lineSettings.maxWidth);
	updateSlider("line-min-speed", lineSettings.minSpeed);
	updateSlider("line-max-speed", lineSettings.maxSpeed);
	updateSlider("line-min-opacity", lineSettings.minOpacity);
	updateSlider("line-max-opacity", lineSettings.maxOpacity);
	updateSlider("line-wave-height", lineSettings.waveHeight);

	createParticles();
	createLines();
}

function updateSlider(id, value) {
	const slider = document.getElementById(id);
	if (slider) {
		slider.value = value;
		slider.dispatchEvent(new Event("input"));
	}
}

function createSliderControl(label, id, min, max, value, onChange) {
	const container = document.createElement("div");
	container.className = "slider-control";

	const labelEl = document.createElement("label");
	labelEl.textContent = label + ": ";
	labelEl.htmlFor = id;

	const valueEl = document.createElement("span");
	valueEl.className = "value-display";
	valueEl.textContent = value.toFixed(2);

	const slider = document.createElement("input");
	slider.type = "range";
	slider.id = id;
	slider.min = min;
	slider.max = max;
	slider.step = (max - min) / 100;
	slider.value = value;

	slider.addEventListener("input", () => {
		const val = parseFloat(slider.value);
		valueEl.textContent = val.toFixed(2);
		onChange(val);
	});

	container.appendChild(labelEl);
	container.appendChild(valueEl);
	container.appendChild(slider);
	return container;
}

// Sound effects functions
const sounds = {
	portal: () => {
		const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		const osc = audioCtx.createOscillator();
		const lfo = audioCtx.createOscillator();
		const gainNode = audioCtx.createGain();
		const lfoGain = audioCtx.createGain();

		lfo.frequency.value = 10;
		lfoGain.gain.value = 100;
		lfo.connect(lfoGain);
		lfoGain.connect(osc.frequency);

		osc.frequency.value = 400;
		osc.type = "sawtooth";

		osc.connect(gainNode);
		gainNode.connect(audioCtx.destination);

		gainNode.gain.value = 0.1;
		gainNode.gain.exponentialRampToValueAtTime(
			0.0001,
			audioCtx.currentTime + 1.2
		);

		osc.start();
		lfo.start();
		osc.stop(audioCtx.currentTime + 1.2);
		lfo.stop(audioCtx.currentTime + 1.2);
	},

	crystal: () => {
		const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

		// Play a sequence of crystal tones
		const notes = [1200, 1400, 1600, 1800, 2000];
		notes.forEach((freq, i) => {
			setTimeout(() => {
				const osc = audioCtx.createOscillator();
				const gain = audioCtx.createGain();

				osc.connect(gain);
				gain.connect(audioCtx.destination);

				osc.type = "sine";
				osc.frequency.value = freq;

				gain.gain.value = 0.1;
				gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);

				osc.start();
				osc.stop(audioCtx.currentTime + 0.8);
			}, i * 100);
		});
	},

	bubbles: () => {
		const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

		// Create a series of bubbles with varying characteristics
		for (let i = 0; i < 5; i++) {
			setTimeout(() => {
				const osc = audioCtx.createOscillator();
				const gain = audioCtx.createGain();

				osc.connect(gain);
				gain.connect(audioCtx.destination);

				// Each bubble has a different base frequency
				const baseFreq = 300 + Math.random() * 500;
				osc.type = "sine";
				osc.frequency.value = baseFreq;

				// Quick frequency shift - the key characteristic
				osc.frequency.exponentialRampToValueAtTime(
					baseFreq * 2.2,
					audioCtx.currentTime + 0.06
				);

				// Amplitude envelope for bubble-like shape
				gain.gain.value = 0;
				gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
				gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);

				osc.start();
				osc.stop(audioCtx.currentTime + 0.12);
			}, i * 80 + Math.random() * 40); // Slightly randomized timing
		}
	}
};

// ===============================
// Initialize
// ===============================

updateCardPosition();
createParticles();
createLines();
createControlPanel();
animate();
