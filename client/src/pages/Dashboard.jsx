import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  RefreshCw,
  Building,
  Radio,
  Swords,
  Compass,
  Map
} from 'lucide-react';
import api from '../utils/api';
import socket from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import FilterBar from '../components/FilterBar';
import BookingModal from '../components/BookingModal';

export const Dashboard = () => {
  const { user } = useAuth();

  const [liveRoomsData, setLiveRoomsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [toastMessage, setToastMessage] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'minimap'

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [minCapacity, setMinCapacity] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modal State
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);

  // Fetch Live Status Function
  const fetchLiveStatus = useCallback(async (showToast = null) => {
    try {
      const { data } = await api.get('/rooms/live-status');
      if (data.success) {
        setLiveRoomsData(data.data || []);
        setLastUpdated(new Date());
        if (showToast) {
          showNotification(showToast);
        }
      }
    } catch (error) {
      console.error('Error fetching live room status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    fetchLiveStatus();

    const handleBookingCreated = (data) => {
      fetchLiveStatus(`⚔️ Chamber ${data.roomNumber} claimed! Grid updated live.`);
    };

    const handleBookingCancelled = (data) => {
      fetchLiveStatus(`Chamber ${data.roomNumber || ''} freed up.`);
    };

    const handleBookingCheckedIn = (data) => {
      fetchLiveStatus(`Party checked in to Chamber ${data.roomNumber || ''}.`);
    };

    const handleAutoReleased = (data) => {
      fetchLiveStatus(`⏰ Auto-Release: Chamber ${data.roomNumber} reclaimed after 15m timeout!`);
    };

    const handleRoomModified = () => {
      fetchLiveStatus('Campus chamber database updated.');
    };

    socket.on('booking:created', handleBookingCreated);
    socket.on('booking:cancelled', handleBookingCancelled);
    socket.on('booking:checkedIn', handleBookingCheckedIn);
    socket.on('booking:autoReleased', handleAutoReleased);
    socket.on('room:created', handleRoomModified);
    socket.on('room:updated', handleRoomModified);
    socket.on('room:deleted', handleRoomModified);

    return () => {
      socket.off('booking:created', handleBookingCreated);
      socket.off('booking:cancelled', handleBookingCancelled);
      socket.off('booking:checkedIn', handleBookingCheckedIn);
      socket.off('booking:autoReleased', handleAutoReleased);
      socket.off('room:created', handleRoomModified);
      socket.off('room:updated', handleRoomModified);
      socket.off('room:deleted', handleRoomModified);
    };
  }, [fetchLiveStatus]);

  const buildings = Array.from(
    new Set(liveRoomsData.map((item) => item.room?.building).filter(Boolean))
  );

  const filteredRooms = liveRoomsData.filter((item) => {
    const { room, isOccupied } = item;
    if (!room) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchNumber = room.roomNumber?.toLowerCase().includes(q);
      const matchBuilding = room.building?.toLowerCase().includes(q);
      const matchAmenities = room.amenities?.some((a) => a.toLowerCase().includes(q));
      if (!matchNumber && !matchBuilding && !matchAmenities) return false;
    }

    if (selectedBuilding !== 'all' && room.building !== selectedBuilding) return false;
    if (selectedType !== 'all' && room.type !== selectedType) return false;
    if (minCapacity > 0 && room.capacity < minCapacity) return false;
    if (onlyAvailable && isOccupied) return false;

    return true;
  });

  const totalRooms = liveRoomsData.length;
  const occupiedRooms = liveRoomsData.filter((r) => r.isOccupied).length;
  const availableRooms = totalRooms - occupiedRooms;
  const totalCapacity = liveRoomsData.reduce((acc, r) => acc + (r.room?.capacity || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* 8-bit Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3 bg-black border-2 border-emerald-500 text-emerald-300 shadow-[4px_4px_0px_#000] flex items-center gap-2 text-xs font-pixel animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-pixel font-bold text-white tracking-wide">
              CAMPUS CHAMBER MATRIX
            </h1>
            <span className="bg-emerald-500 text-black px-2 py-0.5 text-[10px] font-arcade border border-black shadow-[2px_2px_0px_#000]">
              LIVE SYNCED
            </span>
          </div>
          <p className="text-xs font-pixel text-slate-400 mt-0.5">
            Real-time classroom & laboratory occupancy across London Met facilities.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'minimap' : 'grid')}
            className="pixel-btn pixel-btn-dark text-xs"
          >
            <Map className="w-4 h-4 text-yellow-400" />
            <span>{viewMode === 'grid' ? '2D Campus Map' : 'Chamber Grid'}</span>
          </button>

          <button
            onClick={() => fetchLiveStatus('Matrix refreshed.')}
            className="pixel-btn pixel-btn-dark text-xs p-2.5"
            title="Refresh Matrix"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8-bit RPG Metric Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="pixel-box p-3.5 space-y-1">
          <span className="font-pixel text-xs text-slate-400 uppercase font-bold">Total Chambers</span>
          <p className="font-arcade text-xl text-white">{totalRooms}</p>
        </div>
        <div className="pixel-box-green p-3.5 space-y-1">
          <span className="font-pixel text-xs text-emerald-300 uppercase font-bold">🟢 Available Now</span>
          <p className="font-arcade text-xl text-emerald-300">{availableRooms}</p>
        </div>
        <div className="pixel-box-red p-3.5 space-y-1">
          <span className="font-pixel text-xs text-rose-300 uppercase font-bold">🔴 In Battle / Session</span>
          <p className="font-arcade text-xl text-rose-300">{occupiedRooms}</p>
        </div>
        <div className="pixel-box p-3.5 space-y-1">
          <span className="font-pixel text-xs text-yellow-400 uppercase font-bold">👥 Party Capacity</span>
          <p className="font-arcade text-xl text-yellow-300">{totalCapacity}</p>
        </div>
      </div>

      {/* 2D Mini-Map View (Interactive RPG Wing Map) */}
      {viewMode === 'minimap' && (
        <div className="pixel-box p-5 space-y-4 border-yellow-500/50">
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-800">
            <h3 className="font-pixel text-base font-bold text-yellow-400 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              2D CAMPUS REALM OVERVIEW MAP
            </h3>
            <span className="text-[10px] font-arcade text-slate-400">SELECT A WING</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tower Building Wing */}
            <div className="p-4 bg-slate-950 border-2 border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-pixel text-sm font-bold text-white">🏰 Tower Building</h4>
                <span className="text-[10px] font-pixel text-slate-400">Wing 1</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {liveRoomsData
                  .filter((r) => r.room?.building === 'Tower Building')
                  .map((item) => (
                    <button
                      key={item.room?._id}
                      onClick={() => setSelectedRoomForBooking(item.room)}
                      className={`w-full p-2 border-2 border-black text-left flex items-center justify-between text-xs font-pixel ${
                        item.isOccupied
                          ? 'bg-rose-950/80 text-rose-200 border-rose-900'
                          : 'bg-emerald-950/80 text-emerald-200 border-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      <span className="font-bold font-arcade text-[10px]">{item.room?.roomNumber}</span>
                      <span>{item.isOccupied ? '🔴 OCCUPIED' : '🟢 FREE'}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Learning Centre Wing */}
            <div className="p-4 bg-slate-950 border-2 border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-pixel text-sm font-bold text-white">📚 Learning Sanctum</h4>
                <span className="text-[10px] font-pixel text-slate-400">Wing 2</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {liveRoomsData
                  .filter((r) => r.room?.building === 'Learning Centre')
                  .map((item) => (
                    <button
                      key={item.room?._id}
                      onClick={() => setSelectedRoomForBooking(item.room)}
                      className={`w-full p-2 border-2 border-black text-left flex items-center justify-between text-xs font-pixel ${
                        item.isOccupied
                          ? 'bg-rose-950/80 text-rose-200 border-rose-900'
                          : 'bg-emerald-950/80 text-emerald-200 border-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      <span className="font-bold font-arcade text-[10px]">{item.room?.roomNumber}</span>
                      <span>{item.isOccupied ? '🔴 OCCUPIED' : '🟢 FREE'}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Science Centre Wing */}
            <div className="p-4 bg-slate-950 border-2 border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-pixel text-sm font-bold text-white">🧪 Science Guild</h4>
                <span className="text-[10px] font-pixel text-slate-400">Wing 3</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {liveRoomsData
                  .filter((r) => r.room?.building === 'Science Centre')
                  .map((item) => (
                    <button
                      key={item.room?._id}
                      onClick={() => setSelectedRoomForBooking(item.room)}
                      className={`w-full p-2 border-2 border-black text-left flex items-center justify-between text-xs font-pixel ${
                        item.isOccupied
                          ? 'bg-rose-950/80 text-rose-200 border-rose-900'
                          : 'bg-emerald-950/80 text-emerald-200 border-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      <span className="font-bold font-arcade text-[10px]">{item.room?.roomNumber}</span>
                      <span>{item.isOccupied ? '🔴 OCCUPIED' : '🟢 FREE'}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        minCapacity={minCapacity}
        setMinCapacity={setMinCapacity}
        onlyAvailable={onlyAvailable}
        setOnlyAvailable={setOnlyAvailable}
        buildings={buildings}
        totalRooms={totalRooms}
        filteredCount={filteredRooms.length}
      />

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 animate-spin border border-black"></div>
          <p className="font-pixel text-xs text-slate-400">Summoning chamber matrix...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="pixel-box p-12 text-center my-6 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-pixel text-lg font-bold text-white">No Chambers Discovered</h3>
          <p className="font-pixel text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to find available rooms.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedBuilding('all');
              setSelectedType('all');
              setMinCapacity(0);
              setOnlyAvailable(false);
            }}
            className="pixel-btn pixel-btn-green text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((roomData) => (
            <RoomCard
              key={roomData.room?._id || Math.random()}
              roomData={roomData}
              onBookClick={(room) => {
                if (!user) {
                  window.location.href = '/login/student';
                } else {
                  setSelectedRoomForBooking(room);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={!!selectedRoomForBooking}
        onClose={() => setSelectedRoomForBooking(null)}
        room={selectedRoomForBooking}
        onBookingSuccess={() => {
          fetchLiveStatus('Chamber claimed successfully!');
        }}
      />
    </div>
  );
};

export default Dashboard;
