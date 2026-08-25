import React, { useState, useEffect } from 'react';
import {
  Crown,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  RefreshCw,
  Search,
  Filter,
  Monitor,
  Sparkles,
  Swords,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';
import socket from '../utils/socket';
import TimeElapsedBadge from '../components/TimeElapsedBadge';

export const AdminDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, completed: 0, cancelled: 0, checkedIn: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Modals
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    building: 'Tower Building',
    capacity: 40,
    type: 'computer_lab',
    amenities: ''
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/bookings/all')
      ]);

      if (roomsRes.data.success) setRooms(roomsRes.data.rooms || []);
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings || []);
        setStats(bookingsRes.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleUpdate = () => fetchData();

    socket.on('booking:created', handleUpdate);
    socket.on('booking:cancelled', handleUpdate);
    socket.on('booking:checkedIn', handleUpdate);
    socket.on('booking:autoReleased', handleUpdate);
    socket.on('room:created', handleUpdate);
    socket.on('room:updated', handleUpdate);
    socket.on('room:deleted', handleUpdate);

    return () => {
      socket.off('booking:created', handleUpdate);
      socket.off('booking:cancelled', handleUpdate);
      socket.off('booking:checkedIn', handleUpdate);
      socket.off('booking:autoReleased', handleUpdate);
      socket.off('room:created', handleUpdate);
      socket.off('room:updated', handleUpdate);
      socket.off('room:deleted', handleUpdate);
    };
  }, []);

  const openCreateRoomModal = () => {
    setEditingRoom(null);
    setRoomFormData({
      roomNumber: '',
      building: 'Tower Building',
      capacity: 40,
      type: 'computer_lab',
      amenities: 'Projector, Gigabit LAN, Whiteboard'
    });
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      roomNumber: room.roomNumber,
      building: room.building,
      capacity: room.capacity,
      type: room.type,
      amenities: room.amenities?.join(', ') || ''
    });
    setIsRoomModalOpen(true);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingRoom) {
        const { data } = await api.put(`/rooms/${editingRoom._id}`, roomFormData);
        if (data.success) {
          showToast(`Chamber ${data.room.roomNumber} updated!`);
          setIsRoomModalOpen(false);
          fetchData();
        }
      } else {
        const { data } = await api.post('/rooms', roomFormData);
        if (data.success) {
          showToast(`Chamber ${data.room.roomNumber} forged!`);
          setIsRoomModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save chamber.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Deactivate Chamber ${roomNumber}? It will be hidden from new reservations.`)) {
      return;
    }

    try {
      const { data } = await api.delete(`/rooms/${roomId}`);
      if (data.success) {
        showToast(`Chamber ${roomNumber} sealed.`);
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to seal chamber.');
    }
  };

  const handleAdminCancelBooking = async (bookingId, roomNumber) => {
    if (!window.confirm(`Cast Override Cancel on Chamber ${roomNumber}?`)) {
      return;
    }

    try {
      const { data } = await api.patch(`/bookings/${bookingId}/cancel`);
      if (data.success) {
        showToast(`Reservation cancelled via Dungeon Master override.`);
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase().trim();
      const matchUser = b.user?.name?.toLowerCase().includes(q) || b.user?.email?.toLowerCase().includes(q);
      const matchRoom = b.room?.roomNumber?.toLowerCase().includes(q);
      const matchPurpose = b.purpose?.toLowerCase().includes(q);
      if (!matchUser && !matchRoom && !matchPurpose) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3 bg-black border-2 border-rose-500 text-rose-300 shadow-[4px_4px_0px_#000] flex items-center gap-2 text-xs font-pixel animate-bounce">
          <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-pixel font-bold text-white tracking-wide">
              👑 DUNGEON MASTER CONSOLE
            </h1>
            <span className="bg-rose-600 text-white px-2 py-0.5 text-[10px] font-arcade border border-black shadow-[2px_2px_0px_#000]">
              ADMIN LEVEL
            </span>
          </div>
          <p className="text-xs font-pixel text-slate-400 mt-0.5">
            Forge chambers, monitor campus utilization, and exercise schedule override spells.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="pixel-btn pixel-btn-dark text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={openCreateRoomModal}
            className="pixel-btn pixel-btn-green text-xs"
          >
            <Plus className="w-4 h-4" /> Forge Chamber
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-pixel">
        <div className="pixel-box p-3">
          <span className="text-xs text-slate-400 font-bold uppercase">Total Bookings</span>
          <p className="font-arcade text-xl text-white mt-1">{stats.total || 0}</p>
        </div>
        <div className="pixel-box-green p-3">
          <span className="text-xs text-emerald-300 font-bold uppercase">Confirmed</span>
          <p className="font-arcade text-xl text-emerald-300 mt-1">{stats.confirmed || 0}</p>
        </div>
        <div className="pixel-box-blue p-3">
          <span className="text-xs text-blue-300 font-bold uppercase">Checked In</span>
          <p className="font-arcade text-xl text-blue-300 mt-1">{stats.checkedIn || 0}</p>
        </div>
        <div className="pixel-box-red p-3">
          <span className="text-xs text-rose-300 font-bold uppercase">Cancelled</span>
          <p className="font-arcade text-xl text-rose-300 mt-1">{stats.cancelled || 0}</p>
        </div>
        <div className="pixel-box p-3">
          <span className="text-xs text-yellow-400 font-bold uppercase">Check-In Rate</span>
          <p className="font-arcade text-xl text-yellow-300 mt-1">
            {stats.total > 0 ? `${Math.round((stats.checkedIn / stats.total) * 100)}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Chamber Inventory Management */}
      <div className="pixel-box p-5 space-y-4 font-pixel">
        <div className="flex items-center justify-between pb-2 border-b-2 border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-400" />
            CHAMBER INVENTORY ({rooms.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((r) => (
            <div
              key={r._id}
              className="p-3 bg-slate-950 border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_#000]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-arcade text-xs text-white bg-black px-1.5 py-0.5 border border-slate-700">
                    {r.roomNumber}
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">
                    {r.type?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {r.building} • {r.capacity} Max Party
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditRoomModal(r)}
                  className="pixel-btn pixel-btn-dark p-1.5 text-xs"
                  title="Edit Chamber"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteRoom(r._id, r.roomNumber)}
                  className="pixel-btn pixel-btn-rose p-1.5 text-xs"
                  title="Seal Chamber"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Realm Bookings Registry */}
      <div className="pixel-box p-5 space-y-4 font-pixel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b-2 border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            ALL REALM BOOKING RECORDS ({filteredBookings.length})
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search user, chamber..."
                className="bg-slate-950 border-2 border-black pl-8 pr-3 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border-2 border-black px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-pixel">
            <thead>
              <tr className="border-b-2 border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950">
                <th className="p-2.5">Chamber</th>
                <th className="p-2.5">Adventurer / Guild</th>
                <th className="p-2.5">Schedule</th>
                <th className="p-2.5">Quest Purpose</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Check-In</th>
                <th className="p-2.5 text-right">Spell Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-white/[0.02]">
                  <td className="p-2.5 font-arcade text-xs text-white">
                    {b.room?.roomNumber || '—'}
                    <span className="block font-pixel text-[10px] text-slate-500">
                      {b.room?.building}
                    </span>
                  </td>

                  <td className="p-2.5">
                    <span className="font-bold text-white">{b.user?.name}</span>
                    <span className="block text-[10px] text-slate-400">
                      {b.user?.idCardNumber} • {b.user?.role}
                    </span>
                  </td>

                  <td className="p-2.5 font-mono text-[11px]">
                    {format(new Date(b.startTime), 'dd MMM yyyy')}
                    <span className="block text-slate-400">
                      {format(new Date(b.startTime), 'HH:mm')} – {format(new Date(b.endTime), 'HH:mm')}
                    </span>
                  </td>

                  <td className="p-2.5 max-w-[200px]">
                    <span className="font-bold text-slate-200 block truncate">{b.purpose}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{b.bookingType}</span>
                  </td>

                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] uppercase font-bold ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : b.status === 'cancelled'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="p-2.5">
                    {b.checkedIn ? (
                      <span className="text-emerald-400 font-bold">✓ Yes</span>
                    ) : (
                      <span className="text-yellow-400">Pending</span>
                    )}
                  </td>

                  <td className="p-2.5 text-right">
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleAdminCancelBooking(b._id, b.room?.roomNumber)}
                        className="pixel-btn pixel-btn-rose text-[10px] py-1 px-2"
                      >
                        Override Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Chamber Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="pixel-dialog max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-800">
              <h3 className="font-pixel text-base font-bold text-white">
                {editingRoom ? `EDIT CHAMBER ${editingRoom.roomNumber}` : 'FORGE NEW CHAMBER'}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="pixel-btn pixel-btn-dark p-1 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} className="space-y-3 font-pixel text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">
                  Chamber Number (e.g. T-301)
                </label>
                <input
                  type="text"
                  value={roomFormData.roomNumber}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, roomNumber: e.target.value })
                  }
                  className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-white uppercase font-mono shadow-[2px_2px_0px_#000]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Dungeon Wing (Building)</label>
                <input
                  type="text"
                  value={roomFormData.building}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, building: e.target.value })
                  }
                  placeholder="Tower Building, Learning Centre, Science Centre"
                  className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-white shadow-[2px_2px_0px_#000]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">
                    Max Party (Capacity)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={roomFormData.capacity}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-white font-mono shadow-[2px_2px_0px_#000]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Chamber Type</label>
                  <select
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                    className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-white shadow-[2px_2px_0px_#000]"
                  >
                    <option value="computer_lab">Computer Lab</option>
                    <option value="lecture_hall">Lecture Hall</option>
                    <option value="seminar_room">Seminar Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">
                  Chamber Artifacts (Comma separated)
                </label>
                <textarea
                  rows="2"
                  value={roomFormData.amenities}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, amenities: e.target.value })
                  }
                  placeholder="Dual 4K Laser Projectors, Surround Audio, LAN"
                  className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-white shadow-[2px_2px_0px_#000]"
                ></textarea>
              </div>

              <div className="pt-3 border-t-2 border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="pixel-btn pixel-btn-dark text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="pixel-btn pixel-btn-green text-xs"
                >
                  {isSubmitting ? 'Forging...' : editingRoom ? 'Save Chamber' : 'Forge Chamber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
