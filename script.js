const canvas = document.getElementById("colorWheel");
const ctx = canvas.getContext("2d");
const resultDiv = document.getElementById("result");
const colorDisplay = document.getElementById("colorDisplay");

const radius = canvas.width / 2;
let generatedColor = null;
let guessedColor = null;
let showAnswer = false;

function drawColorWheel() {
  const image = ctx.createImageData(canvas.width, canvas.height);
  const data = image.data;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
      const sat = dist / radius;
      const [r, g, b] = hslToRgb(angle, sat, 0.5);
      const i = (y * canvas.width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}

function drawMarker(color, strokeStyle) {
  const { h, s } = color;
  const angleRad = h * Math.PI / 180;
  const r = s * radius;
  const x = radius + r * Math.cos(angleRad);
  const y = radius + r * Math.sin(angleRad);

  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function generateColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.random();
  const l = 0.5;
  generatedColor = { h, s, l };
  guessedColor = null;
  showAnswer = false;
  const hex = rgbToHex(...hslToRgb(h, s, l));
  colorDisplay.textContent = `Hex: ${hex}`;
  resultDiv.textContent = "";
  redraw();
}

function checkGuess() {
  if (!generatedColor || !guessedColor) {
    resultDiv.textContent = "Please generate and pick a color first!";
    return;
  }

  const diff = colorDistance(generatedColor, guessedColor);
  resultDiv.textContent = `You were ${diff.toFixed(2)}% away.`;
  showAnswer = true;
  redraw();
}

function colorDistance(c1, c2) {
  const dh = Math.min(Math.abs(c1.h - c2.h), 360 - Math.abs(c1.h - c2.h)) / 180;
  const ds = c1.s - c2.s;
  const dl = c1.l - c2.l;
  return Math.sqrt(dh * dh + ds * ds + dl * dl) * 100;
}

function redraw() {
  drawColorWheel();
  if (guessedColor) drawMarker(guessedColor, "black");
  if (generatedColor && showAnswer) drawMarker(generatedColor, "white");
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - radius;
  const y = e.clientY - rect.top - radius;
  const dist = Math.sqrt(x * x + y * y);
  if (dist > radius) return;

  const angle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const sat = dist / radius;
  guessedColor = { h: angle, s: sat, l: 0.5 };
  redraw();
});

function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

drawColorWheel();
