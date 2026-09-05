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
    icon: <Clock className="w-4 h-4 text-cyan-400" />,
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

  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef<number>(0);

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
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isVisible ? 0 : -95,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 32,
      }}
      className={cn(
        "fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none w-full max-w-max px-4",
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
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 24, 51, 0.92) 0%, rgba(0, 8, 20, 0.97) 100%)",
            willChange: "transform, width",
          }}
          className={cn(
            "relative flex items-center gap-1.5 p-1.5 rounded-full select-none transform-gpu overflow-hidden",
            "border border-cyan-500/30 backdrop-blur-2xl",
            "shadow-[0_12px_40px_-5px_rgba(0,8,20,0.85),0_0_20px_rgba(0,245,255,0.18),inset_0_1px_0_rgba(255,255,255,0.15)]",
            "transition-colors duration-200"
          )}
        >
          {/* Brand Emblem / Base View */}
          <Link
            to="/"
            onClick={() => setActiveTab("kronoroom")}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity shrink-0 z-10"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00b4d8] via-[#0077b6] to-cyan-400 p-[1px] shadow-[0_0_12px_rgba(0,245,255,0.35)] flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#000814] rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            <div className="flex flex-col text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-brand font-bold text-sm tracking-tight text-white whitespace-nowrap">
                  Krono<span className="text-cyan-400">Room</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
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
                className="flex items-center gap-1 pl-2 border-l border-cyan-500/20 overflow-hidden whitespace-nowrap shrink-0"
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
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/25 to-[#0077b6]/35 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,245,255,0.25)] -z-10"
                          transition={springConfig}
                        />
                      )}

                      {/* Hover Pill Background */}
                      {!isActive && isHovered && (
                        <motion.div
                          layoutId="adaptive-nav-hover-pill"
                          className="absolute inset-0 rounded-full bg-cyan-500/10 border border-cyan-400/20 -z-10"
                          transition={springConfig}
                        />
                      )}

                      <span className="shrink-0">{item.icon}</span>
                      <span className={isActive ? "text-cyan-300" : ""}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}

                {/* Authenticated Links & Roles */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-1 pl-1 border-l border-cyan-500/20 shrink-0">
                    <Link
                      to="/my-bookings"
                      onClick={() => setActiveTab("my-bookings")}
                      className={cn(
                        "relative px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all whitespace-nowrap",
                        activeTab === "my-bookings"
                          ? "text-cyan-300 font-bold bg-cyan-500/20 border border-cyan-400/30"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
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
                            ? "text-rose-300 font-bold bg-rose-500/20 border border-rose-400/30"
                            : "text-slate-300 hover:text-rose-300 hover:bg-rose-500/10"
                        )}
                      >
                        <Shield className="w-3.5 h-3.5 text-rose-400" />
                        <span>Admin</span>
                      </Link>
                    )}

                    <div className="flex items-center gap-2 pl-2 border-l border-cyan-500/20 pr-1 shrink-0">
                      <span className="text-[11px] font-bold text-white max-w-[90px] truncate hidden md:inline-block">
                        {user?.name?.split(" ")[0]}
                      </span>
                      <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Live Sync status indicator */
                  <div
                    className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 text-[10px] font-mono text-cyan-300/80 shrink-0 whitespace-nowrap"
                    title={isSocketConnected ? "Live sync active" : "Connecting..."}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      {isSocketConnected && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                          isSocketConnected ? "bg-cyan-400" : "bg-amber-500"
                        }`}
                      ></span>
                    </span>
                    <span className="hidden lg:inline-block">Live</span>
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
                className="flex items-center pr-2 pl-0.5 text-cyan-400/80 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </motion.header>
  );
}

export default AdaptiveNavigationBar;
