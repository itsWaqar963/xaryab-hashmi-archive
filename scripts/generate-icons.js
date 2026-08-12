const { createCanvas } = require('canvas');
const fs = require('fs');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, size, size);

  // Circle with purple gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#8B5CF6');
  gradient.addColorStop(1, '#6366F1');
  
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('X', size/2, size/2 + size * 0.05);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename}`);
}

// Generate icons
generateIcon(192, 'public/icon-192.png');
generateIcon(512, 'public/icon-512.png');
console.log('Icons generated successfully!');