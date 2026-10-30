'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface VignetteBloomProps {
  sourcePhoto?: string;
  cellSize?: number;
  initialRenderMode?: 'mosaic' | 'characters' | 'dots' | 'matrix' | 'cross';
  className?: string;
}

const DEFAULT_CONFIG = {
  renderMode: 'mosaic' as const,
  bgMode: 'solid' as const,
  bgBlur: 12,
  bgOpacity: 90,
  cellSize: 16,
  coverage: 100,
  invert: false,
  brightness: 12,
  contrast: 115,
  saturation: 100,
  charSet: '@%#*+=-:. ',
  pfx: {
    vignette: { enabled: true, intensity: 38 },
    bloom: { enabled: true, intensity: 25 },
  },
  animated: true,
  animStyle: 'wave' as const,
  animSpeed: 100,
  animIntensity: 60,
};

export default function VignetteBloomCanvas({
  sourcePhoto = '/ascii-editor/demos/generated/ref-008.webp',
  cellSize = 16,
  initialRenderMode = 'mosaic',
  className = '',
}: VignetteBloomProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [renderMode, setRenderMode] = useState<'mosaic' | 'characters' | 'dots' | 'matrix' | 'cross'>(initialRenderMode);
  const [isHovered, setIsHovered] = useState(false);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();

    // Offscreen canvas for base raster source
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

    // Try loading source photo with fallback procedural artwork
    let imgLoaded = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourcePhoto;
    img.onload = () => {
      imgLoaded = true;
    };
    img.onerror = () => {
      imgLoaded = false; // Graceful procedural fallback
    };

    // Procedural security vault / cyber lock canvas generator
    function drawProceduralSource(targetCtx: CanvasRenderingContext2D, width: number, height: number, time: number) {
      targetCtx.fillStyle = '#090d16';
      targetCtx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      // Outer security rings
      const rings = [0.95, 0.75, 0.55, 0.35];
      rings.forEach((scale, i) => {
        targetCtx.beginPath();
        targetCtx.arc(cx, cy, radius * scale, 0, Math.PI * 2);
        targetCtx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(99, 102, 241, 0.45)';
        targetCtx.lineWidth = 3;
        targetCtx.stroke();
      });

      // Rotating radar sweep & node spokes
      const spokeCount = 12;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2 + time * 0.0008;
        const x2 = cx + Math.cos(angle) * radius;
        const y2 = cy + Math.sin(angle) * radius;

        targetCtx.beginPath();
        targetCtx.moveTo(cx, cy);
        targetCtx.lineTo(x2, y2);
        targetCtx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        targetCtx.lineWidth = 1.5;
        targetCtx.stroke();

        // Nodes on ring
        targetCtx.beginPath();
        targetCtx.arc(x2, y2, 4.5, 0, Math.PI * 2);
        targetCtx.fillStyle = '#38bdf8';
        targetCtx.fill();
      }

      // Central Shield Icon
      targetCtx.save();
      targetCtx.translate(cx, cy);
      targetCtx.beginPath();
      targetCtx.moveTo(0, -radius * 0.35);
      targetCtx.lineTo(radius * 0.28, -radius * 0.15);
      targetCtx.lineTo(radius * 0.22, radius * 0.22);
      targetCtx.lineTo(0, radius * 0.35);
      targetCtx.lineTo(-radius * 0.22, radius * 0.22);
      targetCtx.lineTo(-radius * 0.28, -radius * 0.15);
      targetCtx.closePath();
      targetCtx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      targetCtx.fill();
      targetCtx.strokeStyle = '#38bdf8';
      targetCtx.lineWidth = 3;
      targetCtx.stroke();

      // Checkmark in shield
      targetCtx.beginPath();
      targetCtx.moveTo(-radius * 0.1, 0);
      targetCtx.lineTo(-radius * 0.02, radius * 0.09);
      targetCtx.lineTo(radius * 0.12, -radius * 0.08);
      targetCtx.strokeStyle = '#10b981';
      targetCtx.lineWidth = 4;
      targetCtx.lineCap = 'round';
      targetCtx.lineJoin = 'round';
      targetCtx.stroke();
      targetCtx.restore();

      // Ambient glowing cyber dust particles
      for (let p = 0; p < 35; p++) {
        const px = (Math.sin(p * 99 + time * 0.0006) * 0.5 + 0.5) * width;
        const py = (Math.cos(p * 33 + time * 0.0005) * 0.5 + 0.5) * height;
        targetCtx.beginPath();
        targetCtx.arc(px, py, 2.5, 0, Math.PI * 2);
        targetCtx.fillStyle = p % 2 === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(16, 185, 129, 0.6)';
        targetCtx.fill();
      }
    }

    // Main render loop
    function render(currentTime: number) {
      if (!canvas || !ctx || !offCtx) return;
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      const time = currentTime - startTime;

      // 1. Prepare offscreen source
      offscreen.width = width;
      offscreen.height = height;

      if (imgLoaded && img.complete && img.naturalWidth > 0) {
        offCtx.drawImage(img, 0, 0, width, height);
      } else {
        drawProceduralSource(offCtx, width, height, time);
      }

      // Read pixel data from offscreen
      let imgData: ImageData;
      try {
        imgData = offCtx.getImageData(0, 0, width, height);
      } catch {
        return;
      }
      const pixels = imgData.data;

      // 2. Background setup per bgMode
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // 3. Grid sampling & Rasterization
      const effectiveCellSize = cellSize;
      const cols = Math.floor(width / effectiveCellSize);
      const rows = Math.floor(height / effectiveCellSize);
      const chars = DEFAULT_CONFIG.charSet;

      // Contrast multiplier
      const contrastFactor = DEFAULT_CONFIG.contrast / 100;
      const brightnessOffset = DEFAULT_CONFIG.brightness * 2.55;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * effectiveCellSize;
          const y = r * effectiveCellSize;
          const centerX = Math.floor(x + effectiveCellSize / 2);
          const centerY = Math.floor(y + effectiveCellSize / 2);

          const pixelIndex = (centerY * width + centerX) * 4;
          let red = pixels[pixelIndex] || 0;
          let green = pixels[pixelIndex + 1] || 0;
          let blue = pixels[pixelIndex + 2] || 0;

          // Luminance calculation
          let lum = 0.299 * red + 0.587 * green + 0.114 * blue;

          // Color adjustment: Contrast & Brightness
          lum = (lum - 128) * contrastFactor + 128 + brightnessOffset;
          lum = Math.max(0, Math.min(255, lum));

          // Normalized luminance [0, 1]
          let norm = lum / 255;

          // Wave animation wave displacement
          const wavePhase = (c * 0.18 + r * 0.18) - (time * 0.003 * (DEFAULT_CONFIG.animSpeed / 100));
          const wave = Math.sin(wavePhase) * (DEFAULT_CONFIG.animIntensity / 100) * 0.35;
          norm = Math.max(0, Math.min(1, norm + wave));

          // Interactive mouse proximity boost
          if (mousePos.current) {
            const dx = centerX - mousePos.current.x;
            const dy = centerY - mousePos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const boost = (1 - dist / 120) * 0.4;
              norm = Math.min(1, norm + boost);
            }
          }

          if (norm < 0.05) continue; // Skip near-black cells

          ctx.save();

          // Render shape per renderMode
          if (renderMode === 'mosaic') {
            const size = (effectiveCellSize - 1.5) * Math.max(0.2, norm);
            const radius = Math.min(size / 2, 3);
            const drawX = centerX - size / 2;
            const drawY = centerY - size / 2;

            ctx.fillStyle = `rgba(${Math.round(red * 0.8 + 56 * 0.2)}, ${Math.round(green * 0.8 + 189 * 0.2)}, ${Math.round(blue * 0.8 + 248 * 0.2)}, ${Math.max(0.3, norm)})`;

            // Draw rounded mosaic block
            ctx.beginPath();
            ctx.roundRect(drawX, drawY, size, size, radius);
            ctx.fill();
          } else if (renderMode === 'characters') {
            const charIdx = Math.floor((1 - norm) * (chars.length - 1));
            const char = chars[charIdx] || '.';
            const fontSize = Math.round(effectiveCellSize * 0.95);

            ctx.font = `bold ${fontSize}px var(--font-mono, monospace)`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.25, norm)})`;
            ctx.fillText(char, centerX, centerY);
          } else if (renderMode === 'dots') {
            const dotRadius = (effectiveCellSize / 2 - 1.5) * norm;
            ctx.beginPath();
            ctx.arc(centerX, centerY, Math.max(1, dotRadius), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${Math.max(0.3, norm)})`;
            ctx.fill();
          } else if (renderMode === 'matrix') {
            const chars = '0123456789ABCDEF!@#$%&*';
            const char = chars[(r + c + Math.floor(time * 0.01)) % chars.length];
            const fontSize = Math.round(effectiveCellSize * 0.9);

            ctx.font = `600 ${fontSize}px var(--font-mono, monospace)`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = norm > 0.7 ? '#86efac' : '#22c55e';
            ctx.fillText(char, centerX, centerY);
          } else if (renderMode === 'cross') {
            const arm = (effectiveCellSize / 2 - 1) * norm;
            ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0.3, norm)})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(centerX - arm, centerY);
            ctx.lineTo(centerX + arm, centerY);
            ctx.moveTo(centerX, centerY - arm);
            ctx.lineTo(centerX, centerY + arm);
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // 4. Post-Effect: Bloom (glow layer overlay)
      if (DEFAULT_CONFIG.pfx.bloom.enabled) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // 5. Post-Effect: Vignette (radial gradient darkening outer perimeter)
      if (DEFAULT_CONFIG.pfx.vignette.enabled) {
        ctx.save();
        const maxDim = Math.max(width, height);
        const vignette = ctx.createRadialGradient(
          width / 2,
          height / 2,
          maxDim * 0.25,
          width / 2,
          height / 2,
          maxDim * 0.7
        );
        const intensity = DEFAULT_CONFIG.pfx.vignette.intensity / 100;
        vignette.addColorStop(0, 'rgba(15, 23, 42, 0)');
        vignette.addColorStop(0.65, `rgba(15, 23, 42, ${intensity * 0.45})`);
        vignette.addColorStop(1, `rgba(15, 23, 42, ${intensity * 0.95})`);

        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    // Auto-resize canvas to match container width & height
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [sourcePhoto, cellSize, renderMode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[440px] sm:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-2xl flex flex-col justify-between ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mousePos.current = null;
      }}
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          mousePos.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
        }
      }}
    >
      {/* Canvas2D Viewport */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Floating Badge */}
      <div className="relative z-10 p-5 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-xs text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono font-medium tracking-tight">Vignette Bloom · Live Inspection Raster</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/70 border border-slate-800 px-3 py-1 rounded-full backdrop-blur-md">
          <span>Wave: 60Hz</span>
          <span>·</span>
          <span>Bloom: 25%</span>
          <span>·</span>
          <span>Cell: {cellSize}px</span>
        </div>
      </div>

      {/* Bottom Interactive Mode Controls */}
      <div className="relative z-10 p-5 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent pt-8">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md text-xs">
          {(['mosaic', 'characters', 'dots', 'matrix', 'cross'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setRenderMode(mode)}
              className={`px-3 py-1.5 rounded font-mono font-medium uppercase text-[11px] transition-all cursor-pointer ${
                renderMode === mode
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono hidden md:inline-block">
          Hover or move cursor to interact with security wave
        </span>
      </div>
    </div>
  );
}

