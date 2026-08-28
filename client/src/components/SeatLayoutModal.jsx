import React, { useState } from 'react';
import { X, Armchair, Users, Sparkles, MapPin, CalendarPlus } from 'lucide-react';
import SeatMap from './SeatMap';

export const SeatLayoutModal = ({
  isOpen,
  onClose,
  roomData,
  onBookRoom
}) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  if (!isOpen || !roomData) return null;

  const { room, isOccupied, currentBooking } = roomData;
  const totalOccupiedCount = (roomData?.occupiedSeats?.length || 0) + (roomData?.reservedSeats?.length || 0);
  const hasOccupiedSeats = isOccupied || roomData?.isFullRoomOccupied || totalOccupiedCount > 0;

  const handleBook = () => {
    onClose();
    if (onBookRoom) {
      onBookRoom(roomData, selectedSeats);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="krono-modal max-w-2xl w-full rounded-2xl p-6 text-slate-100 shadow-2xl relative my-6 space-y-5 border border-cyan-500/30 bg-[#001428]/95 backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono shadow-sm">
              {room.roomNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-white">
                  {room.roomNumber} — Seat Details & Layout
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-[#001833] border border-cyan-500/20 text-cyan-300">
                  {room.type?.replace('_', ' ')}
                </span>
                {isOccupied && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    In Session
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {room.building} • Total Capacity: {room.capacity} seats
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seat Map View with Multi-Selection */}
        <SeatMap
          room={room}
          isOccupied={isOccupied}
          isFullRoomOccupied={roomData?.isFullRoomOccupied || false}
          occupiedSeats={roomData?.occupiedSeats || []}
          reservedSeats={roomData?.reservedSeats || []}
          currentBooking={currentBooking}
          selectedSeats={selectedSeats}
          onSelectSeat={setSelectedSeats}
          interactive={true}
          allowMultiple={true}
        />

        {/* Footer Actions */}
        <div className="pt-4 border-t border-cyan-500/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300 text-center sm:text-left">
            {selectedSeats.length > 0 && (
              <span>
                Selected{' '}
                <strong className="text-white font-bold">{selectedSeats.length}</strong>{' '}
                {selectedSeats.length === 1 ? 'Seat' : 'Seats'}:{' '}
                <strong className="text-cyan-300 font-mono font-bold text-sm">
                  #{selectedSeats.join(', #')}
                </strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="krono-btn krono-btn-ghost text-xs"
            >
              Close
            </button>
            <button
              onClick={handleBook}
              disabled={hasOccupiedSeats && selectedSeats.length === 0}
              className={`text-xs flex items-center gap-1.5 font-bold transition-all ${
                hasOccupiedSeats && selectedSeats.length === 0
                  ? 'krono-btn krono-btn-ghost opacity-40 cursor-not-allowed'
                  : 'krono-btn krono-btn-cyan shadow-[0_0_15px_rgba(0,180,216,0.3)]'
              }`}
            >
              <CalendarPlus className="w-4 h-4" />
              <span>
                {selectedSeats.length > 0
                  ? `Book ${selectedSeats.length} ${selectedSeats.length === 1 ? 'Seat' : 'Seats'} (#${selectedSeats.join(', #')})`
                  : hasOccupiedSeats
                  ? 'Pick Green Seats to Book'
                  : 'Book Full Room'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayoutModal;
