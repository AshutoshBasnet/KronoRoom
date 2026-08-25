import React, { useState } from 'react';
import { X, Armchair, Users, Sparkles, MapPin, CalendarPlus } from 'lucide-react';
import SeatMap from './SeatMap';

export const SeatLayoutModal = ({
  isOpen,
  onClose,
  roomData,
  onBookRoom
}) => {
  const [selectedSeat, setSelectedSeat] = useState(null);

  if (!isOpen || !roomData) return null;

  const { room, isOccupied, currentBooking } = roomData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="krono-modal max-w-2xl w-full rounded-2xl p-6 text-slate-100 shadow-2xl relative my-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono">
              {room.roomNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-white">
                  {room.roomNumber} — Seat & Workstation Map
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-white/5 border border-white/10 text-slate-300">
                  {room.type?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {room.building} • Total Capacity: {room.capacity} seats
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seat Map View */}
        <SeatMap
          room={room}
          isOccupied={isOccupied}
          currentBooking={currentBooking}
          selectedSeat={selectedSeat}
          onSelectSeat={setSelectedSeat}
          interactive={true}
        />

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {selectedSeat ? (
              <span>
                Selected Seat: <strong className="text-indigo-400 font-mono font-bold text-sm">#{selectedSeat}</strong>
              </span>
            ) : (
              <span>Click on any green chair to pick your preferred seat.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="krono-btn krono-btn-ghost text-xs"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (onBookRoom) onBookRoom(room, selectedSeat);
              }}
              className="krono-btn krono-btn-primary text-xs flex items-center gap-1.5"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>{selectedSeat ? `Book with Seat #${selectedSeat}` : 'Reserve Slot'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayoutModal;
