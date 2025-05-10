import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChatbots } from "../../redux/chatbot/chatbotThunks";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Chatbots = () => {
  const dispatch = useDispatch();
  const { chatbots, loading, error } = useSelector((state) => state.chatbot);

  useEffect(() => {
    dispatch(fetchChatbots());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-4 mx-auto">
      <h2 className="text-2xl font-semibold border-b border-gray-300 pb-4">
        Chatbots
      </h2>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-secondary w-10 h-10" />
        </div>
      )}

      {!loading && chatbots.length === 0 && (
        <p className="text-center">No chatbots found</p>
      )}

      {!loading && chatbots.length > 0 && (
        <div className="overflow-x-auto bg-white border border-[#979797] rounded-lg">
          <table className="w-full border-collapse">
            <thead className="border-b border-[#979797]">
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {chatbots.map((bot, index) => (
                <tr
                  key={bot._id}
                  className={`hover:bg-gray-50 transition ${
                    index !== chatbots.length - 1
                      ? "border-b border-[#979797]"
                      : ""
                  }`}
                >
                  <td className="p-3 text-gray-700">{bot._id}</td>
                  <td className="p-3 font-semibold">{bot.name}</td>
                  <td className="p-3 text-gray-600">{bot.description}</td>
                  <td className="p-3 text-gray-500">
                    {bot.createdBy.firstName} {bot.createdBy.lastName}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        bot.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {bot.active ? "Active" : "Inactive"}
                    </span>
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

export default Chatbots;
