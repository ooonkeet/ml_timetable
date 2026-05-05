import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';

function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login, isAuthenticated,user,initializeAuth, isLoggingIn ,} =
    useAuthStore();

  const ROLES = ['admin', 'faculty', 'student','modifier'];

  useEffect(() => {
    initializeAuth();
    
   if (isAuthenticated) navigate('/'); // redirect if already logged in
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) return toast.error('Please select a role!');
    if (!password) return toast.error('Please enter your password!');

    const success = await login(selectedRole, password);
    // if(success && user?.role==="modifier") navigate('/input')
   if (success) navigate('/'); // navigate on successful login
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 font-sans">
      <div className="rounded-2xl shadow-2xl border border-slate-200 p-8 w-full max-w-md backdrop-blur-sm bg-white/95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600">Select your role to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Role
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all duration-200 text-slate-700"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Choose your role...</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {selectedRole && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all duration-200 text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-blue-800 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedRole || !password || isLoggingIn}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 transform ${
              !selectedRole || !password || isLoggingIn
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isLoggingIn ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-center text-sm text-slate-500">
            🔒 Secure access to your university portal
          </p>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
