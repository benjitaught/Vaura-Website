// VAURA Wave Background Animation - Animated waves behind footer only

function initWaveBackground() {
  const footer = document.querySelector('footer');

  if (!footer) return;

  // Create canvas for footer
  const footerCanvas = document.createElement('canvas');
  footerCanvas.style.position = 'absolute';
  footerCanvas.style.top = '0';
  footerCanvas.style.left = '0';
  footerCanvas.style.width = '100%';
  footerCanvas.style.height = '100%';
  footerCanvas.style.pointerEvents = 'none';
  footerCanvas.style.zIndex = '-1';
  footerCanvas.style.opacity = '0.6';
  footer.style.position = 'relative';
  footer.style.overflow = 'hidden';
  footer.appendChild(footerCanvas);

  function animateCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, imageData, data;
    const SCALE = 1.5;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      width = Math.floor(canvas.width / SCALE);
      height = Math.floor(canvas.height / SCALE);
      imageData = ctx.createImageData(width, height);
      data = imageData.data;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const startTime = Date.now();

    // Pre-computed sin/cos tables
    const SIN_TABLE = new Float32Array(1024);
    const COS_TABLE = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const angle = (i / 1024) * Math.PI * 2;
      SIN_TABLE[i] = Math.sin(angle);
      COS_TABLE[i] = Math.cos(angle);
    }

    const fastSin = (x) => {
      const index = Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023;
      return SIN_TABLE[index];
    };

    const fastCos = (x) => {
      const index = Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023;
      return COS_TABLE[index];
    };

    const render = () => {
      const time = (Date.now() - startTime) * 0.0005;
      const scale = Math.max(width, height) * 0.6; // stretch waves to fill wide elements

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const u_x = (2 * x - width) / scale;
          const u_y = (2 * y - height) / scale;

          let a = 0;
          let d = 0;

          for (let i = 0; i < 4; i++) {
            a += fastCos(i - d + time * 0.3 - a * u_x);
            d += fastSin(i * u_y + a);
          }

          const wave = (fastSin(a) + fastCos(d)) * 0.5;
          const intensity = 0.40 + 0.45 * wave;
          const baseVal = 0.08 + 0.15 * fastCos(u_x + u_y + time * 0.15);

          const greenAccent = 0.55 * fastSin(a * 1.5 + time * 0.1);
          const cyanAccent = 0.50 * fastCos(d * 2 + time * 0.08);
          const magentaAccent = 0.52 * fastSin(u_x * 3 + time * 0.1);

          const r = Math.max(0, Math.min(1, baseVal + greenAccent * 0.15 + magentaAccent * 0.7)) * intensity;
          const g = Math.max(0, Math.min(1, baseVal + greenAccent * 0.8 + cyanAccent * 0.25)) * intensity;
          const b = Math.max(0, Math.min(1, baseVal + cyanAccent * 0.8 + magentaAccent * 0.6)) * intensity;

          const index = (y * width + x) * 4;
          data[index] = r * 255;
          data[index + 1] = g * 255;
          data[index + 2] = b * 255;
          data[index + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      if (SCALE > 1) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(canvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
      }

      requestAnimationFrame(render);
    };

    render();
  }

  animateCanvas(footerCanvas);
}

// Auto-initialize if DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWaveBackground);
} else {
  initWaveBackground();
}
