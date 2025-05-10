import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteAgent, fetchAgents } from "../../redux/user/userThunks";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AddAgentModal from "../../components/modals/AddAgentModal";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";

const Agents = () => {
  const dispatch = useDispatch();
  const { agents, isLoading, error } = useSelector((state) => state.user);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteClick = (agent) => {
    setSelectedAgent(agent);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAgent) {
      await dispatch(deleteAgent(selectedAgent._id));
      await dispatch(fetchAgents());
      setDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-4 mx-auto">
      <div className="flex justify-between border-b border-gray-300 pb-4">
        <h2 className="text-2xl font-semibold">Agents</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="w-fit text-white border bg-blue-500 px-6 py-3 rounded-lg font-semibold cursor-pointer hover:bg-blue-600 transition duration-200"
        >
          Add Agent
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-secondary w-10 h-10" />
        </div>
      )}

      {!isLoading && agents.length === 0 && (
        <p className="text-center">No agents found</p>
      )}

      {!isLoading && agents.length > 0 && (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full border-collapse">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Clients Handled</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, index) => (
                <tr
                  key={agent._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-gray-700">{agent._id}</td>
                  <td className="p-3 font-semibold">
                    {agent.firstName} {agent.lastName}
                  </td>
                  <td className="p-3 text-gray-600">{agent.email}</td>
                  <td className="p-3 text-gray-600">
                    {agent.username || "N/A"}
                  </td>
                  <td className="p-3 text-center text-gray-500">
                    {agent.clientsHandled || 0}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        agent.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteClick(agent)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        fetchAgents={() => dispatch(fetchAgents())}
      />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Agent"
        message="Are you sure you want to delete this agent? This action cannot be undone."
      />
    </div>
  );
};

export default Agents;
