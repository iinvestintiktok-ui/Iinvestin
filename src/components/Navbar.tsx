import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Plus, User } from 'lucide-react';
import AuthModal from './AuthModal';
import { useAppUi } from '../context/AppUiContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const location = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { openInvestModal } = useAppUi();
  const { showToast } = useToast();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/how-it-works', label: 'How it works' },
  ];

  const handleLogout = async () => {
    await logout();
    showToast('Logout successfully');
  };

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="group">
                <span className="font-display font-bold text-xl text-white tracking-tight">
                  KWAÏ<span className="text-indigo-400">.bet</span>
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-white bg-white/5'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                data-tour="new-investment"
                onClick={() => {
                  if (user) {
                    openInvestModal();
                    return;
                  }
                  setAuthOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span className="hidden sm:inline">New investment</span>
                <span className="sm:hidden">Invest</span>
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/me"
                    className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg bg-[#131316] text-sm font-medium text-gray-200 hover:text-white hover:bg-[#1a1a1f] transition-colors"
                  >
                    {user.nickname}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Sign out"
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#131316] text-gray-300 hover:text-white hover:bg-[#1a1a1f] transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  aria-label="Sign in"
                  disabled={isLoading}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#131316] text-gray-300 hover:text-white hover:bg-[#1a1a1f] transition-colors duration-200 disabled:opacity-60"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="h-16 shrink-0" aria-hidden="true" />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
