import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/user/userThunks";
import toast from "react-hot-toast";
import {
  Bot,
  Gauge,
  Inbox,
  LogOut,
  MessageSquareMore,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";

const Sidebar = () => {
  const { user, token } = useSelector((state) => state.user);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    superadmin: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <Gauge size={24} />,
      },
      {
        name: "Admins",
        path: "/admins",
        icon: <Bot size={24} />,
      },
      {
        name: "Chatbots",
        path: "/chatbots",
        icon: <Bot size={24} />,
      },
      {
        name: "Settings",
        path: "/superadmin-settings",
        icon: <Settings size={24} />,
      },
    ],
    admin: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <Gauge size={24} />,
      },
      {
        name: "Clients",
        path: "/clients",
        icon: <UserRound size={24} />,
      },
      {
        name: "Agents",
        path: "/agents",
        icon: <UsersRound size={24} />,
      },
      {
        name: "Inbox",
        path: "/inbox",
        icon: <MessageSquareMore size={24} />,
      },
      {
        name: "Team",
        path: "/admin-team",
        icon: <UserRound size={24} />,
      },
      {
        name: "Settings",
        path: "/admin-settings",
        icon: <Settings size={24} />,
      },
    ],
    agent: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <Gauge size={24} />,
      },
      {
        name: "Inbox",
        path: "/inbox",
        icon: <Inbox size={24} />,
      },
      {
        name: "Team",
        path: "/agent-team",
        icon: <UserRound size={24} />,
      },
      {
        name: "Settings",
        path: "/agent-settings",
        icon: <Settings size={24} />,
      },
    ],
  };

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser(token));
      if (result.payload) {
        toast.success(result.payload.message);
        navigate("/login");
      } else {
        toast.error(result.payload);
      }
    } catch (error) {
      toast.error("Error during logout: ", error);
    }
  };

  return (
    <aside className="w-64 bg-white min-h-screen flex flex-col shadow-md">
      <h1 className="text-xl font-bold my-6 text-center">
        <span className="text-blue-500 font-bold text-[20px]">Linguist</span>
        Link
      </h1>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {menuItems[user?.role]?.map((item) => (
            <li key={item.path} className="mb-2 flex">
              <div
                className={` ${
                  location.pathname === item.path
                    ? " border-l-8 border-blue-500 rounded-r-lg"
                    : ""
                }`}
              ></div>
              <Link
                to={item.path}
                className={`px-2 py-3 w-full rounded flex gap-2 font-semibold ${
                  location.pathname === item.path
                    ? "bg-blue-500 text-white mx-4"
                    : "hover:bg-blue-100 hover:text-blue-500 ml-6 mr-4"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
        </div>
        <div>
          {/* Logout Button */}
          <li className="my-2 flex">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full px-2 py-3 ml-6 mr-4 rounded flex gap-2 font-semibold hover:bg-blue-100 hover:text-blue-500 cursor-pointer"
            >
              <LogOut size={24} />
              Logout
            </button>
          </li>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Confirm Logout
            </h2>
            <p className="text-gray-600">Are you sure you want to log out?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 cursor-pointer transition duration-200"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition duration-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
