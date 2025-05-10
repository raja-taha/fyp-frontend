import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAgentTeam } from "../../redux/user/userThunks";
import Card from "../../components/ui/Card";
import {
  User,
  Mail,
  Briefcase,
  Calendar,
  Users,
  UserCheck,
  Users2,
  Globe,
} from "lucide-react";
import languagesModule from "../../utils/languages";

const AgentTeam = () => {
  const dispatch = useDispatch();
  const { agent, admin, teammates, totalTeammates, isLoading, error } =
    useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchAgentTeam());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading team data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center mb-8">
        <h2 className="text-2xl font-semibold">Team Overview</h2>
      </div>

      {/* Admin Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <UserCheck className="text-blue-500 mr-2" size={20} />
          <h2 className="text-xl font-semibold text-gray-700">
            Admin Information
          </h2>
        </div>

        {admin ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard admin={admin} />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No admin information available.</p>
          </div>
        )}
      </div>

      {/* Team Section */}
      <div>
        <div className="flex items-center mb-4">
          <Users className="text-blue-500 mr-2" size={20} />
          <h2 className="text-xl font-semibold text-gray-700">Team Members</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Agent Card (You) */}
          {agent && <AgentCard agent={agent} isCurrentUser={true} />}

          {/* Teammates Cards */}
          {teammates && teammates.length > 0
            ? teammates.map((teammate) => (
                <TeammateCard key={teammate._id} teammate={teammate} />
              ))
            : !agent && (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No team members found.</p>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

const AdminCard = ({ admin }) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
          <User className="text-blue-500" size={28} />
        </div>
        <div className="ml-4">
          <h3 className="font-semibold text-lg text-gray-800">
            {admin.firstName} {admin.lastName}
          </h3>
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-500 bg-indigo-50 px-2 py-0.5 rounded">
              {admin.role}
            </span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {admin.status}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-gray-700 mb-4 flex-1">
        <div className="flex items-center">
          <Mail className="text-gray-400 mr-2" size={16} />
          <span className="text-sm truncate">{admin.email}</span>
        </div>

        <div className="flex items-center">
          <User className="text-gray-400 mr-2" size={16} />
          <span className="text-sm">@{admin.username}</span>
        </div>

        <div className="flex items-center">
          <Globe className="text-gray-400 mr-2" size={16} />
          <span className="text-sm">
            Language:{" "}
            {admin?.language
              ? languagesModule.byCode[admin.language] || admin.language
              : "English"}
          </span>
        </div>

        <div className="flex items-center col-span-2">
          <Calendar className="text-gray-400 mr-2" size={16} />
          <span className="text-sm">
            Joined: {new Date(admin.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );
};

const AgentCard = ({ agent, isCurrentUser }) => {
  return (
    <Card className="h-full border-l-4 border-l-green-500">
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <User className="text-green-500" size={24} />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center">
              <h3 className="font-semibold text-lg text-gray-800">
                {agent.firstName} {agent.lastName}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isCurrentUser && (
                <span className=" px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  You
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  agent.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {agent.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-gray-700 mb-4 flex-1">
          <div className="flex items-center">
            <Mail className="text-gray-400 mr-2" size={16} />
            <span className="text-sm truncate">{agent.email}</span>
          </div>

          <div className="flex items-center">
            <User className="text-gray-400 mr-2" size={16} />
            <span className="text-sm">@{agent.username}</span>
          </div>

          <div className="flex items-center">
            <Globe className="text-gray-400 mr-2" size={16} />
            <span className="text-sm">
              Language:{" "}
              {agent?.language
                ? languagesModule.byCode[agent.language] || agent.language
                : "English"}
            </span>
          </div>

          <div className="flex items-center">
            <Briefcase className="text-gray-400 mr-2" size={16} />
            <span className="text-sm">
              Clients Handled: {agent.clientsHandled || 0}
            </span>
          </div>

          <div className="flex items-center">
            <Users className="text-gray-400 mr-2" size={16} />
            <span className="text-sm">
              Current Clients: {agent.clientCount || 0}
            </span>
          </div>

          <div className="flex items-center">
            <Calendar className="text-gray-400 mr-2" size={16} />
            <span className="text-sm">
              Joined: {new Date(agent.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const TeammateCard = ({ teammate }) => {
  return (
    <Card className="h-full border-l-4 border-l-indigo-500">
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="text-indigo-500" size={24} />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="font-semibold text-lg text-gray-800">
              {teammate.firstName} {teammate.lastName}
            </h3>
            <div className="flex items-center">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  teammate.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {teammate.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-gray-700 mb-4 flex-1">
          <div className="flex items-center">
            <Mail className="text-gray-400 mr-2" size={16} />
            <span className="text-sm truncate">{teammate.email}</span>
          </div>

          <div className="flex items-center">
            <User className="text-gray-400 mr-2" size={16} />
            <span className="text-sm">@{teammate.username}</span>
          </div>

          <div className="flex items-center">
            <Globe className="text-gray-400 mr-2" size={16} />
            <span className="text-sm">
              Language:{" "}
              {teammate?.language
                ? languagesModule.byCode[teammate.language] || teammate.language
                : "English"}
            </span>
          </div>

          <div className="flex items-center">
            <Briefcase className="text-gray-400 mr-2" size={16} />
            <span className="text-sm">
              Clients: {teammate.clientCount || 0}
            </span>
          </div>

          <div className="flex items-center">
            <Calendar className="text-gray-400 mr-2" size={16} />
            <span className="text-sm">
              Joined: {new Date(teammate.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AgentTeam;
