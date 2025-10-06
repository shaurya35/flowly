"use client";
import { useState } from 'react';
import { Workflow, LogIn, UserPlus, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContexts';
import { useProfile } from '@/contexts/ProfileContexts';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
  const { token, login, signup, logout, loading: authLoading } = useAuth();
  const { user, loading: profileLoading } = useProfile();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const result = await login(email, password);
    if (result.success) {
      setShowAuthModal(null);
    } else {
      alert(result.error);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    
    const result = await signup(email, password, name);
    if (result.success) {
      setShowAuthModal(null);
    } else {
      alert(result.error);
    }
  };

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <nav className="bg-white border-b border-violet-200 px-3 py-2 flex items-center justify-between h-12">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
            <Workflow className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">Flowly</span>
        </div>
        <div className="text-xs text-gray-500">Loading...</div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white border-b border-violet-200 px-3 py-2 flex items-center justify-between h-12">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
            <Workflow className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">Flowly</span>
        </div>

        {/* Right side - Auth buttons and Profile */}
        <div className="flex items-center space-x-2">
          {!user ? (
            <>
              {/* Login Button */}
              <button 
                onClick={() => setShowAuthModal('login')}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors flex items-center space-x-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Login</span>
              </button>

              {/* Signup Button */}
              <button 
                onClick={() => setShowAuthModal('signup')}
                className="px-3 py-1.5 text-xs bg-violet-600 text-white hover:bg-violet-700 rounded transition-colors flex items-center space-x-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>Sign Up</span>
              </button>
            </>
          ) : (
            <>
              {/* User Info */}
              <span className="text-xs text-gray-600">{user.name || user.email}</span>
              
              {/* Profile Picture */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center hover:bg-violet-200 transition-colors"
                >
                  <User className="w-3 h-3 text-violet-600" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
                    <a href="#" className="flex items-center space-x-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                      <User className="w-3 h-3" />
                      <span>Profile</span>
                    </a>
                    <a href="#" className="flex items-center space-x-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                      <Settings className="w-3 h-3" />
                      <span>Settings</span>
                    </a>
                    <hr className="my-1" />
                    <button 
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Auth Modals */}
      {showAuthModal === 'login' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 text-white py-2 px-4 rounded hover:bg-violet-700 transition-colors"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAuthModal === 'signup' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Sign Up</h2>
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 text-white py-2 px-4 rounded hover:bg-violet-700 transition-colors"
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
