import React from 'react';
import { isAuthenticated } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrainFront, Menu } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logging out');
    navigate('/logout');
  };

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex justify-between items-center">
        {/* Logo and Brand Name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <TrainFront className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-lg sm:text-xl font-semibold whitespace-nowrap">
            Rail Times UK
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated() ? (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-white bg-transparent hover:bg-white/10 hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
            >
              Logout
            </Button>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-white bg-transparent hover:bg-white/10 hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
              >
                Login
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/signup')}
                className="text-white bg-transparent hover:bg-white/10 hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden flex items-center">
          {isAuthenticated() ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-white/10 px-2 py-1.5 text-sm"
            >
              Logout
            </Button>
          ) : (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-white hover:bg-white/10 px-2 py-1.5 text-sm"
              >
                Login
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/signup')}
                className="text-white hover:bg-white/10 px-2 py-1.5 text-sm"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
