import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  fetchClientData,
} from "../../redux/dashboard/dashboardThunks";
import { setSelectedPeriod } from "../../redux/dashboard/dashboardSlice";
import {
  Users,
  UserRound,
  Bot,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  BarChart,
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

const SuperadminDashboard = () => {
  const dispatch = useDispatch();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const {
    totalAdmins,
    totalChatbots,
    totalAgents,
    totalClients,
    clientGraphData,
    selectedPeriod,
    status,
    clientDataStatus,
    error,
  } = useSelector((state) => state.dashboard);

  // Calculate max Y value for graph
  const maxValue = clientGraphData.length
    ? Math.max(...clientGraphData.map((item) => item.value), 1)
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
    dispatch(fetchDashboardStats());
    dispatch(fetchClientData(selectedPeriod));
  }, [dispatch, selectedPeriod]);

  // Mark initial load as complete when data is loaded
  useEffect(() => {
    if (status === "succeeded" && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [status, initialLoadComplete]);

  const handlePeriodChange = (period) => {
    dispatch(setSelectedPeriod(period));
  };

  // Only show the loading spinner for initial page load
  if (status === "loading" && !initialLoadComplete)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );

  if (status === "failed")
    return <div className="text-red-500">Error: {error}</div>;

  // Stats cards data
  const statsCards = [
    {
      title: "Total Admins",
      value: totalAdmins,
      icon: <Users size={24} className="text-indigo-500" />,
      iconBg: "bg-indigo-100",
    },
    {
      title: "Total Agents",
      value: totalAgents,
      icon: <UserRound size={24} className="text-amber-500" />,
      iconBg: "bg-amber-100",
    },
    {
      title: "Total Chatbots",
      value: totalChatbots,
      icon: <Bot size={24} className="text-green-500" />,
      iconBg: "bg-green-100",
    },
    {
      title: "Total Clients",
      value: totalClients,
      icon: <MessageSquare size={24} className="text-rose-500" />,
      iconBg: "bg-rose-100",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-md p-5 bg-white transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-xl font-semibold">
                  {card.value.toLocaleString()}
                </p>
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

      {/* Graph Section */}
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart size={20} />
            Total Clients
          </h2>
          <div className="flex gap-2 items-center">
            {clientDataStatus === "loading" && (
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
          {clientGraphData.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No data available for this time period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientGraphData}>
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
    </div>
  );
};

export default SuperadminDashboard;
