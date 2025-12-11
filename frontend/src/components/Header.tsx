import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Clapperboard, Home as HomeIcon, Film, BarChart3, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { getInitials } from '../utils/helpers';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/movies', label: 'Movies', icon: Film },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg border-b border-slate-700/50">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold group">
          <div className="relative">
            <Clapperboard className="w-8 h-8 text-secondary group-hover:text-red-400 transition-colors" />
            <div className="absolute inset-0 bg-secondary/20 blur-lg group-hover:blur opacity-0 group-hover:opacity-100 transition-all" />
          </div>
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">BookMyShow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive(path)
                  ? 'bg-secondary/20 text-secondary shadow-lg shadow-secondary/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/admin')
                  ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-300" />
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-red-600 flex items-center justify-center font-bold text-xs text-white shadow-lg">
                  {getInitials(user.name)}
                </div>
                <span className="text-sm font-semibold">{user.name}</span>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-800 text-white rounded-xl shadow-2xl py-2 animate-slideUp border border-slate-700">
                  <div className="px-4 py-3 border-b border-slate-700 opacity-75 text-sm">
                    Signed in as <span className="font-semibold">{user.name}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Clapperboard className="w-4 h-4 text-secondary" />
                    <span>My Bookings</span>
                  </Link>
                  <hr className="my-2 border-slate-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-gradient-to-b from-slate-800 to-slate-900 border-t border-slate-700 animate-slideUp">
          <div className="container py-4 space-y-2">
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                  isActive(path)
                    ? 'bg-secondary/20 text-secondary font-semibold'
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                  isActive('/admin')
                    ? 'bg-blue-500/20 text-blue-400 font-semibold'
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                Admin
              </Link>
            )}

            <hr className="my-3 border-slate-700" />

            {/* Dark Mode Toggle Mobile */}
            <button
              onClick={() => {
                toggleDarkMode();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
            >
              <span>Dark Mode</span>
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-300" />
              )}
            </button>

            <hr className="my-3 border-slate-700" />

            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Clapperboard className="w-4 h-4" />
                  My Bookings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  className="block px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-center font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-4 py-2.5 rounded-lg bg-secondary hover:bg-red-600 transition-colors text-center font-semibold text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
