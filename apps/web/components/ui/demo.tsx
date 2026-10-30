'use client';

import React from 'react';
import { PrismaHero } from '@/components/ui/prisma-hero';

export default function DemoOne() {
  return (
    <main className="min-h-screen w-full bg-black p-4 md:p-8 flex items-center justify-center">
      <PrismaHero />
    </main>
  );
}

export { DemoOne };

