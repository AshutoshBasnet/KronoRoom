import React from 'react';
import { ShieldAlert, ShieldCheck, Clock } from 'lucide-react';

export const LiveOccupancyBadge = ({ isOccupied, currentBooking, nextBooking }) => {
  if (isOccupied && currentBooking) {
    const formattedEndTime = new Date(currentBooking.endTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-950 border-2 border-black shadow-[2px_2px_0px_#f43f5e] text-rose-300 text-xs font-pixel font-bold">
          <span className="w-2 h-2 bg-rose-500 pixel-blink" />
          <span>OCCUPIED UNTIL {formattedEndTime}</span>
        </div>
      </div>
    );
  }

  if (nextBooking) {
    const formattedNextStart = new Date(nextBooking.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950 border-2 border-black shadow-[2px_2px_0px_#22c55e] text-emerald-300 text-xs font-pixel font-bold">
        <span className="w-2 h-2 bg-emerald-400 pixel-blink" />
        <span>AVAILABLE (FREE UNTIL {formattedNextStart})</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950 border-2 border-black shadow-[2px_2px_0px_#22c55e] text-emerald-300 text-xs font-pixel font-bold">
      <span className="w-2 h-2 bg-emerald-400" />
      <span>AVAILABLE NOW</span>
    </div>
  );
};

export default LiveOccupancyBadge;
