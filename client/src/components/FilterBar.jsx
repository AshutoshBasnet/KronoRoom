import React from 'react';
import { Search, Building, Filter, X, Users } from 'lucide-react';

export const FilterBar = ({
  search,
  setSearch,
  selectedBuilding,
  setSelectedBuilding,
  selectedType,
  setSelectedType,
  minCapacity,
  setMinCapacity,
  onlyAvailable,
  setOnlyAvailable,
  buildings = [],
  totalRooms = 0,
  filteredCount = 0
}) => {
  const isFiltered =
    search ||
    selectedBuilding !== 'all' ||
    selectedType !== 'all' ||
    minCapacity > 0 ||
    onlyAvailable;

  const handleReset = () => {
    setSearch('');
    setSelectedBuilding('all');
    setSelectedType('all');
    setMinCapacity(0);
    setOnlyAvailable(false);
  };

  return (
    <div className="krono-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-sm space-y-4 mb-6">
      {/* Top Search & Toggle Row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Room # (e.g. T-301), Building, or Amenity (e.g. Mac, Projector)..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Availability Filter & Reset */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              onlyAvailable
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                onlyAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>Available Only</span>
          </button>

          {isFiltered && (
            <button
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/25 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Reset Filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Building, Type, Capacity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
        {/* Building Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" /> Building
          </label>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          >
            <option value="all">All Blocks (Skill, London, Kumari)</option>
            {buildings.map((b, i) => (
              <option key={i} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Room Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          >
            <option value="all">All Types (Labs, Lecture Halls, Seminars)</option>
            <option value="computer_lab">Computer Labs (Lab-01, Lab-02)</option>
            <option value="seminar_room">Seminar Rooms (LT-01, LT-02)</option>
            <option value="lecture_hall">Lecture Halls (Hall-01)</option>
          </select>
        </div>

        {/* Min Capacity */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" /> Min Capacity: {minCapacity === 0 ? 'Any' : `${minCapacity}+ seats`}
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={minCapacity}
            onChange={(e) => setMinCapacity(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>
          Showing <strong className="text-slate-200">{filteredCount}</strong> of{' '}
          <strong className="text-slate-200">{totalRooms}</strong> campus facilities
        </span>
        <span className="text-emerald-400 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Schedule Matrix
        </span>
      </div>
    </div>
  );
};

export default FilterBar;
