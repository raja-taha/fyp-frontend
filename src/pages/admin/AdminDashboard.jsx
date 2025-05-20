import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChatbotByAdmin,
  fetchChatbotScript,
  createChatbot,
  updateChatbot,
} from "../../redux/chatbot/chatbotThunks";
import { clearMessages } from "../../redux/chatbot/chatbotSlice";
import {
  fetchAdminDashboardStats,
  fetchAdminClientData,
} from "../../redux/dashboard/dashboardThunks";
import { setSelectedPeriod } from "../../redux/dashboard/dashboardSlice";
import {
  UserRound,
  Users,
  BarChart,
  Copy,
  Check,
  MessageCircle,
  Plus,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [chatbotName, setChatbotName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    chatbot,
    script,
    loading: chatbotLoading,
    error: chatbotError,
    successMessage,
  } = useSelector((state) => state.chatbot);
  const {
    adminTotalAgents,
    adminTotalClients,
    adminClientGraphData,
    selectedPeriod,
    adminStatus,
    adminClientDataStatus,
    error,
  } = useSelector((state) => state.dashboard);

  const [copied, setCopied] = useState(false);

  // Calculate max Y value for graph
  const maxValue = adminClientGraphData.length
    ? Math.max(...adminClientGraphData.map((item) => item.value), 1)
    : 0;
  const yAxisMax = Math.max(10, Math.ceil(maxValue / 10) * 10);

  // Generate ticks array with dynamic increments based on the max value
  const yAxisTicks = [];
  let increment = 2; // Default increment for 0-10 range

  // Adjust increment based on max value
  if (yAxisMax > 10 && yAxisMax <= 20) {
    increment = 4; // 0,4,8,12,16,20 for 0-20 range
  } else if (yAxisMax > 20 && yAxisMax <= 50) {
    increment = 10; // 0,10,20,30,40,50 for 0-50 range
  } else if (yAxisMax > 50) {
    increment = 20; // Larger increments for higher ranges
  }

  // Generate ticks with the appropriate increment
  for (let i = 0; i <= yAxisMax; i += increment) {
    yAxisTicks.push(i);
  }

  // Make sure the max value is included in the ticks
  if (!yAxisTicks.includes(yAxisMax)) {
    yAxisTicks.push(yAxisMax);
  }

  useEffect(() => {
    // Fetch dashboard stats
    dispatch(fetchAdminDashboardStats());
    dispatch(fetchAdminClientData(selectedPeriod));

    // Fetch chatbot data
    dispatch(fetchChatbotByAdmin());
    dispatch(fetchChatbotScript());
  }, [dispatch, selectedPeriod]);

  // Show success or error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessages());
    }
    if (chatbotError) {
      toast.error(chatbotError);
      dispatch(clearMessages());
    }
  }, [successMessage, chatbotError, dispatch]);

  // Mark initial load as complete when data is loaded
  useEffect(() => {
    if (adminStatus === "succeeded" && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [adminStatus, initialLoadComplete]);

  const handlePeriodChange = (period) => {
    dispatch(setSelectedPeriod(period));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreateChatbot = async (e) => {
    e.preventDefault();
    if (!chatbotName.trim()) {
      toast.error("Chatbot name is required");
      return;
    }

    setIsSubmitting(true);
    await dispatch(createChatbot({ chatbotName, description }));
    setIsSubmitting(false);
    setShowCreateModal(false);
    setChatbotName("");
    setDescription("");

    // Refresh chatbot data
    dispatch(fetchChatbotByAdmin());
    dispatch(fetchChatbotScript());
  };

  const handleEditChatbot = async (e) => {
    e.preventDefault();

    // Only proceed if at least one field has changed
    if (
      chatbotName.trim() === chatbot.name &&
      description === chatbot.description
    ) {
      toast.error("Please change at least one field to update");
      return;
    }

    setIsSubmitting(true);

    const updateData = {};
    if (chatbotName.trim() !== chatbot.name)
      updateData.chatbotName = chatbotName.trim();
    if (description !== chatbot.description)
      updateData.description = description;

    await dispatch(
      updateChatbot({
        chatbotId: chatbot._id,
        ...updateData,
      })
    );

    setIsSubmitting(false);
    setShowEditModal(false);

    // Refresh chatbot data
    dispatch(fetchChatbotByAdmin());
    dispatch(fetchChatbotScript());
  };

  const openEditModal = () => {
    if (chatbot) {
      setChatbotName(chatbot.name || "");
      setDescription(chatbot.description || "");
      setShowEditModal(true);
    }
  };

  // Only show the loading spinner for initial page load
  if (!initialLoadComplete && (adminStatus === "loading" || chatbotLoading))
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );

  if (adminStatus === "failed")
    return <div className="text-red-500">Error: {error}</div>;

  // Generate stats cards - don't make conditional on status after initial load
  const statsCards = [
    {
      title: "Chatbot Name",
      value: chatbot ? (
        <div className="flex items-center">
          <span>{chatbot.name}</span>
          <button
            onClick={openEditModal}
            className="ml-2 p-1 hover:bg-gray-100 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </button>
        </div>
      ) : (
        "No Chatbot"
      ),
      icon: <MessageCircle size={24} className="text-green-500" />,
      iconBg: "bg-green-100",
    },
    {
      title: "Total Agents",
      value: adminTotalAgents || 0,
      icon: <Users size={24} className="text-indigo-500" />,
      iconBg: "bg-indigo-100",
    },
    {
      title: "Total Clients",
      value: adminTotalClients || 0,
      icon: <UserRound size={24} className="text-amber-500" />,
      iconBg: "bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards Column */}
        <div className="space-y-4">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className="rounded-lg shadow-md p-5 bg-white transition-all duration-300 hover:shadow-md"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-xl font-semibold mt-1">{card.value}</p>
                </div>
                <div
                  className={`${card.iconBg} p-2 rounded-full h-10 w-10 flex items-center justify-center`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chatbot Script Column */}
        <div className="col-span-2">
          {chatbot ? (
            <div className="bg-white p-5 rounded-lg shadow-md h-full">
              <div className="relative">
                <h3 className="text-lg font-semibold mb-2">Chatbot Script</h3>
                <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-800 font-mono relative">
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <pre className="whitespace-pre-wrap">{script}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-lg shadow-md h-full flex flex-col items-center justify-center">
              <p className="text-gray-500 mb-4">
                No chatbot found. Please create one.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                Create Chatbot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Graph Section */}
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart size={20} />
            Total Clients
          </h2>
          <div className="flex gap-2 items-center">
            {adminClientDataStatus === "loading" && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            )}
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>

        <div className="h-[300px] w-full">
          {adminClientGraphData.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No data available for this time period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adminClientGraphData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  width={30}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, yAxisMax]}
                  ticks={yAxisTicks}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    zIndex: 20,
                  }}
                  labelStyle={{ fontWeight: "semibold" }}
                  formatter={(value, name) => [value, "New Clients"]}
                  labelFormatter={(label) => `Date: ${label}`}
                  wrapperStyle={{ zIndex: 20 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="New Clients"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                    r: 4,
                    fill: "white",
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                    fill: "#3b82f6",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Create Chatbot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Chatbot</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateChatbot}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chatbot Name*
                </label>
                <input
                  type="text"
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter chatbot name"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Chatbot"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Chatbot Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Chatbot</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditChatbot}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter chatbot name"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Chatbot"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
