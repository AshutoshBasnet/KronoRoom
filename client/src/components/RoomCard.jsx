import React from 'react';
import {
  MapPin,
  Users,
  Monitor,
  Presentation,
  BookOpen,
  CalendarPlus,
  UserCheck,
  Armchair,
  Sparkles
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

  // Status-based color coding matching Stitch
  const statusColor = isOccupied
    ? { bar: 'bg-[#f43f5e]', border: 'hover:border-rose-500/40', glow: 'shadow-rose-500/10' }
    : nextBooking
    ? { bar: 'bg-[#f59e0b]', border: 'hover:border-amber-500/40', glow: 'shadow-amber-500/10' }
    : { bar: 'bg-[#10b981]', border: 'hover:border-emerald-500/40', glow: 'shadow-emerald-500/10' };

  return (
    <div
      className={`krono-card-hover rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group border border-slate-800/90 bg-slate-900/80 backdrop-blur-md shadow-sm transition-all duration-300 ${statusColor.border}`}
    >
      {/* Left Vertical Status Bar (Stitch Precision Style) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColor.bar}`} />

      <div className="pl-2">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold font-mono text-white tracking-tight group-hover:text-blue-400 transition-colors">
                {room.roomNumber}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-medium text-slate-300">
                {getTypeIcon(room.type)}
                {formatRoomType(room.type)}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {room.building}
            </p>
          </div>

          {/* Stitch JetBrains Mono Capacity Chip */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs font-mono font-semibold text-slate-300 shadow-sm shrink-0">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{room.capacity} Seats</span>
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
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {currentBooking.bookingType}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                {currentBooking.user?.name} ({currentBooking.user?.role})
              </span>
              <TimeElapsedBadge timestamp={currentBooking.createdAt} prefix="Booked" />
            </div>
          </div>
        )}

        {/* Next Upcoming Booking (if free) */}
        {!isOccupied && nextBooking && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-xs text-slate-300 flex items-center justify-between">
            <span className="truncate max-w-[170px] text-slate-300">
              Next: <strong className="text-white font-medium">{nextBooking.purpose}</strong>
            </span>
            <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
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
                className="px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300 font-medium"
              >
                {amenity}
              </span>
            ))}
        </div>
      </div>

      {/* Action Buttons (Stitch Precision) */}
      <div className="pt-3.5 border-t border-slate-800/90 grid grid-cols-2 gap-2 pl-2">
        <button
          onClick={() => onViewSeatsClick(roomData)}
          className="krono-btn krono-btn-ghost text-xs flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700/80 hover:border-blue-500/50 hover:bg-slate-800/80 text-slate-300 font-medium transition-all cursor-pointer"
          title="Inspect seat layout and availability"
        >
          <Armchair className="w-3.5 h-3.5 text-blue-400" />
          <span>Seat Detail</span>
        </button>

        <button
          onClick={() => onBookClick(roomData)}
          className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
            isOccupied
              ? 'krono-btn krono-btn-ghost text-slate-200 border-slate-700 hover:bg-slate-800/80'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
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
