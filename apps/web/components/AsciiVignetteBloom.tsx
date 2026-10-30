'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AsciiVignetteBloomProps {
  sourcePhoto?: string;
  cellSize?: number;
  initialRenderMode?: 'characters' | 'mosaic' | 'dots' | 'dither';
  theme?: 'light-sage' | 'dark';
  className?: string;
}

export default function AsciiVignetteBloom({
  sourcePhoto = '/ascii-editor/demos/generated/ref-008.webp',
  cellSize = 12,
  initialRenderMode = 'characters',
  theme = 'light-sage',
  className = '',
}: AsciiVignetteBloomProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [renderMode, setRenderMode] = useState(initialRenderMode);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

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

    // Attempt to load provided image file
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

    // Realistic bust silhouette generator matching the Pencil / 21st.dev reference
    function drawFigureSilhouette(targetCtx: CanvasRenderingContext2D, width: number, height: number, time: number) {
      // Clear offscreen with black
      targetCtx.fillStyle = '#000000';
      targetCtx.fillRect(0, 0, width, height);

      // We position the bust figure in the right half of the canvas, just like the reference photo
      const centerX = width * 0.58;
      const centerY = height * 0.52;
      const scale = Math.min(width, height) * 0.75;

      targetCtx.save();
      targetCtx.translate(centerX, centerY);

      // 1. Shoulders / Torso silhouette
      targetCtx.beginPath();
      targetCtx.ellipse(0, scale * 0.52, scale * 0.48, scale * 0.32, 0, 0, Math.PI * 2);
      targetCtx.fillStyle = '#666666';
      targetCtx.fill();

      // 2. Neck
      targetCtx.beginPath();
      targetCtx.rect(-scale * 0.1, scale * 0.14, scale * 0.2, scale * 0.25);
      targetCtx.fillStyle = '#888888';
      targetCtx.fill();

      // 3. Head / Jaw contour
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, scale * 0.22, scale * 0.28, 0, 0, Math.PI * 2);
      targetCtx.fillStyle = '#bbbbbb';
      targetCtx.fill();

      // 4. Hair volume
      targetCtx.beginPath();
      targetCtx.ellipse(scale * 0.02, -scale * 0.16, scale * 0.24, scale * 0.18, -0.1, 0, Math.PI * 2);
      targetCtx.fillStyle = '#555555';
      targetCtx.fill();

      // 5. Facial features & lighting contours (highlights create character density)
      // Forehead highlight
      targetCtx.beginPath();
      targetCtx.ellipse(-scale * 0.04, -scale * 0.08, scale * 0.12, scale * 0.07, -0.2, 0, Math.PI * 2);
      targetCtx.fillStyle = '#ffffff';
      targetCtx.fill();

      // Cheek / nose ridge highlight
      targetCtx.beginPath();
      targetCtx.ellipse(-scale * 0.02, scale * 0.03, scale * 0.06, scale * 0.11, -0.1, 0, Math.PI * 2);
      targetCtx.fillStyle = '#eeeeee';
      targetCtx.fill();

      // Chin highlight
      targetCtx.beginPath();
      targetCtx.ellipse(0, scale * 0.18, scale * 0.07, scale * 0.05, 0, 0, Math.PI * 2);
      targetCtx.fillStyle = '#dddddd';
      targetCtx.fill();

      // Ear contour
      targetCtx.beginPath();
      targetCtx.ellipse(scale * 0.18, scale * 0.02, scale * 0.05, scale * 0.09, 0.2, 0, Math.PI * 2);
      targetCtx.fillStyle = '#777777';
      targetCtx.fill();

      // Collar bone / jacket lines
      targetCtx.beginPath();
      targetCtx.moveTo(-scale * 0.22, scale * 0.45);
      targetCtx.lineTo(0, scale * 0.28);
      targetCtx.lineTo(scale * 0.22, scale * 0.45);
      targetCtx.strokeStyle = '#aaaaaa';
      targetCtx.lineWidth = scale * 0.03;
      targetCtx.stroke();

      // Ambient contour particles & digital sparkles
      for (let p = 0; p < 40; p++) {
        const angle = p * 0.35 + time * 0.0004;
        const rad = scale * 0.35 + Math.sin(p * 11 + time * 0.001) * (scale * 0.12);
        const px = Math.cos(angle) * rad;
        const py = Math.sin(angle) * rad * 0.9;

        targetCtx.beginPath();
        targetCtx.arc(px, py, scale * 0.015, 0, Math.PI * 2);
        targetCtx.fillStyle = '#ffffff';
        targetCtx.fill();
      }

      targetCtx.restore();
    }

    // ASCII characters density ramp (standard 21st.dev / Unix set from sparse to dense)
    const CHAR_SET = ' .:-=+*#%@';

    function render(currentTime: number) {
      if (!canvas || !ctx || !offCtx) return;
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      const time = currentTime - startTime;

      // 1. Render base photo/silhouette into offscreen canvas
      offscreen.width = width;
      offscreen.height = height;

      if (imgLoaded && img.complete && img.naturalWidth > 0) {
        offCtx.drawImage(img, 0, 0, width, height);
      } else {
        drawFigureSilhouette(offCtx, width, height, time);
      }

      let imgData: ImageData;
      try {
        imgData = offCtx.getImageData(0, 0, width, height);
      } catch {
        return;
      }
      const pixels = imgData.data;

      // 2. Clear canvas with background color matching the landing page sage palette (#e6ece6)
      const bgColor = theme === 'light-sage' ? '#e6ece6' : '#090d16';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // 3. Grid sampling per cellSize (12-16px)
      const step = cellSize;
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);

      // Theme-specific text color
      // In light-sage, deep forest green (#0b3320) characters!
      const charColorR = theme === 'light-sage' ? 11 : 56;
      const charColorG = theme === 'light-sage' ? 51 : 189;
      const charColorB = theme === 'light-sage' ? 32 : 248;

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      // Wave animation parameters
      const animSpeed = 1.0;
      const animIntensity = 0.6;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * step;
          const y = r * step;
          const centerX = Math.floor(x + step / 2);
          const centerY = Math.floor(y + step / 2);

          const idx = (centerY * width + centerX) * 4;
          const red = pixels[idx] || 0;
          const green = pixels[idx + 1] || 0;
          const blue = pixels[idx + 2] || 0;

          // Standard Luminance (ITU-R BT.601)
          let lum = 0.299 * red + 0.587 * green + 0.114 * blue;

          // Contrast (+15%) and Brightness (+12) adjustments
          lum = (lum - 128) * 1.15 + 128 + 12 * 2.55;
          lum = Math.max(0, Math.min(255, lum));

          let norm = lum / 255;

          // Wave animation wave displacement across grid
          const wavePhase = (c * 0.16 + r * 0.16) - (time * 0.0028 * animSpeed);
          const wave = Math.sin(wavePhase) * (animIntensity * 0.28);
          norm = Math.max(0, Math.min(1, norm + wave));

          // Interactive mouse proximity boost
          if (mousePos.current) {
            const dx = centerX - mousePos.current.x;
            const dy = centerY - mousePos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
              const boost = (1 - dist / 140) * 0.35;
              norm = Math.min(1, norm + boost);
            }
          }

          // Skip completely empty space so page background shines through
          if (norm < 0.12) continue;

          ctx.save();

          if (renderMode === 'characters') {
            // Map luminance to glyph index in CHAR_SET
            const charIdx = Math.floor(norm * (CHAR_SET.length - 1));
            const char = CHAR_SET[charIdx] || '.';
            const fontSize = Math.round(step * 0.95);

            ctx.font = `600 ${fontSize}px var(--font-mono, monospace)`;
            const alpha = Math.min(1, Math.max(0.2, norm * 1.1));
            ctx.fillStyle = `rgba(${charColorR}, ${charColorG}, ${charColorB}, ${alpha})`;
            ctx.fillText(char, centerX, centerY);
          } else if (renderMode === 'mosaic') {
            const size = (step - 1.5) * Math.max(0.25, norm);
            const radius = Math.min(size / 2, 2.5);
            ctx.fillStyle = `rgba(${charColorR}, ${charColorG}, ${charColorB}, ${Math.max(0.3, norm)})`;
            ctx.beginPath();
            ctx.roundRect(centerX - size / 2, centerY - size / 2, size, size, radius);
            ctx.fill();
          } else if (renderMode === 'dots') {
            const dotR = (step / 2 - 1) * norm;
            ctx.fillStyle = `rgba(${charColorR}, ${charColorG}, ${charColorB}, ${Math.max(0.3, norm)})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, Math.max(1, dotR), 0, Math.PI * 2);
            ctx.fill();
          } else if (renderMode === 'dither') {
            const isFilled = ((c + r) % 2 === 0 && norm > 0.35) || norm > 0.65;
            if (isFilled) {
              ctx.fillStyle = `rgba(${charColorR}, ${charColorG}, ${charColorB}, ${norm})`;
              ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
            }
          }

          ctx.restore();
        }
      }

      // 4. Post-Effect: Bloom Glow (screen composite)
      ctx.save();
      ctx.globalCompositeOperation = theme === 'light-sage' ? 'multiply' : 'screen';
      const bloomAlpha = theme === 'light-sage' ? 0.08 : 0.22;
      ctx.fillStyle = `rgba(${charColorR}, ${charColorG}, ${charColorB}, ${bloomAlpha})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 5. Post-Effect: Vignette (radial fade at perimeter)
      ctx.save();
      const maxDim = Math.max(width, height);
      const vignette = ctx.createRadialGradient(
        width * 0.55,
        height * 0.5,
        maxDim * 0.25,
        width * 0.55,
        height * 0.5,
        maxDim * 0.72
      );
      if (theme === 'light-sage') {
        vignette.addColorStop(0, 'rgba(230, 236, 230, 0)');
        vignette.addColorStop(0.65, 'rgba(230, 236, 230, 0.45)');
        vignette.addColorStop(1, 'rgba(230, 236, 230, 0.95)');
      } else {
        vignette.addColorStop(0, 'rgba(9, 13, 22, 0)');
        vignette.addColorStop(0.65, 'rgba(9, 13, 22, 0.45)');
        vignette.addColorStop(1, 'rgba(9, 13, 22, 0.95)');
      }
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    }

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) ro.observe(containerRef.current);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
    };
  }, [sourcePhoto, cellSize, renderMode, theme]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          mousePos.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
        }
      }}
      onMouseLeave={() => {
        mousePos.current = null;
      }}
    >
      {/* 2D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Floating Mode Switcher Pill */}
      <div className="absolute bottom-5 right-6 z-20 flex items-center gap-1.5 p-1 rounded-full bg-white/80 border border-[#c8d4c8] shadow-sm backdrop-blur-md">
        {(['characters', 'mosaic', 'dots', 'dither'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setRenderMode(m)}
            className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase font-semibold transition-all cursor-pointer ${
              renderMode === m
                ? 'bg-[#0b3320] text-white shadow-xs'
                : 'text-[#415949] hover:text-[#0b3320] hover:bg-black/5'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
