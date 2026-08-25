import React from 'react';
import { Search, Building, Filter, X, Users, Compass, Swords } from 'lucide-react';

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
    <div className="pixel-box p-4 space-y-4 mb-6">
      {/* Top Search & Toggle Row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Chamber # (T-301), Building, or Artifact (Mac, Projector, GPU)..."
            className="w-full bg-slate-950 border-2 border-black pl-9 pr-8 py-2 text-xs font-pixel text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
            className={`pixel-btn text-xs w-full md:w-auto ${
              onlyAvailable ? 'pixel-btn-green' : 'pixel-btn-dark'
            }`}
          >
            <span className={`w-2 h-2 ${onlyAvailable ? 'bg-black' : 'bg-slate-500'}`} />
            <span>🟢 Free Chambers Only</span>
          </button>

          {isFiltered && (
            <button
              onClick={handleReset}
              className="pixel-btn pixel-btn-rose text-xs shrink-0"
              title="Reset Filters"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Building, Type, Capacity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t-2 border-slate-800 text-xs font-pixel">
        {/* Building Wing */}
        <div>
          <label className="block text-slate-300 uppercase font-bold mb-1">
            🏰 Dungeon Wing (Building)
          </label>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full bg-slate-950 border-2 border-black px-2.5 py-1.5 text-xs font-pixel text-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
          >
            <option value="all">All Wings (Tower, LC, Science)</option>
            {buildings.map((b, i) => (
              <option key={i} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-slate-300 uppercase font-bold mb-1">
            📜 Chamber Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-950 border-2 border-black px-2.5 py-1.5 text-xs font-pixel text-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
          >
            <option value="all">All Types (Labs, Halls, Seminars)</option>
            <option value="computer_lab">🖥️ Computer Labs (Mac / GPU)</option>
            <option value="lecture_hall">🏛️ Lecture Halls (Tiered / 4K)</option>
            <option value="seminar_room">📜 Seminar Rooms (Smartboard)</option>
          </select>
        </div>

        {/* Min Capacity */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-300 uppercase font-bold">
              👥 Min Party: {minCapacity === 0 ? 'Any Size' : `${minCapacity}+ Adventurers`}
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="10"
            value={minCapacity}
            onChange={(e) => setMinCapacity(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-none appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs font-pixel text-slate-400 pt-1 border-t border-slate-800/60">
        <span>
          Showing <strong>{filteredCount}</strong> of <strong>{totalRooms}</strong> campus chambers
        </span>
        <span className="text-emerald-400">⚔️ Quest Ready</span>
      </div>
    </div>
  );
};

export default FilterBar;
