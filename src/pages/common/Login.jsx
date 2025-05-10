// Login.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import shape from "../../assets/Shape.png";
import { loginUser } from "../../redux/user/userThunks";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        const token = Cookies.get("token");

        if (user && token) {
          if (user.role === "admin" || user.role === "superadmin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/agent/dashboard");
          }
        }
      } catch (error) {
        Cookies.remove("user");
        Cookies.remove("token");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      toast.error("Please enter email and password");
      return;
    }
    try {
      const result = await dispatch(loginUser(credentials));
      if (result.payload && result.payload.token) {
        toast.success(result.payload.message);
        navigate("/dashboard");
      } else {
        toast.error(result.payload.message);
      }
    } catch (error) {
      toast.error("Error during login dispatch:", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center relative bg-secondary">
      <img
        src={shape}
        alt="Background Shape"
        className="absolute inset-0 w-full h-full"
      />
      <div className="relative bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Login to Account
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and password to continue
        </p>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Address:
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={credentials.email}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-[#D8D8D8] focus:border-gray-600 rounded-lg bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 flex justify-between">
              Password:
              {/* <Link to="/forgot-password" className="text-secondary text-sm">Forgot Password?</Link> */}
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-[#D8D8D8] focus:border-gray-600 rounded-lg bg-gray-100"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg cursor-pointer transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <button className="w-full mt-4 text-blue-500 border border-secondary py-3 rounded-lg font-semibold cursor-pointer hover:text-white hover:bg-blue-600 transition duration-200">
          <Link to="/signup">Register as Admin</Link>
        </button>
      </div>
    </div>
  );
};

export default Login;
