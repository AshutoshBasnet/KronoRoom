import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  LogOut,
  Menu,
  X,
  Sparkles,
  Swords,
  Scroll,
  Crown,
  Gamepad2,
  Compass,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import socket from '../utils/socket';

export const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleHeroBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 text-[11px] font-pixel uppercase font-bold bg-rose-600 text-white border border-black shadow-[2px_2px_0px_#000]">
            👑 Dungeon Master
          </span>
        );
      case 'teacher':
        return (
          <span className="px-2 py-0.5 text-[11px] font-pixel uppercase font-bold bg-purple-600 text-white border border-black shadow-[2px_2px_0px_#000]">
            🔮 Archmage Faculty
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-pixel uppercase font-bold bg-emerald-600 text-black border border-black shadow-[2px_2px_0px_#000]">
            🛡️ Scholar Knight (Student)
          </span>
        );
    }
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-black bg-slate-950/95 backdrop-blur-md shadow-[0_4px_0_0_#000]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* RPG Brand / Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-emerald-500 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-black group-hover:bg-emerald-400 group-hover:translate-y-[-1px] transition-all">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-pixel text-lg font-bold text-white tracking-wider">
                    LONDON MET RPG
                  </span>
                  <span className="text-[10px] font-arcade px-1.5 py-0.5 bg-yellow-400 text-black border border-black shadow-[1px_1px_0px_#000]">
                    2D
                  </span>
                </div>
                <p className="text-[11px] font-pixel text-emerald-400 -mt-1">
                  Classroom & Lab Quest
                </p>
              </div>
            </Link>

            {/* Live Socket indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 ml-3 px-2.5 py-1 bg-black border-2 border-slate-800 text-[10px] font-pixel font-bold uppercase shadow-[2px_2px_0px_#000]"
              title={isSocketConnected ? 'Live Quest Server Connected' : 'Connecting to Quest Realm...'}
            >
              <span
                className={`w-2 h-2 rounded-none border border-black ${
                  isSocketConnected ? 'bg-emerald-400 pixel-blink' : 'bg-amber-500'
                }`}
              />
              <span className={isSocketConnected ? 'text-emerald-400' : 'text-amber-400'}>
                {isSocketConnected ? 'ONLINE' : 'SYNCING'}
              </span>
            </div>
          </div>

          {/* Desktop RPG Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`pixel-btn text-xs ${
                isActivePath('/dashboard')
                  ? 'pixel-btn-green'
                  : 'pixel-btn-dark hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              Chamber Matrix
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`pixel-btn text-xs ${
                  isActivePath('/my-bookings')
                    ? 'pixel-btn-indigo'
                    : 'pixel-btn-dark hover:text-white'
                }`}
              >
                <Scroll className="w-4 h-4" />
                Quest Log
              </Link>
            )}

            {hasRole('admin') && (
              <Link
                to="/admin"
                className={`pixel-btn text-xs ${
                  isActivePath('/admin')
                    ? 'pixel-btn-rose'
                    : 'pixel-btn-dark hover:text-rose-300'
                }`}
              >
                <Crown className="w-4 h-4" />
                Master Console
              </Link>
            )}
          </nav>

          {/* Player Profile & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l-2 border-slate-800">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-pixel text-sm font-bold text-white max-w-[150px] truncate">
                      {user.name}
                    </span>
                  </div>
                  <div className="mt-0.5">{getRoleHeroBadge(user.role)}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="pixel-btn pixel-btn-rose text-xs p-2"
                  title="Abandon Quest (Sign Out)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login/student"
                  className="pixel-btn pixel-btn-green text-xs"
                >
                  Student Hero
                </Link>
                <Link
                  to="/login/faculty"
                  className="pixel-btn pixel-btn-purple text-xs"
                >
                  Faculty Mage
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="pixel-btn pixel-btn-dark p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile RPG Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-slate-950 p-4 space-y-3">
          {isAuthenticated && (
            <div className="pixel-box p-3 space-y-1">
              <p className="font-pixel text-sm font-bold text-white">{user.name}</p>
              <p className="font-mono text-[10px] text-slate-400">{user.idCardNumber} • {user.department}</p>
              <div className="pt-1">{getRoleHeroBadge(user.role)}</div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="pixel-btn pixel-btn-green w-full"
            >
              <Compass className="w-4 h-4" /> Chamber Matrix (Dashboard)
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pixel-btn pixel-btn-indigo w-full"
              >
                <Scroll className="w-4 h-4" /> Quest Log (My Bookings)
              </Link>
            )}

            {hasRole('admin') && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pixel-btn pixel-btn-rose w-full"
              >
                <Crown className="w-4 h-4" /> Master Console (Admin)
              </Link>
            )}
          </div>

          <div className="pt-2 border-t-2 border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="pixel-btn pixel-btn-rose w-full"
              >
                <LogOut className="w-4 h-4" /> Exit Realm (Sign Out)
              </button>
            ) : (
              <>
                <Link
                  to="/login/student"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="pixel-btn pixel-btn-green w-full text-center"
                >
                  Student Hero Login
                </Link>
                <Link
                  to="/login/faculty"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="pixel-btn pixel-btn-purple w-full text-center"
                >
                  Faculty Archmage Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="pixel-btn pixel-btn-dark w-full text-center text-xs"
                >
                  Character Creation (Register)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
