import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1
        className="text-xl font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        MiniSocial
      </h1>

      <nav className="space-x-4 flex items-center">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-700 hover:text-blue-500"
        >
          Home
        </button>

        <button
          onClick={() => navigate(`/profile/${user?.id}`)}
          className="text-sm text-gray-700 hover:text-blue-500"
        >
          Profile
        </button>

        {/*Only show Admin if user is admin */}
        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-gray-700 hover:text-blue-500"
          >
            Admin
          </button>
        )}

        <button
          onClick={handleLogout}
          className="text-sm text-gray-700 hover:text-blue-500"
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
