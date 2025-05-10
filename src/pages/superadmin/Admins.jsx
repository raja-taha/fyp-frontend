import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdmins, verifyAdmin } from "../../redux/user/userThunks";
import { Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const Admins = () => {
  const dispatch = useDispatch();
  const { admins, isLoading, error } = useSelector((state) => state.user);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleVerify = (adminId) => {
    setSelectedAdmin(adminId);
    setShowModal(true);
  };

  const confirmVerify = () => {
    if (selectedAdmin) {
      dispatch(verifyAdmin(selectedAdmin));
      setShowModal(false);
      setSelectedAdmin(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 mx-auto">
      <h2 className="text-2xl font-semibold border-b border-gray-300 pb-4">
        Admins
      </h2>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-secondary w-10 h-10" />
        </div>
      )}

      {!isLoading && admins.length === 0 && (
        <p className="text-center">No admins found</p>
      )}

      {!isLoading && admins.length > 0 && (
        <div className="overflow-x-auto bg-white border border-[#979797] rounded-lg">
          <table className="w-full border-collapse">
            <thead className="border-b border-[#979797] bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr
                  key={admin._id}
                  className={`hover:bg-gray-50 transition ${
                    index !== admins.length - 1
                      ? "border-b border-[#979797]"
                      : ""
                  }`}
                >
                  <td className="p-3 text-gray-700">{admin._id}</td>
                  <td className="p-3 font-semibold">
                    {admin.firstName} {admin.lastName}
                  </td>
                  <td className="p-3 text-gray-600">{admin.email}</td>
                  <td className="p-3 text-gray-500">{admin.username}</td>
                  <td className="p-3 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        admin.verified
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {admin.verified ? "Verified" : "Not Verified"}
                    </span>
                    {!admin.verified && (
                      <button
                        onClick={() => handleVerify(admin._id)}
                        title="Verify Admin"
                      >
                        <CheckCircle className="text-green-500 w-5 h-5 cursor-pointer" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-semibold">Confirm Verification</h3>
            <p>Are you sure you want to verify this admin?</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer transition duration-200 hover:bg-gray-800"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer transition duration-200 hover:text-white hover:bg-blue-600"
                onClick={confirmVerify}
              >
                Yes, Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
