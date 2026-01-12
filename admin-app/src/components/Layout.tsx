import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Layout = () => {
  const { logout, websiteId } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/guests", label: "Guests", icon: "👥" },
    { path: "/rsvps", label: "RSVPs", icon: "✉️" },
    { path: "/wishes", label: "Wishes", icon: "💝" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">RSVP Admin</h1>
          <p className="text-sm text-gray-500 mt-1 truncate">
            Event: {websiteId?.slice(0, 8)}...
          </p>
        </div>

        <nav className="mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                  isActive ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : ""
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};
