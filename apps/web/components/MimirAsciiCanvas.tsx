'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface MimirAsciiCanvasProps {
  sourcePhoto?: string;
  cellSize?: number;
  renderMode?: 'mosaic' | 'characters' | 'dots' | 'dither' | 'matrix';
  theme?: 'dark' | 'light-sage';
  backgroundColor?: string;
  className?: string;
}

export default function MimirAsciiCanvas({
  sourcePhoto = '/ascii-editor/demos/generated/ref-008.webp',
  cellSize = 13,
  renderMode: initialRenderMode = 'mosaic',
  theme = 'dark',
  backgroundColor,
  className = '',
}: MimirAsciiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [renderMode, setRenderMode] = useState(initialRenderMode);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  // Default background color matching the dark atmospheric Mimir palette (#080c14)
  const effectiveBgColor = backgroundColor || (theme === 'dark' ? '#080c14' : '#e6ece6');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = performance.now();

    // Offscreen canvas for generating or loading the base source image
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

    let imgLoaded = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourcePhoto;
    img.onload = () => {
      imgLoaded = true;
    };
    img.onerror = () => {
      imgLoaded = false;
    };

    /**
     * Procedural Mimir classical sculpture generator:
     * Noble bearded elder / philosopher bust with flowing hair, draped toga folds,
     * and high chiaroscuro directional lighting from upper left.
     */
    function drawMimirSculpture(targetCtx: CanvasRenderingContext2D, width: number, height: number, time: number) {
      // Clear offscreen background with deep atmospheric slate
      targetCtx.fillStyle = '#06080d';
      targetCtx.fillRect(0, 0, width, height);

      // Position Mimir slightly to the right half of the canvas
      const centerX = width * 0.64;
      const centerY = height * 0.52;
      const scale = Math.min(width, height) * 0.78;

      // 1. Soft atmospheric background aura behind the sculpture
      const auraGrad = targetCtx.createRadialGradient(
        centerX - scale * 0.15,
        centerY - scale * 0.1,
        scale * 0.05,
        centerX - scale * 0.05,
        centerY,
        scale * 0.75
      );
      auraGrad.addColorStop(0, 'rgba(180, 165, 140, 0.18)');
      auraGrad.addColorStop(0.5, 'rgba(120, 110, 95, 0.08)');
      auraGrad.addColorStop(1, 'rgba(6, 8, 13, 0)');
      targetCtx.fillStyle = auraGrad;
      targetCtx.fillRect(0, 0, width, height);

      targetCtx.save();
      targetCtx.translate(centerX, centerY);

      // 2. Torso / Shoulder Drapery (Classical Toga / Robe)
      // Base dark stone volume
      targetCtx.beginPath();
      targetCtx.ellipse(scale * 0.05, scale * 0.55, scale * 0.52, scale * 0.38, -0.05, 0, Math.PI * 2);
      targetCtx.fillStyle = '#1c1b18';
      targetCtx.fill();

      // Deep folded drapery sweeps diagonally across chest
      const drapeGrad = targetCtx.createLinearGradient(-scale * 0.35, scale * 0.3, scale * 0.35, scale * 0.7);
      drapeGrad.addColorStop(0, '#5a5448');
      drapeGrad.addColorStop(0.3, '#35322b');
      drapeGrad.addColorStop(0.6, '#6e6758');
      drapeGrad.addColorStop(0.85, '#282520');
      drapeGrad.addColorStop(1, '#4d473c');

      // Diagonal drapery folds
      targetCtx.beginPath();
      targetCtx.moveTo(-scale * 0.25, scale * 0.35);
      targetCtx.bezierCurveTo(-scale * 0.1, scale * 0.42, scale * 0.15, scale * 0.52, scale * 0.45, scale * 0.65);
      targetCtx.lineTo(scale * 0.42, scale * 0.85);
      targetCtx.bezierCurveTo(scale * 0.05, scale * 0.72, -scale * 0.2, scale * 0.62, -scale * 0.45, scale * 0.55);
      targetCtx.closePath();
      targetCtx.fillStyle = drapeGrad;
      targetCtx.fill();

      // Drapery crest highlights
      targetCtx.lineWidth = scale * 0.022;
      targetCtx.strokeStyle = '#8c826e';
      targetCtx.beginPath();
      targetCtx.moveTo(-scale * 0.22, scale * 0.37);
      targetCtx.quadraticCurveTo(scale * 0.05, scale * 0.48, scale * 0.4, scale * 0.64);
      targetCtx.stroke();

      targetCtx.lineWidth = scale * 0.016;
      targetCtx.strokeStyle = '#a69b84';
      targetCtx.beginPath();
      targetCtx.moveTo(-scale * 0.15, scale * 0.46);
      targetCtx.quadraticCurveTo(scale * 0.1, scale * 0.56, scale * 0.35, scale * 0.72);
      targetCtx.stroke();

      // 3. Neck & Chest Collar Bone
      targetCtx.beginPath();
      targetCtx.rect(-scale * 0.09, scale * 0.14, scale * 0.18, scale * 0.24);
      targetCtx.fillStyle = '#423d34';
      targetCtx.fill();

      // Left neck tendon highlight
      targetCtx.beginPath();
      targetCtx.ellipse(-scale * 0.05, scale * 0.22, scale * 0.035, scale * 0.1, -0.2, 0, Math.PI * 2);
      targetCtx.fillStyle = '#827967';
      targetCtx.fill();

      // 4. Head, Skull & Jaw Structure
      targetCtx.beginPath();
      targetCtx.ellipse(0, -scale * 0.06, scale * 0.22, scale * 0.28, 0, 0, Math.PI * 2);
      targetCtx.fillStyle = '#3a362f';
      targetCtx.fill();

      // 5. Flowing Sculpted Hair & Crown of Head
      targetCtx.beginPath();
      targetCtx.ellipse(scale * 0.02, -scale * 0.22, scale * 0.25, scale * 0.18, -0.08, 0, Math.PI * 2);
      targetCtx.fillStyle = '#4c463d';
      targetCtx.fill();

      // Hair wave locks (swept back and sides)
      targetCtx.beginPath();
      targetCtx.ellipse(-scale * 0.12, -scale * 0.18, scale * 0.1, scale * 0.14, -0.3, 0, Math.PI * 2);
      targetCtx.fillStyle = '#786f5f';
      targetCtx.fill();

      targetCtx.beginPath();
      targetCtx.ellipse(scale * 0.14, -scale * 0.14, scale * 0.12, scale * 0.16, 0.25, 0, Math.PI * 2);
      targetCtx.fillStyle = '#332f28';
      targetCtx.fill();

      // 6. Facial Features (Chiaroscuro: Key light on forehead, nose ridge, and left cheek)
      // Forehead bone highlight
      targetCtx.beginPath();
      targetCtx.ellipse(-scale * 0.04, -scale * 0.12, scale * 0.12, scale * 0.07, -0.15, 0, Math.PI * 2);
      targetCtx.fillStyle = '#c7bcab';
      targetCtx.fill();

      // Eye socket shadow cavity
      targetCtx.beginPath();
      targetCtx.ellipse(-scale * 0.06, -scale * 0.04, scale * 0.055, scale * 0.035, 0, 0, Math.PI * 2);
      targetCtx.ellipse(scale * 0.06, -scale * 0.04, scale * 0.05, scale * 0.035, 0, 0, Math.PI * 2);
      targetCtx.fillStyle = '#181613';
      targetCtx.fill();

      // Brow ridge highlight
      targetCtx.beginPath();
      targetCtx.ellipse(-scale * 0.05, -scale * 0.065, scale * 0.07, scale * 0.025, -0.1, 0, Math.PI * 2);
      targetCtx.fillStyle = '#d6cca0';
      targetCtx.fill();

      // Classical sculpted nose ridge
      targetCtx.beginPath();
      targetCtx.moveTo(-scale * 0.015, -scale * 0.06);
      targetCtx.lineTo(-scale * 0.035, scale * 0.06);
      targetCtx.lineTo(-scale * 0.01, scale * 0.07);
      targetCtx.lineTo(scale * 0.015, -scale * 0.06);
      targetCtx.closePath();
      targetCtx.fillStyle = '#dcd3c2';
      targetCtx.fill();

      // Left cheekbone highlight
      targetCtx.beginPath();
      targetCtx.ellipse(-scale * 0.09, scale * 0.03, scale * 0.05, scale * 0.07, -0.2, 0, Math.PI * 2);
      targetCtx.fillStyle = '#b3a894';
      targetCtx.fill();

      // 7. Full Sculpted Beard & Mustache (The signature of Mimir)
      // Mustache
      targetCtx.beginPath();
      targetCtx.ellipse(0, scale * 0.09, scale * 0.09, scale * 0.04, 0, 0, Math.PI * 2);
      targetCtx.fillStyle = '#a89d89';
      targetCtx.fill();

      // Main flowing beard mass
      targetCtx.beginPath();
      targetCtx.moveTo(-scale * 0.18, scale * 0.08);
      targetCtx.quadraticCurveTo(-scale * 0.22, scale * 0.26, -scale * 0.08, scale * 0.44);
      targetCtx.quadraticCurveTo(scale * 0.02, scale * 0.48, scale * 0.12, scale * 0.42);
      targetCtx.quadraticCurveTo(scale * 0.2, scale * 0.25, scale * 0.18, scale * 0.08);
      targetCtx.closePath();
      targetCtx.fillStyle = '#544e43';
      targetCtx.fill();

      // Chiseled beard curl highlights (striated marble texture)
      const beardHighlights = [
        { x: -scale * 0.08, y: scale * 0.16, rx: scale * 0.04, ry: scale * 0.1, rot: -0.2, col: '#bfb4a0' },
        { x: -scale * 0.02, y: scale * 0.22, rx: scale * 0.045, ry: scale * 0.13, rot: -0.05, col: '#d2c7b3' },
        { x: scale * 0.05, y: scale * 0.26, rx: scale * 0.04, ry: scale * 0.11, rot: 0.1, col: '#9c927f' },
        { x: -scale * 0.06, y: scale * 0.32, rx: scale * 0.035, ry: scale * 0.09, rot: -0.15, col: '#b5a995' },
        { x: 0, y: scale * 0.36, rx: scale * 0.04, ry: scale * 0.08, rot: 0, col: '#8e8473' },
      ];

      for (const curl of beardHighlights) {
        targetCtx.beginPath();
        targetCtx.ellipse(curl.x, curl.y, curl.rx, curl.ry, curl.rot, 0, Math.PI * 2);
        targetCtx.fillStyle = curl.col;
        targetCtx.fill();
      }

      // Subtle atmospheric starlight / dust particles
      for (let p = 0; p < 25; p++) {
        const rad = scale * (0.35 + (p % 7) * 0.08);
        const ang = p * 0.4 + time * 0.0003;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad * 0.85;

        targetCtx.beginPath();
        targetCtx.arc(px, py, scale * 0.012, 0, Math.PI * 2);
        targetCtx.fillStyle = 'rgba(215, 205, 185, 0.4)';
        targetCtx.fill();
      }

      targetCtx.restore();
    }

    const CHAR_SET = ' .:-=+*#%@';

    function render(currentTime: number) {
      if (!canvas || !ctx || !offCtx) return;
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      const time = currentTime - startTime;

      // 1. Draw source photo or Mimir sculpture into offscreen canvas
      offscreen.width = width;
      offscreen.height = height;

      if (imgLoaded && img.complete && img.naturalWidth > 0) {
        offCtx.drawImage(img, 0, 0, width, height);
      } else {
        drawMimirSculpture(offCtx, width, height, time);
      }

      let imgData: ImageData;
      try {
        imgData = offCtx.getImageData(0, 0, width, height);
      } catch {
        return;
      }
      const pixels = imgData.data;

      // 2. Clear canvas with effective background color
      ctx.fillStyle = effectiveBgColor;
      ctx.fillRect(0, 0, width, height);

      // 3. Grid sampling per cellSize (13px default per recipe)
      const step = cellSize;
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);

      // Recipe parameters
      const brightness = 12; // +12
      const contrast = 1.15; // 115%
      const animSpeed = 98;
      const animIntensity = 60;

      // Center for ripple wave (originating from Mimir bust)
      const rippleOriginX = width * 0.64;
      const rippleOriginY = height * 0.48;

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * step;
          const y = r * step;
          const centerX = Math.floor(x + step / 2);
          const centerY = Math.floor(y + step / 2);

          const idx = (centerY * width + centerX) * 4;
          let red = pixels[idx] || 0;
          let green = pixels[idx + 1] || 0;
          let blue = pixels[idx + 2] || 0;

          // Standard Luminance (ITU-R BT.601)
          let lum = 0.299 * red + 0.587 * green + 0.114 * blue;

          // Apply Contrast (115%) and Brightness (+12)
          lum = (lum - 128) * contrast + 128 + brightness * 2.55;
          lum = Math.max(0, Math.min(255, lum));

          // Also adjust RGB for vibrant mosaic colors
          red = Math.max(0, Math.min(255, (red - 128) * contrast + 128 + brightness * 2.55));
          green = Math.max(0, Math.min(255, (green - 128) * contrast + 128 + brightness * 2.55));
          blue = Math.max(0, Math.min(255, (blue - 128) * contrast + 128 + brightness * 2.55));

          let norm = lum / 255;

          // "Ripple" Animation calculation
          const distToRipple = Math.hypot(centerX - rippleOriginX, centerY - rippleOriginY);
          const ripplePhase = distToRipple * 0.035 - (time * 0.0022 * (animSpeed / 50));
          const rippleWave = Math.sin(ripplePhase) * ((animIntensity / 100) * 0.24);
          norm = Math.max(0, Math.min(1, norm + rippleWave));

          // Interactive cursor light boost
          if (mousePos.current) {
            const dx = centerX - mousePos.current.x;
            const dy = centerY - mousePos.current.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 150) {
              const boost = (1 - dist / 150) * 0.35;
              norm = Math.min(1, norm + boost);
            }
          }

          // Skip completely dark background tiles to preserve seamless blending
          if (norm < 0.06) continue;

          ctx.save();

          if (renderMode === 'mosaic') {
            // Mimir mosaic rounded square tile
            const tileSize = Math.max(2, (step - 1.4) * Math.min(1.08, Math.max(0.3, norm * 1.1)));
            const radius = Math.min(2.5, tileSize * 0.2);
            const tileAlpha = Math.min(1, Math.max(0.25, norm * 1.15));

            ctx.fillStyle = `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${tileAlpha})`;
            ctx.beginPath();
            ctx.roundRect(centerX - tileSize / 2, centerY - tileSize / 2, tileSize, tileSize, radius);
            ctx.fill();

            // Subtle top-left highlight border for tactile 3D mosaic depth
            if (norm > 0.35) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${norm * 0.12})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          } else if (renderMode === 'characters') {
            // Standard glyph ramp
            const charIdx = Math.floor(norm * (CHAR_SET.length - 1));
            const char = CHAR_SET[charIdx] || '.';
            const fontSize = Math.round(step * 0.95);

            ctx.font = `600 ${fontSize}px var(--font-mono, monospace)`;
            ctx.fillStyle = `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${Math.max(0.3, norm)})`;
            ctx.fillText(char, centerX, centerY);
          } else if (renderMode === 'dots') {
            const dotR = Math.max(1, (step / 2 - 1) * norm);
            ctx.fillStyle = `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${Math.max(0.3, norm)})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, dotR, 0, Math.PI * 2);
            ctx.fill();
          } else if (renderMode === 'dither') {
            const isFilled = ((c + r) % 2 === 0 && norm > 0.35) || norm > 0.65;
            if (isFilled) {
              ctx.fillStyle = `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${norm})`;
              ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
            }
          }

          ctx.restore();
        }
      }

      // 4. Post-Effect: Chromatic Aberration (intensity: 15)
      // Subtle channel shift across highlights
      const chromaticIntensity = 15;
      if (chromaticIntensity > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 30, 30, 0.025)';
        ctx.fillRect(-1.5, 0, width, height);
        ctx.fillStyle = 'rgba(30, 120, 255, 0.025)';
        ctx.fillRect(1.5, 0, width, height);
        ctx.restore();
      }

      // 5. Post-Effect: Vignette (intensity: 38)
      // Radial perimeter darkening fading out to effectiveBgColor
      ctx.save();
      const maxDim = Math.max(width, height);
      const vignette = ctx.createRadialGradient(
        rippleOriginX,
        rippleOriginY,
        maxDim * 0.22,
        rippleOriginX,
        rippleOriginY,
        maxDim * 0.68
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.65, 'rgba(0, 0, 0, 0.25)');
      vignette.addColorStop(1, effectiveBgColor);

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 6. Seamless Blend Mask on Left Edge:
      // Smooth horizontal gradient fading the left 30% of the canvas completely into effectiveBgColor
      ctx.save();
      const fadeWidth = width * 0.35;
      const leftFade = ctx.createLinearGradient(0, 0, fadeWidth, 0);
      leftFade.addColorStop(0, effectiveBgColor);
      leftFade.addColorStop(0.5, `${effectiveBgColor}cc`);
      leftFade.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = leftFade;
      ctx.fillRect(0, 0, fadeWidth, height);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    }

    // High DPR canvas resizing
    function handleResize() {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse tracking for interactive wave ripple
    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mousePos.current = {
        x: (e.clientX - rect.left) * dpr,
        y: (e.clientY - rect.top) * dpr,
      };
    }

    function handleMouseLeave() {
      mousePos.current = null;
    }

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [cellSize, renderMode, effectiveBgColor, sourcePhoto]);

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Interactive Mode Badge Selector in corner */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-mono text-white/70">
        <span className="px-2 py-0.5 text-white/40">MIMIR RECIPE</span>
        {(['mosaic', 'characters', 'dots'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setRenderMode(mode)}
            className={`px-2 py-0.5 rounded transition-colors uppercase ${
              renderMode === mode
                ? 'bg-white/20 text-white font-semibold'
                : 'hover:text-white hover:bg-white/10 text-white/60'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}

