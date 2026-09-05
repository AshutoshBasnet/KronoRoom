import React, { useState, useEffect } from 'react';
import { X, Armchair, Users, MapPin, CalendarPlus } from 'lucide-react';
import SeatMap from './SeatMap';

export const SeatLayoutModal = ({
  isOpen,
  onClose,
  roomData,
  onBookRoom
}) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Auto-hide floating navbar when Seat Details is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('seat-modal-open', 'modal-open');
      document.body.setAttribute('data-modal-open', 'true');
      window.dispatchEvent(
        new CustomEvent('krono:modal-state', { detail: { isOpen: true, type: 'seat-details' } })
      );
    } else {
      document.body.classList.remove('seat-modal-open');
      if (!document.body.classList.contains('booking-modal-open')) {
        document.body.classList.remove('modal-open');
        document.body.removeAttribute('data-modal-open');
        window.dispatchEvent(
          new CustomEvent('krono:modal-state', { detail: { isOpen: false, type: 'seat-details' } })
        );
      }
    }

    return () => {
      document.body.classList.remove('seat-modal-open');
      if (!document.body.classList.contains('booking-modal-open')) {
        document.body.classList.remove('modal-open');
        document.body.removeAttribute('data-modal-open');
        window.dispatchEvent(
          new CustomEvent('krono:modal-state', { detail: { isOpen: false, type: 'seat-details' } })
        );
      }
    };
  }, [isOpen]);

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="krono-modal max-w-4xl w-full rounded-2xl p-6 sm:p-7 text-slate-100 shadow-2xl relative my-6 space-y-6 border border-slate-800 bg-slate-900/95 backdrop-blur-xl">
        {/* Header matching Stitch Institutional Precision */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono font-bold text-sm shadow-sm shrink-0 whitespace-nowrap">
              {room.roomNumber}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
                  {room.roomNumber} — Interactive Seat Selection & Tiered Layout
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  {room.type?.replace('_', ' ') || 'Lecture Hall'}
                </span>
                {isOccupied && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    In Session
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{room.building}</span>
                <span className="text-slate-600">•</span>
                <span>Capacity: {room.capacity} Workstations</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Auditorium Cinema Layout</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close Modal"
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
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300 text-center sm:text-left">
            {selectedSeats.length > 0 && (
              <span>
                Selected{' '}
                <strong className="text-white font-bold">{selectedSeats.length}</strong>{' '}
                {selectedSeats.length === 1 ? 'Seat' : 'Seats'}:{' '}
                <strong className="text-blue-400 font-mono font-bold text-sm">
                  #{selectedSeats.join(', #')}
                </strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="krono-btn krono-btn-ghost text-xs cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleBook}
              disabled={hasOccupiedSeats && selectedSeats.length === 0}
              className={`text-xs flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                hasOccupiedSeats && selectedSeats.length === 0
                  ? 'krono-btn krono-btn-ghost opacity-40 cursor-not-allowed'
                  : 'krono-btn krono-btn-primary shadow-sm'
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
