import React from 'react';
import { Search, Building, Filter, X, Users, CheckCircle2 } from 'lucide-react';

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

  const categories = [
    { id: 'all', label: 'All Facilities' },
    { id: 'computer_lab', label: 'Computer Labs' },
    { id: 'lecture_hall', label: 'Lecture Halls' },
    { id: 'seminar_room', label: 'Seminar Rooms' }
  ];

  return (
    <div className="krono-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-sm space-y-4 mb-6">
      {/* Search & Category Pills Row */}
      <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
        {/* Search Bar with Tag */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms, buildings, or amenities..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills (Stitch-style) */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedType(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                selectedType === cat.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Building, Availability & Capacity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
        {/* Building Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Building className="w-3 h-3 text-slate-400" /> Campus Building
          </label>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Blocks (Skill, London, Kumari)</option>
            {buildings.map((b, i) => (
              <option key={i} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Toggle Button */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-slate-400" /> Live Availability
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/25 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                title="Reset Filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Min Capacity Slider with Scale */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
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
          <div className="flex justify-between font-mono text-[10px] text-slate-500 mt-1">
            <span>0</span>
            <span>50+</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <span>
          Showing <strong className="text-slate-200">{filteredCount}</strong> of{' '}
          <strong className="text-slate-200">{totalRooms}</strong> campus facilities
        </span>
        <span className="text-emerald-400 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
          Live readings of rooms
        </span>
      </div>
    </div>
  );
};

export default FilterBar;
