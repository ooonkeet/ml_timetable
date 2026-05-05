import { create } from "zustand";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoggingIn: false,

   
  login: async (role, password) => {
    set({ isLoggingIn: true });
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/auth/login`,
        { role, password }
      );

      if (response.data.success) {
        const token = response.data.data;
        localStorage.setItem("token", token);

        set({
          user: { role },
          isAuthenticated: true,
        });

        toast.success("Login successful!");
        return true;  
      } else {
        toast.error(response.data.message || "Login failed.");
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
    toast.success("Logged out successfully");
  },

  initializeAuth: () => {
    const token = localStorage.getItem("token");
    if (token) set({ isAuthenticated: true });
  },
}));

export default useAuthStore;
