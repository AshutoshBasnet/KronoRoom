import React from 'react';
import {
  MapPin,
  Users,
  Monitor,
  Presentation,
  BookOpen,
  CalendarPlus,
  Sparkles,
  Shield,
  Swords,
  Hourglass,
  CheckCircle2
} from 'lucide-react';
import LiveOccupancyBadge from './LiveOccupancyBadge';
import TimeElapsedBadge from './TimeElapsedBadge';

export const RoomCard = ({ roomData, onBookClick }) => {
  const { room, isOccupied, currentBooking, nextBooking } = roomData;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'computer_lab':
        return '🖥️ Arcane Lab';
      case 'lecture_hall':
        return '🏛️ Grand Hall';
      default:
        return '📜 Seminar Sanctum';
    }
  };

  const getBuildingEmoji = (b) => {
    if (b.includes('Tower')) return '🏰';
    if (b.includes('Learning')) return '📚';
    return '🧪';
  };

  return (
    <div
      className={`pixel-box-hover p-4 flex flex-col justify-between relative ${
        isOccupied ? 'border-rose-600/60' : 'border-emerald-600/60'
      }`}
    >
      {/* Top RPG Header banner */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-arcade text-xs font-bold text-white bg-black px-2 py-1 border border-slate-700 shadow-[2px_2px_0px_#000]">
                {room.roomNumber}
              </span>
              <span className="font-pixel text-xs font-bold text-slate-300">
                {getTypeIcon(room.type)}
              </span>
            </div>
            <p className="text-xs font-pixel text-slate-400 mt-1 flex items-center gap-1">
              <span>{getBuildingEmoji(room.building)}</span>
              <span>{room.building}</span>
            </p>
          </div>

          {/* Party Capacity Badge */}
          <div className="bg-black px-2 py-1 border border-slate-700 text-xs font-pixel text-yellow-400 flex items-center gap-1 shadow-[2px_2px_0px_#000]">
            <Users className="w-3.5 h-3.5" />
            <span>{room.capacity} Max Party</span>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="mb-3">
          <LiveOccupancyBadge
            isOccupied={isOccupied}
            currentBooking={currentBooking}
            nextBooking={nextBooking}
          />
        </div>

        {/* Current Raid / Occupant Meta (if occupied) */}
        {isOccupied && currentBooking && (
          <div className="mb-3 p-2.5 bg-rose-950/70 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-pixel space-y-1">
            <div className="flex items-center justify-between text-rose-200">
              <span className="font-bold truncate max-w-[180px]">
                ⚔️ {currentBooking.purpose}
              </span>
              <span className="text-[10px] uppercase bg-black px-1.5 py-0.5 text-rose-400 border border-rose-900">
                {currentBooking.bookingType}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>Held by: <strong>{currentBooking.user?.name}</strong></span>
              <TimeElapsedBadge timestamp={currentBooking.createdAt} prefix="Cast" />
            </div>
          </div>
        )}

        {/* Next Scheduled Raid (if unoccupied) */}
        {!isOccupied && nextBooking && (
          <div className="mb-3 p-2 bg-slate-950 border border-slate-800 text-xs font-pixel text-slate-400 flex items-center justify-between">
            <span className="truncate max-w-[170px]">
              Next Quest: <strong className="text-slate-200">{nextBooking.purpose}</strong>
            </span>
            <span className="text-yellow-400 font-mono text-[11px]">
              {new Date(nextBooking.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {/* Chamber Artifacts / Amenities */}
        <div className="flex flex-wrap gap-1 mb-4">
          {room.amenities &&
            room.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] font-pixel px-1.5 py-0.5 bg-slate-950 text-slate-300 border border-slate-800"
              >
                ✦ {amenity}
              </span>
            ))}
          {room.amenities && room.amenities.length > 3 && (
            <span className="text-[10px] font-pixel px-1.5 py-0.5 bg-slate-950 text-slate-500">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t-2 border-slate-800">
        <button
          onClick={() => onBookClick(room)}
          className={`pixel-btn w-full ${
            isOccupied ? 'pixel-btn-dark text-slate-300' : 'pixel-btn-green'
          }`}
        >
          <CalendarPlus className="w-4 h-4" />
          <span>{isOccupied ? 'Reserve Future Slot' : 'Claim Chamber Now'}</span>
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
