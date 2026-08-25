import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
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
      className={`inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium ${className}`}
      title={new Date(timestamp).toLocaleString()}
    >
      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
      <span>{elapsedText}</span>
    </span>
  );
};

export default TimeElapsedBadge;
