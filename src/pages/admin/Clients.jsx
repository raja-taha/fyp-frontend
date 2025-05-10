import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllClients } from "../../redux/client/clientThunks";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Clients = () => {
  const dispatch = useDispatch();
  const { clients, loading, error } = useSelector((state) => state.clients);

  useEffect(() => {
    dispatch(fetchAllClients());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-4 mx-auto">
      <h2 className="text-2xl font-semibold border-b border-gray-300 pb-4">
        Clients
      </h2>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-secondary w-10 h-10" />
        </div>
      )}

      {!loading && clients.length === 0 && (
        <p className="text-center">No clients found</p>
      )}

      {!loading && clients.length > 0 && (
        <div className="overflow-x-auto bg-white border border-[#979797] rounded-lg">
          <table className="w-full border-collapse">
            <thead className="border-b border-[#979797] bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Language</th>
                <th className="p-3 text-left">Assigned Agent</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr
                  key={client._id}
                  className="border-b border-[#979797] hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-gray-700">{client._id}</td>
                  <td className="p-3 font-semibold">
                    {client.firstName} {client.lastName}
                  </td>
                  <td className="p-3 text-gray-600">{client.email}</td>
                  <td className="p-3 text-gray-600">{client.phone}</td>
                  <td className="p-3 text-gray-500">
                    {client.language.toUpperCase()}
                  </td>
                  <td className="p-3 text-gray-500">
                    {client.assignedAgent?.username || "Unassigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Clients;
