/**
 * Nexus-Flow — Scroll-Responsive Atmospheric Dimensional Background
 * Continuously transitions ambient bloom colors, positioning, and depth
 * across obsidian, walnut brown, sage green, electric cyan, and soft amber
 * as the user scrolls through the 10 sections.
 * PayPal & AI Hackathon 2026
 */
(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = (canvas.width = window.innerWidth);
  let H = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initBlobs();
  });

  // Track smoothed scroll progress (0.0 to 1.0)
  let scrollY = window.scrollY;
  let targetScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  // Atmospheric Palettes for Section Horizons:
  // 0. Hero: Walnut brown [48, 37, 31] & warm graphite
  // 1. How It Works: Walnut [48, 37, 31] & soft amber [214, 164, 93]
  // 2. Terminal: Deep graphite [25, 26, 27] & electric cyan [99, 214, 208]
  // 3. BOM: Warm brown [73, 55, 45] & sage green [163, 177, 138]
  // 4. Intelligence: Sage green [163, 177, 138] & muted emerald [111, 152, 125]
  // 5. Suppliers: Warm walnut [48, 37, 31] & amber [214, 164, 93]
  // 6. Checkout: PayPal blue [0, 112, 186] & warm ivory
  // 7. Control Tower: Electric cyan [99, 214, 208] & graphite
  // 8. History: Walnut brown & deep obsidian
  // 9. Footer: Pure obsidian [11, 11, 13]

  const BLOB_SPECS = [
    { baseR: 0.55, rxScale: 1.15, baseColor: [48, 37, 31],   opacity: 0.35, speed: 0.002, xRatio: 0.2,  yOffset: 0.15 },
    { baseR: 0.45, rxScale: 0.95, baseColor: [73, 55, 45],   opacity: 0.28, speed: 0.003, xRatio: 0.8,  yOffset: 0.35 },
    { baseR: 0.38, rxScale: 1.05, baseColor: [163, 177, 138],opacity: 0.08, speed: 0.004, xRatio: 0.45, yOffset: 0.55 },
    { baseR: 0.32, rxScale: 0.85, baseColor: [111, 152, 125],opacity: 0.07, speed: 0.003, xRatio: 0.7,  yOffset: 0.75 },
    { baseR: 0.25, rxScale: 1.25, baseColor: [99, 214, 208],  opacity: 0.045,speed: 0.005, xRatio: 0.3,  yOffset: 0.85 },
  ];

  let blobs = [];

  function initBlobs() {
    blobs = BLOB_SPECS.map((def, i) => ({
      x: def.xRatio * W,
      y: (def.yOffset * H),
      currentY: def.yOffset * H,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
      rx: def.baseR * Math.min(W, H) * def.rxScale,
      ry: def.baseR * Math.min(W, H),
      color: [...def.baseColor],
      targetColor: [...def.baseColor],
      opacity: def.opacity,
      phase: i * (Math.PI * 0.4),
      speed: def.speed,
      def: def
    }));
  }
  initBlobs();

  let tick = 0;

  function interpolateColor(c1, c2, factor) {
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * factor),
      Math.round(c1[1] + (c2[1] - c1[1]) * factor),
      Math.round(c1[2] + (c2[2] - c1[2]) * factor)
    ];
  }

  function render() {
    tick++;

    // Smoothly interpolate scroll
    scrollY += (targetScrollY - scrollY) * 0.08;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollPct = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    // Compute dynamic color tint based on scroll stage
    let ambientTint = [48, 37, 31]; // Walnut start
    if (scrollPct < 0.2) {
      // Hero to How It Works (Walnut -> Soft Amber)
      const t = scrollPct / 0.2;
      ambientTint = interpolateColor([48, 37, 31], [80, 58, 40], t);
    } else if (scrollPct < 0.45) {
      // Terminal to BOM (Warm brown -> Sage green)
      const t = (scrollPct - 0.2) / 0.25;
      ambientTint = interpolateColor([80, 58, 40], [60, 75, 55], t);
    } else if (scrollPct < 0.7) {
      // Intelligence & Suppliers (Sage green -> Cyan tint)
      const t = (scrollPct - 0.45) / 0.25;
      ambientTint = interpolateColor([60, 75, 55], [40, 70, 75], t);
    } else if (scrollPct < 0.9) {
      // Control Tower to History (Cyan tint -> Deep Charcoal)
      const t = (scrollPct - 0.7) / 0.2;
      ambientTint = interpolateColor([40, 70, 75], [35, 30, 32], t);
    } else {
      // Footer (Obsidian)
      const t = (scrollPct - 0.9) / 0.1;
      ambientTint = interpolateColor([35, 30, 32], [20, 20, 22], t);
    }

    // Base obsidian fill #0B0B0D
    ctx.fillStyle = "#0B0B0D";
    ctx.fillRect(0, 0, W, H);

    // Dynamic subtle grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    const GRID = 80;
    for (let x = 0; x <= W; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Update and draw each atmospheric light bloom
    blobs.forEach((blob, i) => {
      if (!prefersReducedMotion) {
        // Natural drift
        blob.x += blob.vx + Math.sin(tick * blob.speed + blob.phase) * 0.12;

        // Vertical scroll parallax shift: blobs travel with scroll
        const scrollOffset = (scrollPct - 0.5) * H * 0.4 * (i % 2 === 0 ? 1 : -0.7);
        const targetY = (blob.def.yOffset * H) + scrollOffset;
        blob.y += (targetY - blob.y) * 0.05;

        // Boundary wrapping
        if (blob.x < -blob.rx) blob.x = W + blob.rx;
        if (blob.x > W + blob.rx) blob.x = -blob.rx;
      }

      // Smooth color morph towards ambient tint for primary blooms
      if (i === 0) {
        blob.color = interpolateColor(blob.def.baseColor, ambientTint, 0.65);
      } else if (i === 2) {
        // Sage bloom strengthens during BOM and Intelligence (0.35 - 0.65)
        const sageWeight = Math.sin(scrollPct * Math.PI);
        blob.opacity = blob.def.opacity * (0.8 + 0.6 * sageWeight);
      } else if (i === 4) {
        // Cyan bloom strengthens around Control Tower (0.65 - 0.85)
        const towerWeight = Math.max(0, 1 - Math.abs(scrollPct - 0.75) * 4);
        blob.opacity = blob.def.opacity * (0.8 + 1.2 * towerWeight);
      }

      const [r, g, b] = blob.color;
      const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.rx);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${blob.opacity})`);
      grad.addColorStop(0.45,`rgba(${r},${g},${b},${blob.opacity * 0.45})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.ellipse(blob.x, blob.y, blob.rx, blob.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
})();
