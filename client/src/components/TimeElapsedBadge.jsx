import React, { useState, useEffect } from 'react';
import { Clock, Hourglass } from 'lucide-react';
import { formatDistanceToNow, isValid } from 'date-fns';

export const TimeElapsedBadge = ({ timestamp, prefix = 'Created', className = '' }) => {
  const [elapsedText, setElapsedText] = useState('');

  useEffect(() => {
    const updateTime = () => {
      if (!timestamp) return;
      const date = new Date(timestamp);
      if (isValid(date)) {
        setElapsedText(`${prefix} ${formatDistanceToNow(date, { addSuffix: true })}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [timestamp, prefix]);

  if (!timestamp || !elapsedText) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-pixel text-xs text-yellow-300 bg-black/60 px-2 py-0.5 border border-slate-700 ${className}`}
      title={new Date(timestamp).toLocaleString()}
    >
      <Hourglass className="w-3 h-3 text-yellow-400 shrink-0" />
      <span>{elapsedText}</span>
    </span>
  );
};

export default TimeElapsedBadge;
