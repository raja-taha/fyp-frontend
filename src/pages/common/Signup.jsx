// Signup.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import shape from "../../assets/Shape.png";
import { createAdmin } from "../../redux/user/userThunks";

const Signup = () => {
  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAdminChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (adminData.password !== adminData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const result = await dispatch(createAdmin(adminData));
      if (result.payload && result.payload.message) {
        toast.success(result.payload.message);
        navigate("/account-created");
      } else {
        toast.error(result.payload.message);
      }
    } catch (error) {
      toast.error("Error during registration:", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-secondary">
      <img
        src={shape}
        alt="Background Shape"
        className="absolute inset-0 w-full h-full"
      />
      <div className="relative bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Register as Admin
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Fill in the details to create an admin account
        </p>
        <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              onChange={handleAdminChange}
              className="w-full p-3 border rounded-lg bg-gray-100 border-[#D8D8D8] focus:border-gray-600"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              onChange={handleAdminChange}
              className="w-full p-3 border rounded-lg bg-gray-100 border-[#D8D8D8] focus:border-gray-600"
              required
            />
          </div>
          <div className="flex gap-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleAdminChange}
              className="w-full p-3 border rounded-lg bg-gray-100 border-[#D8D8D8] focus:border-gray-600"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleAdminChange}
              className="w-full p-3 border rounded-lg bg-gray-100 border-[#D8D8D8] focus:border-gray-600"
              required
            />
          </div>
          <div className="flex gap-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleAdminChange}
              className="w-full p-3 border rounded-lg bg-gray-100 border-[#D8D8D8] focus:border-gray-600"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleAdminChange}
              className="w-full p-3 border rounded-lg bg-gray-100 border-[#D8D8D8] focus:border-gray-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg cursor-pointer transition duration-200"
          >
            Register
          </button>
        </form>
        <button
          className="w-full mt-4 text-blue-500 border border-blue-500 py-3 rounded-lg font-semibold cursor-pointer hover:text-white hover:bg-blue-600 transition duration-200"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Signup;
