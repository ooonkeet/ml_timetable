import { LayoutDashboard, BookOpen, Layers, Users, FileText, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Universities", icon: BookOpen, path: "/universities" },
  { name: "Programs", icon: Layers, path: "/programs" },
  { name: "Streams", icon: Users, path: "/streams" },
  { name: "Sections", icon: FileText, path: "/sections" },
  { name: "Subjects", icon: BookOpen, path: "/subjects" },
  { name: "Class Settings", icon: Settings, path: "/class-settings" },
];

export default function Sidebar() {
  return (
    <div className="h-full bg-slate-800 shadow-lg flex flex-col">
      {/* Sidebar header */}
      <div className="p-4 text-xl font-bold flex items-center gap-2 text-white">
        <LayoutDashboard className="w-6 h-6 text-slate-300" />
        <span>Admin Panel</span>
      </div>

      {/* Sidebar nav */}
      <nav className="mt-6 px-2 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-slate-700 text-white font-medium border-l-4 border-blue-400"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-400"}`}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
