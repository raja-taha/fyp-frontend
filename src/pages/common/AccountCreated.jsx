import React from "react";
import shape from "../../assets/Shape.png";
import { useNavigate } from "react-router-dom";

const AccountCreated = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-secondary">
      <img
        src={shape}
        alt="Background Shape"
        className="absolute inset-0 w-full h-full"
      />
      <div className="relative bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center  mb-4 animate-fade-in">
          Account Created!
        </h2>
        <div className="flex flex-col text-center text-[15px] font-medium gap-3">
          <p className="opacity-90">
            Your account request has been submitted for approval.
          </p>
          <p className="opacity-90">
            An email confirmation will be sent once an admin reviews and
            approves your request.
          </p>
          <p className="opacity-90">You’ll be able to log in after approval.</p>
        </div>

        <button
          className="w-full mt-4 text-secondary border border-secondary py-3 rounded-lg font-semibold cursor-pointer hover:text-white hover:bg-secondary transition duration-200"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default AccountCreated;
