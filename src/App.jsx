import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import { Toaster } from "react-hot-toast";
import Agents from "./pages/admin/Agents.jsx";
import Clients from "./pages/admin/Clients";
import Signup from "./pages/common/Signup";
import Login from "./pages/common/Login";
import AccountCreated from "./pages/common/AccountCreated";
import Admins from "./pages/superadmin/Admins";
import Chatbots from "./pages/superadmin/Chatbots";
import Chats from "./pages/Chats";
import Unauthorized from "./pages/Unauthorized";
import AdminTeam from "./pages/admin/AdminTeam";
import AgentTeam from "./pages/agent/AgentTeam";
import AdminSettings from "./pages/admin/AdminSettings";
import AgentSettings from "./pages/agent/AgentSettings";
import SuperadminSettings from "./pages/superadmin/SuperadminSettings";

function App() {
  const { user } = useSelector((state) => state.user);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account-created" element={<AccountCreated />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["superadmin", "admin", "agent"]}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin-settings"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <Layout>
                <SuperadminSettings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminSettings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-settings"
          element={
            <ProtectedRoute allowedRoles={["agent"]}>
              <Layout>
                <AgentSettings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admins"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <Layout>
                <Admins />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbots"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <Layout>
                <Chatbots />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <Clients />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <Agents />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inbox"
          element={
            <ProtectedRoute allowedRoles={["admin", "agent"]}>
              <Layout>
                <Chats />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-team"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminTeam />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-team"
          element={
            <ProtectedRoute allowedRoles={["agent"]}>
              <Layout>
                <AgentTeam />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
