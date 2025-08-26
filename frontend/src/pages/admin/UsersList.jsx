import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaRegUserCircle } from "react-icons/fa";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "https://mediabackend-r8i8.onrender.com/api/admin/users",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter((u) =>
    u.user.username.toLowerCase().includes(query)
  );

  return (
    <div className="p-3 bg-white shadow-md w-full lg:w-80 h-[calc(100vh-80px)] overflow-y-auto">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        All Registered Users
      </h2>

      {/* Search */}
      <div className="mb-4 flex items-center bg-gray-100 rounded-lg px-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.toLowerCase())}
          placeholder="Search user..."
          className="w-full px-3 py-2 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading users...</p>
      ) : filteredUsers.length > 0 ? (
        <ul className="space-y-4">
          {filteredUsers.map(({ user, payable, paid, pending }) => (
            <li
              key={user._id}
              className="flex flex-col border rounded-lg p-3 hover:shadow"
            >
              {/* User info */}
              <div className="flex items-center gap-3 mb-2">
                <FaRegUserCircle className="w-10 h-10 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              {/* Earnings info */}
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-gray-600">Payable</p>
                  <p className="font-semibold text-blue-700">₹{payable}</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-gray-600">Paid</p>
                  <p className="font-semibold text-green-700">₹{paid}</p>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <p className="text-gray-600">Pending</p>
                  <p className="font-semibold text-yellow-700">₹{pending}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No users found.</p>
      )}
    </div>
  );
};

export default UserList;
