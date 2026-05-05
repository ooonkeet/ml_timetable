import { Button } from '@/components/ui/button';
import { Bell, Search, Calendar, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // redirect to login after logout
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/98 backdrop-blur-md shadow-sm border-b border-slate-100">
      <div className="flex h-16 items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center shadow-sm">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-900">Schedura</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 px-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search college, faculty, stream..."
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              type="button"
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative hover:shadow-sm transition-all duration-200"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-400 rounded-full text-xs shadow-sm"></span>
            </Button>

            {/* Tooltip */}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-blue-600 bg-slate-50 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Notifications
            </span>
          </div>

          {/* Logout */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Logout"
              type="button"
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative hover:shadow-sm transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Tooltip */}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-blue-600 bg-slate-50 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Logout
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
