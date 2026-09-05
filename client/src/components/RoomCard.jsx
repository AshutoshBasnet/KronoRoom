import React from 'react';
import {
  MapPin,
  Users,
  Monitor,
  Presentation,
  BookOpen,
  CalendarPlus,
  UserCheck,
  Armchair
} from 'lucide-react';
import LiveOccupancyBadge from './LiveOccupancyBadge';
import TimeElapsedBadge from './TimeElapsedBadge';

export const RoomCard = ({ roomData, onBookClick, onViewSeatsClick }) => {
  const { room, isOccupied, currentBooking, nextBooking } = roomData;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'computer_lab':
        return <Monitor className="w-3.5 h-3.5 text-blue-400" />;
      case 'lecture_hall':
        return <Presentation className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const formatRoomType = (type) => {
    switch (type) {
      case 'computer_lab':
        return 'Computer Lab';
      case 'lecture_hall':
        return 'Lecture Hall';
      case 'seminar_room':
        return 'Seminar Room';
      default:
        return type;
    }
  };

  return (
    <div className="krono-card-hover rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group border border-slate-800/80 bg-slate-900/70 shadow-sm">
      {/* Top Status Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isOccupied
            ? 'bg-rose-500'
            : 'bg-emerald-500'
        }`}
      />

      <div>
        {/* Header Section */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-mono text-white tracking-tight group-hover:text-blue-400 transition-colors">
                {room.roomNumber}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                {getTypeIcon(room.type)}
                {formatRoomType(room.type)}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {room.building}
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-sm">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{room.capacity} seats</span>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="mb-3.5">
          <LiveOccupancyBadge
            isOccupied={isOccupied}
            currentBooking={currentBooking}
            nextBooking={nextBooking}
          />
        </div>

        {/* Current Occupant Details (if occupied) */}
        {isOccupied && currentBooking && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-200">
              <span className="font-semibold text-rose-200 truncate max-w-[180px]">
                {currentBooking.purpose}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                {currentBooking.bookingType}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-400" />
                {currentBooking.user?.name} ({currentBooking.user?.role})
              </span>
              <TimeElapsedBadge timestamp={currentBooking.createdAt} prefix="Booked" />
            </div>
          </div>
        )}

        {/* Next Upcoming Booking (if free) */}
        {!isOccupied && nextBooking && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-xs text-slate-300 flex items-center justify-between">
            <span className="truncate max-w-[170px]">
              Next: <strong className="text-slate-200">{nextBooking.purpose}</strong>
            </span>
            <span className="font-mono text-blue-400">
              {new Date(nextBooking.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {/* Amenities Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {room.amenities &&
            room.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/70 text-[11px] text-slate-300 font-medium"
              >
                {amenity}
              </span>
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
        <button
          onClick={() => onViewSeatsClick(roomData)}
          className="krono-btn krono-btn-ghost text-xs flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 hover:bg-slate-800/70 transition-all cursor-pointer"
          title="Inspect seat layout and availability"
        >
          <Armchair className="w-3.5 h-3.5 text-slate-400" />
          <span>Seat Detail</span>
        </button>

        <button
          onClick={() => onBookClick(roomData)}
          className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isOccupied
              ? 'krono-btn krono-btn-ghost text-slate-200 border-slate-700'
              : 'krono-btn krono-btn-primary text-white shadow-sm'
          }`}
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>{isOccupied ? 'Reserve Slot' : 'Book Room'}</span>
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
