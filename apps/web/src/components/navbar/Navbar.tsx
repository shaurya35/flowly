"use client";
import { useState } from 'react';
import { Workflow, LogIn, UserPlus, User, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
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
        {/* Login Button */}
        <button className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors flex items-center space-x-1">
          <LogIn className="w-3 h-3" />
          <span>Login</span>
        </button>

        {/* Signup Button */}
        <button className="px-3 py-1.5 text-xs bg-violet-600 text-white hover:bg-violet-700 rounded transition-colors flex items-center space-x-1">
          <UserPlus className="w-3 h-3" />
          <span>Sign Up</span>
        </button>

        {/* Profile Picture (Dummy) */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <User className="w-3 h-3 text-gray-600" />
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
              <a href="#" className="flex items-center space-x-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                <LogOut className="w-3 h-3" />
                <span>Sign out</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
