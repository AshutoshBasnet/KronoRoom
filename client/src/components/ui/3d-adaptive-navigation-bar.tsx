"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  LayoutDashboard,
  GraduationCap,
  Users,
  Calendar,
  Shield,
  LogOut,
  Plus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import socket from "../../utils/socket";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  id: string;
  path: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "KronoRoom",
    id: "kronoroom",
    path: "/",
    icon: <Clock className="w-4 h-4 text-blue-500" />,
  },
  {
    label: "Live Rooms",
    id: "live-rooms",
    path: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Student Portal",
    id: "student-portal",
    path: "/login/student",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    label: "Faculty & Staff",
    id: "faculty-staff",
    path: "/login/faculty",
    icon: <Users className="w-4 h-4" />,
  },
];

const springConfig = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

export function AdaptiveNavigationBar({ className }: { className?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, hasRole } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("kronoroom");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(socket.connected);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef<number>(0);

  // Listen for seat details / modal open events to auto-hide floating bar
  useEffect(() => {
    const handleModalToggle = (e: any) => {
      setIsModalOpen(Boolean(e.detail?.isOpen));
    };
    window.addEventListener("krono:modal-state", handleModalToggle as EventListener);
    return () => {
      window.removeEventListener("krono:modal-state", handleModalToggle as EventListener);
    };
  }, []);

  // Sync socket connection state
  useEffect(() => {
    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Smart scroll-aware hide on scroll down / reveal on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always visible when near the top of page
      if (currentScrollY < 60) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling down: hide the navbar so it never blocks scrolling text
        if (!isExpanded) {
          setIsVisible(false);
        }
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling up: reveal navbar for instant access
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isExpanded]);

  // Synchronize active tab with current URL pathname
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === "/") {
      setActiveTab("kronoroom");
    } else if (currentPath.startsWith("/dashboard")) {
      setActiveTab("live-rooms");
    } else if (currentPath.startsWith("/login/student")) {
      setActiveTab("student-portal");
    } else if (currentPath.startsWith("/login/faculty")) {
      setActiveTab("faculty-staff");
    } else if (currentPath.startsWith("/my-bookings")) {
      setActiveTab("my-bookings");
    } else if (currentPath.startsWith("/admin")) {
      setActiveTab("admin");
    } else if (currentPath.startsWith("/register")) {
      setActiveTab("student-portal");
    }
  }, [location.pathname]);

  const handleMouseEnter = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    collapseTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      setHoveredTab(null);
    }, 450);
  };

  const handleItemClick = (item: NavItem) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.header
      data-adaptive-navbar=""
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isVisible && !isModalOpen ? 0 : -100,
        opacity: isVisible && !isModalOpen ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 32,
      }}
      className={cn(
        "fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none w-full max-w-max px-4",
        isModalOpen && "!pointer-events-none !hidden",
        className
      )}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="pointer-events-auto"
      >
        <motion.nav
          layout
          transition={springConfig}
          className={cn(
            "relative flex items-center gap-2 p-1.5 rounded-full select-none transform-gpu overflow-hidden",
            "bg-slate-950/90 border border-slate-800 backdrop-blur-xl",
            "shadow-[0_8px_30px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)]",
            "transition-colors duration-200"
          )}
        >
          {/* Brand Emblem / Base View */}
          <Link
            to="/"
            onClick={() => setActiveTab("kronoroom")}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity shrink-0 z-10"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-4 h-4 text-white" />
            </div>

            <div className="flex flex-col text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-brand font-bold text-sm tracking-tight text-white whitespace-nowrap">
                  Krono<span className="text-blue-500">Room</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                  London Met
                </span>
              </div>
            </div>
          </Link>

          {/* Smooth Width & Opacity Expanding/Contracting Menu */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{
                  width: springConfig,
                  opacity: { duration: 0.2, ease: "easeInOut" },
                }}
                className="flex items-center gap-1 pl-2 border-l border-slate-800 overflow-hidden whitespace-nowrap shrink-0"
              >
                {navItems.slice(1).map((item) => {
                  const isActive = activeTab === item.id;
                  const isHovered = hoveredTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => setHoveredTab(item.id)}
                      className={cn(
                        "relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-150 flex items-center gap-1.5 shrink-0 whitespace-nowrap",
                        isActive
                          ? "text-white font-bold"
                          : "text-slate-300 hover:text-white"
                      )}
                    >
                      {/* Active Sliding Highlight Pill */}
                      {isActive && (
                        <motion.div
                          layoutId="adaptive-nav-active-pill"
                          className="absolute inset-0 rounded-full bg-blue-600 text-white -z-10 shadow-sm"
                          transition={springConfig}
                        />
                      )}

                      {/* Hover Pill Background */}
                      {!isActive && isHovered && (
                        <motion.div
                          layoutId="adaptive-nav-hover-pill"
                          className="absolute inset-0 rounded-full bg-slate-800/80 -z-10"
                          transition={springConfig}
                        />
                      )}

                      <span className="shrink-0">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Authenticated Links & Roles */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-1 pl-1 border-l border-slate-800 shrink-0">
                    <Link
                      to="/my-bookings"
                      onClick={() => setActiveTab("my-bookings")}
                      className={cn(
                        "relative px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all whitespace-nowrap",
                        activeTab === "my-bookings"
                          ? "text-white font-bold bg-blue-600"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Bookings</span>
                    </Link>

                    {hasRole("admin") && (
                      <Link
                        to="/admin"
                        onClick={() => setActiveTab("admin")}
                        className={cn(
                          "relative px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all whitespace-nowrap",
                          activeTab === "admin"
                            ? "text-rose-200 font-bold bg-rose-600/30 border border-rose-500/40"
                            : "text-slate-300 hover:text-rose-300 hover:bg-rose-500/10"
                        )}
                      >
                        <Shield className="w-3.5 h-3.5 text-rose-400" />
                        <span>Admin</span>
                      </Link>
                    )}

                    <div className="flex items-center gap-2 pl-2 border-l border-slate-800 pr-1 shrink-0">
                      <span className="text-[11px] font-medium text-slate-300 max-w-[90px] truncate hidden md:inline-block">
                        {user?.name?.split(" ")[0]}
                      </span>
                      <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Live Sync status indicator */
                  <div
                    className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 text-[10px] font-mono text-slate-300 shrink-0 whitespace-nowrap"
                    title={isSocketConnected ? "Live sync active" : "Connecting..."}
                  >
                    <span className="relative flex h-2 w-2">
                      {isSocketConnected && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          isSocketConnected ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      ></span>
                    </span>
                    <span className="hidden lg:inline-block text-slate-400">Live</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint plus when collapsed */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center pr-2 pl-0.5 text-slate-400 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </motion.header>
  );
}

export default AdaptiveNavigationBar;
