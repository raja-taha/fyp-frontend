import { useSelector } from "react-redux";
import { Bell, User, Globe } from "lucide-react";
import languagesModule from "../../utils/languages";

const TopNav = () => {
  const { user } = useSelector((state) => state.user);

  // Get language name from language code
  const userLanguage = user?.language
    ? languagesModule.byCode[user.language] || user.language
    : "English";

  // Status indicator styling
  const statusColor =
    user?.status === "Active" ? "bg-green-500" : "bg-gray-400";

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-end p-4 gap-5">
        {/* User Status Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
          <div className={`h-2.5 w-2.5 rounded-full ${statusColor}`}></div>
          <span className="text-xs font-medium text-gray-700">
            {user?.status || "Not Active"}
          </span>
        </div>

        {/* User Language Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
          <Globe size={14} className="text-gray-500" />
          <span className="text-xs font-medium text-gray-700">
            {userLanguage}
          </span>
        </div>

        {/* <div className="flex items-center space-x-4">
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Bell size={20} />
          </button>
        </div> */}

        <div className="flex items-center space-x-2">
          <User size={20} className="text-gray-500" />
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">
              {user?.email || "user@example.com"}
            </span>
            <span className="text-xs text-gray-500">
              {user?.role || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
