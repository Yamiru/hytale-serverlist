/*!
 * Hytale Green Starfield Animation
 * Custom fantasy effect by Yamiru
 * MIT License
 */

"use strict";

(() => {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });

  const DPR = Math.min(1.4, window.devicePixelRatio || 1);
  let width = 0;
  let height = 0;

  let stars = [];
  let t = 0;
  let active = true;

  const maxStars = /Mobi|Android/i.test(navigator.userAgent) ? 60 : 120;

  function resize() {
    width = Math.floor(window.innerWidth * DPR);
    height = Math.floor(window.innerHeight * DPR);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width / DPR + "px";
    canvas.style.height = height / DPR + "px";

    const base = Math.min(width, height) / 900;
    const count = Math.max(50, Math.floor(maxStars * base));

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: (Math.random() * 1.4 + 0.6) * DPR,
      a: Math.random() * Math.PI * 2,
      v: Math.random() * 0.012 + 0.004,
      drift: Math.random() * 0.3 + 0.15,
      blink: Math.random() * 0.015 + 0.005
    }));
  }

  let last = 0;
  let fpsMA = 60;
  let skip = 0;

  function tick(now) {
    if (!active) return;

    const dt = now - last;
    last = now;

    const fps = dt > 0 ? 1000 / dt : 60;
    fpsMA = fpsMA * 0.9 + fps * 0.1;

    // Dynamic performance
    if (fpsMA < 54 && stars.length > 45) {
      stars.length = Math.floor(stars.length * 0.85);
    }
    if (fpsMA < 48 && ++skip % 2) {
      requestAnimationFrame(tick);
      return;
    }

    t += 0.0028;

    ctx.clearRect(0, 0, width, height);

    // Soft emerald ambient gradient
    const gx = (Math.sin(t * 0.6) + 1) / 2;
    const gy = (Math.cos(t * 0.4) + 1) / 2;

    const gradient = ctx.createRadialGradient(
      width * (0.25 + gx * 0.4),
      height * (0.15 + gy * 0.25),
      0,
      width * 0.5,
      height * 0.55,
      Math.max(width, height) * 0.8
    );

    gradient.addColorStop(0, "rgba(72,255,138,0.10)");
    gradient.addColorStop(0.5, "rgba(60,183,106,0.08)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Star particles
    for (const s of stars) {
      s.a += s.v;
      s.x += Math.cos(s.a) * s.drift * 0.25;
      s.y += Math.sin(s.a * 0.6) * s.drift * 0.2;

      if (s.x < 0) s.x += width;
      if (s.x > width) s.x -= width;
      if (s.y < 0) s.y += height;
      if (s.y > height) s.y -= height;

      const pulse = (Math.sin(t * 2 + s.a * 3) + 1) / 2;
      const blink = (Math.sin(t * (3 + s.blink * 50))) * 0.5 + 0.5;

      const radius = s.r * (1 + pulse * 0.35);

      ctx.beginPath();
      ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);

      const alpha = 0.12 + pulse * 0.25 + blink * 0.15;

      ctx.fillStyle = `rgba(72,255,138,${alpha})`;
      ctx.shadowColor = "rgba(72,255,138,0.8)";
      ctx.shadowBlur = 6 + pulse * 4;

      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", () => {
    active = !document.hidden;
    if (active) {
      last = performance.now();
      requestAnimationFrame(tick);
    }
  });

  window.addEventListener("blur", () => {
    active = false;
  });

  window.addEventListener("focus", () => {
    if (!active) {
      active = true;
      last = performance.now();
      requestAnimationFrame(tick);
    }
  });

  window.addEventListener("resize", resize, { passive: true });

  resize();
  last = performance.now();
  requestAnimationFrame(tick);
})();
