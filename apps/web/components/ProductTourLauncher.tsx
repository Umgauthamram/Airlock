'use client';

import React, { useState } from 'react';
import { ProductTourModal } from './ProductTourModal';

export function ProductTourLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        title="Open Interactive Product Walkthrough"
      >
        <span>🧭</span>
        <span className="hidden sm:inline">Product Tour</span>
      </button>

      <ProductTourModal forceOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
