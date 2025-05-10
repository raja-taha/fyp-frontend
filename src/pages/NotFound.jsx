import React from "react";
import { Link } from "react-router-dom";
import notFound from "../assets/404.png";
import shape from "../assets/Shape.png";

const NotFound = () => {
  return (
    <div className="h-screen flex items-center justify-center relative bg-secondary">
      {/* Background Shape Image */}
      <img
        src={shape}
        alt="Background Shape"
        className="absolute inset-0 w-full h-full"
      />

      {/* Foreground Content */}
      <div className="relative bg-white p-10 rounded-2xl shadow-lg text-center w-96 ">
        <div className="h-full flex flex-col gap-10 px-5">
          <img src={notFound} alt="404" className="w-[90%] mx-auto" />
          <div>
            <p className="text-xl text-gray-700 mt-4 font-bold">
              Looks like you’ve got lost...
            </p>
            <Link
              to="/"
              className="w-full mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
