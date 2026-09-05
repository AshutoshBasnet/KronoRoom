import React, { useMemo, useState, useEffect } from 'react';
import { Monitor, Armchair, Sparkles, Check, X, Users, AlertCircle, Clock, Hourglass } from 'lucide-react';

export const SeatMap = ({
  room,
  isOccupied = false,
  isFullRoomOccupied = false,
  occupiedSeats = [],
  reservedSeats = [],
  currentBooking = null,
  selectedSeat = null,
  selectedSeats = [],
  onSelectSeat = () => {},
  interactive = true,
  allowMultiple = true
}) => {
  const capacity = room?.capacity || 50;
  const roomType = room?.type || 'computer_lab';

  // Live real-time ticker for dynamic countdown calculation
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Ticks every second
    return () => clearInterval(timer);
  }, []);

  // Format exact time remaining until room/seats become free
  const timeRemainingInfo = useMemo(() => {
    if (!isOccupied || !currentBooking?.endTime) return null;
    const endMs = new Date(currentBooking.endTime).getTime();
    const diffMs = endMs - currentTime;

    if (diffMs <= 0) {
      return {
        formatted: 'Ending Now',
        short: 'Ending Now',
        isEnded: true
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (hours > 0) {
      formatted = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      formatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
    } else {
      formatted = `${seconds}s`;
    }

    return {
      formatted,
      short: `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`,
      isEnded: false,
      endTimeFormatted: new Date(currentBooking.endTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }, [isOccupied, currentBooking?.endTime, currentTime]);

  // Normalize selected seats into an array
  const rawSelectedSeats = useMemo(() => {
    if (Array.isArray(selectedSeats) && selectedSeats.length > 0) {
      return selectedSeats;
    }
    if (selectedSeat) {
      return [selectedSeat];
    }
    return [];
  }, [selectedSeats, selectedSeat]);

  // Generate deterministic seat grid matching room capacity
  const seatGrid = useMemo(() => {
    // 10 seats per row (5 left aisle, 5 right aisle) for clean symmetry
    const seatsPerRow = capacity <= 40 ? 8 : 10;
    const totalRows = Math.ceil(capacity / seatsPerRow);
    const rows = [];
    const rowLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

    let seatCounter = 1;
    for (let r = 0; r < totalRows; r++) {
      const rowLetter = rowLetters[r] || `R${r + 1}`;
      const seatsInThisRow = [];

      for (let s = 1; s <= seatsPerRow; s++) {
        if (seatCounter > capacity) break;
        const seatId = `${rowLetter}${s}`;

        // Accurate Granular Status determination:
        // 1. If full-room class lecture (no seat picking): all seats in session (Red)
        // 2. If seat-level booking: ONLY the exact booked seats are Red
        let isThisSeatOccupied = false;
        if (isFullRoomOccupied) {
          isThisSeatOccupied = true;
        } else if (Array.isArray(occupiedSeats) && occupiedSeats.includes(seatId)) {
          isThisSeatOccupied = true;
        } else if (
          isOccupied &&
          (currentBooking?.seatNumber === seatId ||
            (Array.isArray(currentBooking?.selectedSeats) &&
              currentBooking.selectedSeats.includes(seatId)))
        ) {
          isThisSeatOccupied = true;
        }

        // 3. Reserved check for upcoming sessions
        let isThisSeatReserved = false;
        if (!isThisSeatOccupied) {
          if (Array.isArray(reservedSeats) && reservedSeats.includes(seatId)) {
            isThisSeatReserved = true;
          }
        }

        let status = 'available';
        if (isThisSeatOccupied) {
          status = 'occupied';
        } else if (isThisSeatReserved) {
          status = 'reserved';
        }

        seatsInThisRow.push({
          id: seatId,
          number: s,
          row: rowLetter,
          status,
          occupant:
            isThisSeatOccupied
              ? `${currentBooking?.user?.name || 'In session'}${
                  currentBooking?.purpose ? ` — ${currentBooking.purpose}` : ''
                }`
              : null
        });

        seatCounter++;
      }
      rows.push({ rowLetter, seats: seatsInThisRow });
    }

    return rows;
  }, [capacity, roomType, isOccupied, isFullRoomOccupied, occupiedSeats, reservedSeats, currentBooking]);

  // Strictly filter selected seats so ONLY available (green) seats can ever be selected
  const activeSelectedSeats = useMemo(() => {
    const availableSet = new Set();
    seatGrid.forEach((r) => {
      r.seats.forEach((s) => {
        if (s.status === 'available') {
          availableSet.add(s.id);
        }
      });
    });
    return rawSelectedSeats.filter((id) => availableSet.has(id));
  }, [seatGrid, rawSelectedSeats]);

  const stats = useMemo(() => {
    let availableCount = 0;
    let occupiedCount = 0;
    let reservedCount = 0;

    seatGrid.forEach((r) => {
      r.seats.forEach((s) => {
        if (s.status === 'occupied') occupiedCount++;
        else if (s.status === 'reserved') reservedCount++;
        else availableCount++;
      });
    });

    return { availableCount, occupiedCount, reservedCount };
  }, [seatGrid]);

  const handleSeatClick = (seat) => {
    if (!interactive) return;

    // STRICT CHECK: Red (occupied) and Yellow (reserved) seats CANNOT be selected!
    if (seat.status === 'occupied' || seat.status === 'reserved') {
      return;
    }

    if (allowMultiple) {
      const isAlreadySelected = activeSelectedSeats.includes(seat.id);
      const updated = isAlreadySelected
        ? activeSelectedSeats.filter((s) => s !== seat.id)
        : [...activeSelectedSeats, seat.id];
      onSelectSeat(updated);
    } else {
      const isAlreadySelected = activeSelectedSeats.includes(seat.id);
      onSelectSeat(isAlreadySelected ? null : seat.id);
    }
  };

  const handleClearAll = () => {
    if (allowMultiple) {
      onSelectSeat([]);
    } else {
      onSelectSeat(null);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Front Screen / Stage / Podium */}
      <div className="w-full text-center space-y-1.5">
        <div className="w-4/5 mx-auto h-1 bg-slate-700 rounded-full" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] font-mono text-slate-300 shadow-sm">
          <Monitor className="w-3.5 h-3.5 text-slate-400" />
          <span>FRONT STAGE • PRESENTATION SCREEN & INSTRUCTOR PODIUM</span>
        </div>
      </div>

      {/* Dynamic Live Occupancy Notice with Real-Time Countdown */}
      {isOccupied && stats.occupiedCount > 0 && timeRemainingInfo ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  {isFullRoomOccupied ? 'Full Room Class Session' : `${stats.occupiedCount} Seats in Session`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {stats.availableCount > 0 ? `${stats.availableCount} Seats Free Now` : 'All Seats in Use'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {currentBooking?.purpose && <strong className="text-white">{currentBooking.purpose}</strong>}
                {currentBooking?.user?.name && ` • Host: ${currentBooking.user.name}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-900/40 border border-rose-500/40 text-right self-end sm:self-auto shrink-0">
            <Hourglass className="w-4 h-4 text-rose-300 animate-pulse shrink-0" />
            <div>
              <span className="block text-[9px] uppercase font-bold text-rose-300 tracking-wider">
                Occupied Seats Free In
              </span>
              <span className="font-mono font-extrabold text-sm text-white tracking-widest">
                {timeRemainingInfo.formatted}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Multi-Select Bar for Free/Interactive booking */}
      {interactive && allowMultiple && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Armchair className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {activeSelectedSeats.length > 0 ? (
                <>
                  <strong className="text-white font-bold">{activeSelectedSeats.length}</strong>{' '}
                  {activeSelectedSeats.length === 1 ? 'seat' : 'seats'} selected: [
                  <span className="text-blue-400 font-mono font-bold">
                    {activeSelectedSeats.join(', ')}
                  </span>
                  ]
                </>
              ) : (
                'Click green seats to select • Red & Yellow are unavailable'
              )}
            </span>
          </div>

          {activeSelectedSeats.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      )}

      {/* Seat Grid Layout */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-x-auto max-h-[400px] overflow-y-auto">
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
                    const isSeatOccupied = seat.status === 'occupied';
                    const isSeatReserved = seat.status === 'reserved';
                    const isSelected = !isSeatOccupied && !isSeatReserved && activeSelectedSeats.includes(seat.id);

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={!interactive || isSeatOccupied || isSeatReserved}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all relative group ${
                          isSeatOccupied
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 cursor-not-allowed opacity-90 shadow-none'
                            : isSeatReserved
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed opacity-85 shadow-none'
                            : isSelected
                            ? 'bg-blue-600 text-white border-2 border-white shadow-md scale-105 ring-2 ring-blue-500/40 z-10'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/30 hover:border-emerald-400 hover:scale-105 cursor-pointer'
                        }`}
                        title={`${seat.id} - ${
                          isSeatOccupied
                            ? `Occupied • Students Studying${
                                timeRemainingInfo ? ` (Free in ${timeRemainingInfo.formatted})` : ''
                              }${seat.occupant ? ` • ${seat.occupant}` : ''}`
                            : isSeatReserved
                            ? 'Reserved (Upcoming session)'
                            : isSelected
                            ? 'Selected (Click to unselect)'
                            : 'Free to Book (Click to select)'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span>{seat.number}</span>
                        )}

                        {/* Dynamic Hover Tooltip with Countdown */}
                        <span className="absolute -top-8 hidden group-hover:block bg-slate-900 text-white text-[9px] px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap z-20 shadow-xl pointer-events-none text-center">
                          <span className="font-bold">Seat {seat.id}</span> •{' '}
                          {isSeatOccupied ? (
                            <span className="text-rose-300 font-semibold">
                              Studying ({timeRemainingInfo ? `Free in ${timeRemainingInfo.short}` : 'In Session'})
                            </span>
                          ) : isSeatReserved ? (
                            <span className="text-amber-300 font-semibold">Reserved</span>
                          ) : isSelected ? (
                            <span className="text-blue-400 font-semibold">Selected</span>
                          ) : (
                            <span className="text-emerald-300 font-semibold">Free to Book</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Middle Aisle Gap */}
                <div className="w-4 sm:w-6 text-center text-[10px] text-slate-600 font-mono">
                  •
                </div>

                {/* Right Wing Seats */}
                <div className="flex items-center gap-1.5">
                  {rightSeats.map((seat) => {
                    const isSeatOccupied = seat.status === 'occupied';
                    const isSeatReserved = seat.status === 'reserved';
                    const isSelected = !isSeatOccupied && !isSeatReserved && activeSelectedSeats.includes(seat.id);

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={!interactive || isSeatOccupied || isSeatReserved}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all relative group ${
                          isSeatOccupied
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 cursor-not-allowed opacity-90 shadow-none'
                            : isSeatReserved
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed opacity-85 shadow-none'
                            : isSelected
                            ? 'bg-blue-600 text-white border-2 border-white shadow-md scale-105 ring-2 ring-blue-500/40 z-10'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/30 hover:border-emerald-400 hover:scale-105 cursor-pointer'
                        }`}
                        title={`${seat.id} - ${
                          isSeatOccupied
                            ? `Occupied • Students Studying${
                                timeRemainingInfo ? ` (Free in ${timeRemainingInfo.formatted})` : ''
                              }${seat.occupant ? ` • ${seat.occupant}` : ''}`
                            : isSeatReserved
                            ? 'Reserved (Upcoming session)'
                            : isSelected
                            ? 'Selected (Click to unselect)'
                            : 'Free to Book (Click to select)'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span>{seat.number}</span>
                        )}

                        {/* Dynamic Hover Tooltip with Countdown */}
                        <span className="absolute -top-8 hidden group-hover:block bg-slate-900 text-white text-[9px] px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap z-20 shadow-xl pointer-events-none text-center">
                          <span className="font-bold">Seat {seat.id}</span> •{' '}
                          {isSeatOccupied ? (
                            <span className="text-rose-300 font-semibold">
                              Studying ({timeRemainingInfo ? `Free in ${timeRemainingInfo.short}` : 'In Session'})
                            </span>
                          ) : isSeatReserved ? (
                            <span className="text-amber-300 font-semibold">Reserved</span>
                          ) : isSelected ? (
                            <span className="text-blue-400 font-semibold">Selected</span>
                          ) : (
                            <span className="text-emerald-300 font-semibold">Free to Book</span>
                          )}
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

      {/* Legend & Selected Seats Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        {/* Color Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5" title="Free to book right now">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/50 inline-block" />
            <span className="text-slate-300">Free to Book ({stats.availableCount})</span>
          </div>

          <div className="flex items-center gap-1.5" title="Reserved for upcoming slot / faculty">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/25 border border-amber-500/50 inline-block" />
            <span className="text-slate-300">Reserved ({stats.reservedCount})</span>
          </div>

          <div className="flex items-center gap-1.5" title="Students currently studying / session in progress">
            <span className="w-3.5 h-3.5 rounded bg-rose-500/25 border border-rose-500/50 inline-block" />
            <span className="text-slate-300">
              Students Studying ({stats.occupiedCount})
              {stats.occupiedCount > 0 && timeRemainingInfo && (
                <span className="text-rose-400 font-mono font-semibold ml-1">
                  • ⏳ Free in {timeRemainingInfo.short}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="Your selected seat(s)">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 border border-white inline-block" />
            <span className="text-blue-400 font-semibold">Selected ({activeSelectedSeats.length})</span>
          </div>
        </div>

        {/* Selected Seat Feedback */}
        {activeSelectedSeats.length > 0 && (
          <div className="px-3 py-1 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-300 font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <Armchair className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {activeSelectedSeats.length === 1
                ? `Seat #${activeSelectedSeats[0]}`
                : `${activeSelectedSeats.length} Seats: #${activeSelectedSeats.join(', #')}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMap;
