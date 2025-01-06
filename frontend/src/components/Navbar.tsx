import React from 'react';
import { isAuthenticated } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrainFront } from 'lucide-react';

export default function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logging out');
    navigate('/logout');
  };

  return (
      <nav className="bg-slate-800 text-white shadow-lg">
          <div className="container mx-auto px-4 h-16 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                  <TrainFront className="h-6 w-6" />
                  <span className="text-xl font-semibold">Rail Times UK</span>
              </div>
              <div className="flex items-center space-x-4">
                  {isAuthenticated() ? (
                      <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="text-slate-800 border-white hover:bg-white/10 hover:text-white"
                      >
                          Logout
                      </Button>
                  ) : (
                      <div className="flex items-center space-x-4">
                          <Button
                              variant="ghost"
                              onClick={() => navigate('/login')}
                              className="text-white border-bg-white/10 hover:bg-white hover:text-slate-800"
                          >
                              Login
                          </Button>
                          <Button
                              variant="ghost"
                              onClick={() => navigate('/signup')}
                              className="text-white border-bg-white/10 hover:bg-white hover:text-slate-800"
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