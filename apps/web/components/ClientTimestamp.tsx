'use client';

import { useEffect, useState } from 'react';

export function ClientTimestamp({
  timestamp,
  showTimeOnly = false,
}: {
  timestamp: string;
  showTimeOnly?: boolean;
}) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    try {
      const d = new Date(timestamp);
      setFormatted(showTimeOnly ? d.toLocaleTimeString() : d.toLocaleString());
    } catch {
      setFormatted(timestamp);
    }
  }, [timestamp, showTimeOnly]);

  return (
    <span suppressHydrationWarning>
      {formatted || new Date(timestamp).toLocaleDateString()}
    </span>
  );
}
