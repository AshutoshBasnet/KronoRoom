import React, { useMemo } from 'react';
import { Monitor, Users, Armchair, Sparkles, Check, Info } from 'lucide-react';

export const SeatMap = ({
  room,
  isOccupied = false,
  currentBooking = null,
  selectedSeat = null,
  onSelectSeat = () => {},
  interactive = true
}) => {
  const capacity = room?.capacity || 40;
  const roomType = room?.type || 'lecture_hall';

  // Generate deterministic seat grid according to capacity
  const seatGrid = useMemo(() => {
    const seatsPerRow = roomType === 'lecture_hall' ? (capacity > 60 ? 12 : 8) : 8;
    const totalRows = Math.ceil(capacity / seatsPerRow);
    const rows = [];
    const rowLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

    // Simulate realistic occupied seats if the room is partially/fully in session
    let seatCounter = 1;
    for (let r = 0; r < totalRows; r++) {
      const rowLetter = rowLetters[r] || `R${r + 1}`;
      const seatsInThisRow = [];

      for (let s = 1; s <= seatsPerRow; s++) {
        if (seatCounter > capacity) break;
        const seatId = `${rowLetter}${s}`;

        // Deterministic status simulation:
        // If room is occupied by a current ongoing booking, most seats are occupied
        let status = 'available';
        if (isOccupied) {
          // In full session, 85% occupied
          status = (s + r) % 6 === 0 ? 'available' : 'occupied';
        } else {
          // Few random reserved for faculty / accessibility
          if (r === 0 && (s === 1 || s === seatsPerRow)) {
            status = 'reserved'; // Front row reserved for accessibility/staff
          } else if ((r * 3 + s) % 11 === 0) {
            status = 'reserved';
          }
        }

        seatsInThisRow.push({
          id: seatId,
          number: s,
          row: rowLetter,
          status,
          occupant: isOccupied && status === 'occupied' ? currentBooking?.user?.name || 'Occupied' : null
        });

        seatCounter++;
      }
      rows.push({ rowLetter, seats: seatsInThisRow });
    }

    return rows;
  }, [capacity, roomType, isOccupied, currentBooking]);

  const stats = useMemo(() => {
    let availableCount = 0;
    let occupiedCount = 0;
    let reservedCount = 0;

    seatGrid.forEach((r) => {
      r.seats.forEach((s) => {
        if (s.id === selectedSeat) availableCount++;
        else if (s.status === 'available') availableCount++;
        else if (s.status === 'occupied') occupiedCount++;
        else if (s.status === 'reserved') reservedCount++;
      });
    });

    return { availableCount, occupiedCount, reservedCount };
  }, [seatGrid, selectedSeat]);

  return (
    <div className="space-y-5 select-none">
      {/* Front Screen / Stage / Podium */}
      <div className="w-full text-center space-y-2">
        <div className="w-4/5 mx-auto h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 border border-white/10 text-[11px] font-mono text-slate-400">
          <Monitor className="w-3.5 h-3.5 text-indigo-400" />
          <span>FRONT STAGE • 4K PRESENTATION PODIUM & SMARTBOARD</span>
        </div>
      </div>

      {/* Seat Grid Layout */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/80 border border-white/10 overflow-x-auto">
        <div className="min-w-[480px] space-y-3 mx-auto flex flex-col items-center">
          {seatGrid.map(({ rowLetter, seats }) => {
            const midPoint = Math.ceil(seats.length / 2);
            const leftSeats = seats.slice(0, midPoint);
            const rightSeats = seats.slice(midPoint);

            return (
              <div key={rowLetter} className="flex items-center gap-3">
                {/* Left Row Indicator */}
                <span className="w-5 text-center font-mono font-bold text-xs text-slate-500">
                  {rowLetter}
                </span>

                {/* Left Wing Seats */}
                <div className="flex items-center gap-1.5">
                  {leftSeats.map((seat) => {
                    const isSelected = selectedSeat === seat.id;
                    const isSeatOccupied = seat.status === 'occupied';
                    const isSeatReserved = seat.status === 'reserved';

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={!interactive || isSeatOccupied || isSeatReserved}
                        onClick={() => onSelectSeat(isSelected ? null : seat.id)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all relative group ${
                          isSelected
                            ? 'bg-indigo-600 text-white border border-indigo-400 shadow-lg shadow-indigo-500/50 scale-110 ring-2 ring-indigo-400 z-10'
                            : isSeatOccupied
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 cursor-not-allowed opacity-80'
                            : isSeatReserved
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed opacity-75'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 hover:border-emerald-400 hover:scale-105'
                        }`}
                        title={`${seat.id} - ${
                          isSelected
                            ? 'Selected by you'
                            : isSeatOccupied
                            ? `Occupied${seat.occupant ? ` by ${seat.occupant}` : ''}`
                            : isSeatReserved
                            ? 'Reserved for Faculty/Accessibility'
                            : 'Available (Click to Select)'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <span>{seat.number}</span>
                        )}

                        {/* Hover Tooltip */}
                        <span className="absolute -top-7 hidden group-hover:block bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded border border-white/20 whitespace-nowrap z-20 shadow-xl pointer-events-none">
                          Seat {seat.id} • {isSelected ? 'Selected' : seat.status}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Middle Aisle Gap */}
                <div className="w-4 sm:w-6 text-center text-[10px] text-slate-700 font-mono">
                  •
                </div>

                {/* Right Wing Seats */}
                <div className="flex items-center gap-1.5">
                  {rightSeats.map((seat) => {
                    const isSelected = selectedSeat === seat.id;
                    const isSeatOccupied = seat.status === 'occupied';
                    const isSeatReserved = seat.status === 'reserved';

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={!interactive || isSeatOccupied || isSeatReserved}
                        onClick={() => onSelectSeat(isSelected ? null : seat.id)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all relative group ${
                          isSelected
                            ? 'bg-indigo-600 text-white border border-indigo-400 shadow-lg shadow-indigo-500/50 scale-110 ring-2 ring-indigo-400 z-10'
                            : isSeatOccupied
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 cursor-not-allowed opacity-80'
                            : isSeatReserved
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed opacity-75'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 hover:border-emerald-400 hover:scale-105'
                        }`}
                        title={`${seat.id} - ${
                          isSelected
                            ? 'Selected by you'
                            : isSeatOccupied
                            ? `Occupied${seat.occupant ? ` by ${seat.occupant}` : ''}`
                            : isSeatReserved
                            ? 'Reserved for Faculty/Accessibility'
                            : 'Available (Click to Select)'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <span>{seat.number}</span>
                        )}

                        {/* Hover Tooltip */}
                        <span className="absolute -top-7 hidden group-hover:block bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded border border-white/20 whitespace-nowrap z-20 shadow-xl pointer-events-none">
                          Seat {seat.id} • {isSelected ? 'Selected' : seat.status}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Row Indicator */}
                <span className="w-5 text-center font-mono font-bold text-xs text-slate-500">
                  {rowLetter}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Selected Seat Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        {/* Color Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/40" />
            <span className="text-slate-300">Available ({stats.availableCount})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-indigo-600 border border-indigo-400 shadow-sm" />
            <span className="text-slate-300">Selected</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-500/40" />
            <span className="text-slate-300">Occupied ({stats.occupiedCount})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/40" />
            <span className="text-slate-300">Reserved ({stats.reservedCount})</span>
          </div>
        </div>

        {/* Selected Seat Feedback */}
        {selectedSeat && (
          <div className="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Assigned: Seat {selectedSeat}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMap;
