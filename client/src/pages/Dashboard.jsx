import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  RefreshCw,
  Building,
  Radio,
  Layers,
  Armchair
} from 'lucide-react';
import api from '../utils/api';
import socket from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import FilterBar from '../components/FilterBar';
import BookingModal from '../components/BookingModal';
import SeatLayoutModal from '../components/SeatLayoutModal';

export const Dashboard = () => {
  const { user } = useAuth();

  const [liveRoomsData, setLiveRoomsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [toastMessage, setToastMessage] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [minCapacity, setMinCapacity] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modal State
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [initialSeatForBooking, setInitialSeatForBooking] = useState(null);
  const [selectedRoomForSeatMap, setSelectedRoomForSeatMap] = useState(null);

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
      fetchLiveStatus(`⚡ New booking made for Room ${data.roomNumber}! Grid updated live.`);
    };

    const handleBookingCancelled = (data) => {
      fetchLiveStatus(`Room ${data.roomNumber || ''} booking was cancelled and is now available.`);
    };

    const handleBookingCheckedIn = (data) => {
      fetchLiveStatus(`User checked in to Room ${data.roomNumber || ''}. Occupancy confirmed.`);
    };

    const handleAutoReleased = (data) => {
      fetchLiveStatus(`⏰ Auto-Release: Room ${data.roomNumber} reclaimed after 15m check-in timeout!`);
    };

    const handleRoomModified = () => {
      fetchLiveStatus('Campus facility database updated.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-900/90 backdrop-blur-xl border border-indigo-400/40 text-white shadow-2xl flex items-center gap-3 animate-bounce">
          <Radio className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
              KronoRoom Live Matrix
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Synced
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time classroom & laboratory occupancy across London Met campus with interactive cinema-style seat maps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-mono">
            Synced: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={() => fetchLiveStatus('Data refreshed manually.')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="krono-card p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Facilities</span>
            <Building className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{totalRooms}</p>
          <p className="text-[10px] text-slate-500 mt-1">3 Campus Buildings</p>
        </div>

        <div className="krono-card p-4 rounded-2xl border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>Available Now</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{availableRooms}</p>
          <p className="text-[10px] text-emerald-400/70 mt-1">Ready for walk-in or booking</p>
        </div>

        <div className="krono-card p-4 rounded-2xl border-rose-500/20">
          <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
            <span>In Session</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400">{occupiedRooms}</p>
          <p className="text-[10px] text-rose-400/70 mt-1">Active lectures & labs</p>
        </div>

        <div className="krono-card p-4 rounded-2xl border-purple-500/20">
          <div className="flex items-center justify-between text-purple-400 text-xs mb-1">
            <span>Total Seat Capacity</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300">{totalCapacity}</p>
          <p className="text-[10px] text-purple-400/70 mt-1">Simultaneous capacity</p>
        </div>
      </div>

      {/* Filter Controls */}
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
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Aggregating live room statuses...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="krono-card rounded-2xl p-12 text-center my-6 space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white font-heading">No matching rooms found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria or resetting filters to see available facilities.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedBuilding('all');
              setSelectedType('all');
              setMinCapacity(0);
              setOnlyAvailable(false);
            }}
            className="krono-btn krono-btn-primary text-xs mt-2"
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
              onViewSeatsClick={(data) => setSelectedRoomForSeatMap(data)}
              onBookClick={(room) => {
                if (!user) {
                  window.location.href = '/login/student';
                } else {
                  setInitialSeatForBooking(null);
                  setSelectedRoomForBooking(room);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Cinema Seat Layout Modal */}
      <SeatLayoutModal
        isOpen={!!selectedRoomForSeatMap}
        onClose={() => setSelectedRoomForSeatMap(null)}
        roomData={selectedRoomForSeatMap}
        onBookRoom={(room, selectedSeat) => {
          if (!user) {
            window.location.href = '/login/student';
          } else {
            setInitialSeatForBooking(selectedSeat);
            setSelectedRoomForBooking(room);
          }
        }}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={!!selectedRoomForBooking}
        onClose={() => {
          setSelectedRoomForBooking(null);
          setInitialSeatForBooking(null);
        }}
        room={selectedRoomForBooking}
        initialSeat={initialSeatForBooking}
        onBookingSuccess={() => {
          fetchLiveStatus('Booking submitted and confirmed!');
        }}
      />
    </div>
  );
};

export default Dashboard;
