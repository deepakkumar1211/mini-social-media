import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
      `relative px-2 py-1 text-sm font-medium transition-colors duration-200
      ${isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}
      after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[2px]
      after:scale-x-0 after:bg-blue-600 after:transition-transform after:duration-300
      ${isActive ? "after:scale-x-100" : "hover:after:scale-x-100"}`;

  return (
    <header className="bg-white shadow px-4 py-3 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        {/* Logo */}
        <h1
          className="text-lg sm:text-xl font-bold text-blue-600 cursor-pointer mb-2 sm:mb-0 text-center sm:text-left"
          onClick={() => navigate("/")}
        >
          MiniSocial
        </h1>

        {/* Navigation */}
        <nav className="flex justify-center sm:justify-end items-center gap-3 sm:gap-5">
          <NavLink to="/" className={linkClasses}>
            Home
          </NavLink>

          <NavLink to={`/profile/${user?.id}`} className={linkClasses}>
            Profile
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClasses}>
              Admin
            </NavLink>
          )}

          <button
            onClick={handleLogout}
            className="px-2.5 py-1 text-sm font-medium text-red-500 border border-red-400 rounded-md hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
