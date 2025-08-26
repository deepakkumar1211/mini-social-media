import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";
import Navbar from "../../components/Navbar";

export default function Profile() {
  const { id } = useParams(); // from /profile/:id
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>No user data found. Please log in.</p>
      </div>
    );
  }

  // Only allow the logged-in user to see their profile
  if (user.id !== id) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Unauthorized access</p>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">User Profile</h2>

          {/* Avatar Placeholder */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-3 text-gray-700">
            <p>
              <span className="font-semibold">Username:</span> {user.username}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">Role:</span>{" "}
              <span className="capitalize">{user.role}</span>
            </p>

          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-6 w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

    </div>
  );
}
