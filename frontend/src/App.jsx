import './App.css';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/layouts/Navbar';
import Sidebar from '@/layouts/Sidebar';
import useAuthStore from './store/authStore';
// Import pages
import Universities from './pages/Universities';
import Programs from './pages/programPage';
import Streams from './pages/Streams';
import Sections from './pages/Sections';
import Subjects from './pages/Subjects';
import ClassSettings from './pages/ClassSettings';
import LoginPage from './pages/loginPage';
import TimeTablePage from './pages/TimeTablePage';
import InputForm from './components/ui/InputFormForTimeTable';
import Dashboard from './pages/Dashboard';


function App() {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  // Modifier role: show timetable generator
  if (isAuthenticated && user?.role === 'modifier') {
    console.log(user.role);

    return (
      <BrowserRouter>
        <div className="max-w-6xl mx-auto my-6 p-4">
          <h1 className="mb-3">

            <Link to="/input" className="no-underline text-inherit">
              Timetable Generator
            </Link>
          </h1>
          <Routes>
            <Route path="/input" element={<InputForm />} />
            <Route path="/timetable" element={<TimeTablePage />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "12px 16px",
                position: "relative",
                overflow: "hidden",
              },
              className: "custom-toast",
            }}
          />
        </div>
      </BrowserRouter>
    );
  }

  // Other users: show dashboard

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />

        {/* Protected dashboard layout */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="h-screen w-screen flex flex-col bg-background text-foreground bg-cover bg-fixed">
                {/* Navbar */}
                <Navbar />

                {/* Main content */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Sidebar */}
                  <aside className="w-64 border-r border-sidebar-border bg-sidebar backdrop-blur-lg">
                    <Sidebar />
                  </aside>

                  {/* Right content */}
                  <div className="flex-1 flex flex-col">
                    <main className="flex-1 overflow-y-auto">
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <Dashboard />
                          }
                        />
                        <Route path="/universities" element={<Universities />} />
                        <Route path="/programs" element={<Programs />} />
                        <Route path="/streams" element={<Streams />} />
                        <Route path="/sections" element={<Sections />} />
                        <Route path="/subjects" element={<Subjects />} />
                        <Route path="/class-settings" element={<ClassSettings />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      {/* Toasts */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "12px 16px",
            position: "relative",
            overflow: "hidden",
          },
          className: "custom-toast",
        }}
      />
    </BrowserRouter>
  );
}

export default App;
