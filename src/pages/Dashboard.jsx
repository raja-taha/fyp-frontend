import { useSelector } from "react-redux";
import AdminDashboard from "./admin/AdminDashboard";
import SuperadminDashboard from "./superadmin/SuperadminDashboard";
import AgentDashboard from "./agent/AgentDashboard";

function Dashboard() {
  const { user } = useSelector((state) => state.user);

  return (
    <div className="">
      {user.role === "superadmin" && <SuperadminDashboard />}
      {user.role === "admin" && <AdminDashboard />}
      {user.role === "agent" && <AgentDashboard />}
    </div>
  );
}

export default Dashboard;
