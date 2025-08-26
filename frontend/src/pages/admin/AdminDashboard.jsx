import React, { useState, useEffect } from "react";
import UserList from "./UsersList";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);

  const [totals, setTotals] = useState(null);
  const [userEarnings, setUserEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

    // Track payment status per user
  const [paymentStatus, setPaymentStatus] = useState({});

  // Rates + Modal
  const [rate, setRate] = useState({ view: 0, like: 0, comment: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      const res = await fetch(
        "https://mediabackend-r8i8.onrender.com/api/admin/dashboard",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const data = await res.json();

      setTotals(data.data.totals);

      // Group posts by user
      const grouped = {};
      data.data.posts.forEach((post) => {
        const { _id, username, email } = post.user;
        if (!grouped[_id]) {
          grouped[_id] = {
            userId: _id,
            username,
            email,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalEarning: 0,
          };
        }
        grouped[_id].totalViews += post.views;
        grouped[_id].totalLikes += post.likes;
        grouped[_id].totalComments += post.comments;
        grouped[_id].totalEarning += post.earning;
      });

      setUserEarnings(Object.values(grouped));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
 // Fetch Current Rates 
const fetchRates = async () => {
  try {
    const res = await fetch(
      "https://mediabackend-r8i8.onrender.com/api/admin/get-rates",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch rates");
    const data = await res.json();

    setRate({
      view: Math.floor(data.data.perView),
      like: Math.floor(data.data.perLike),
      comment: Math.floor(data.data.perComment),
    });
  } catch (err) {
    console.error("Error fetching rates", err);
  }
};


  useEffect(() => {
    fetchDashboard();
    fetchRates();
  }, [token]);


  // Function to update rates
  const updateRates = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(
      "https://mediabackend-r8i8.onrender.com/api/admin/rates",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          perView: rate.view,
          perLike: rate.like,
          perComment: rate.comment,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to update rates");
    const data = await res.json();
    console.log("Rate update response:", data);

    alert("✅ Rates updated successfully!");
    setIsModalOpen(false);

    // refresh dashboard + rates
    fetchDashboard();
    fetchRates();
  } catch (err) {
    console.error(err);
    alert("Error in updating rates");
  }
};

const handlePaymentApproval = (userId) => {
    setPaymentStatus((prev) => ({
      ...prev,
      [userId]: "Payment Under Process",
    }));
  };


  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left Side */}
        <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4">
            Admin Dashboard
          </h1>

          {/* Totals */}
          {totals && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-4 rounded text-center">
                <p className="text-gray-600 text-sm">Total Views</p>
                <p className="text-lg font-bold">{totals.totalViews}</p>
              </div>
              <div className="bg-green-100 p-4 rounded text-center">
                <p className="text-gray-600 text-sm">Total Likes</p>
                <p className="text-lg font-bold">{totals.totalLikes}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded text-center">
                <p className="text-gray-600 text-sm">Total Comments</p>
                <p className="text-lg font-bold">{totals.totalComments}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded text-center">
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-lg font-bold">₹{totals.totalEarnings}</p>
              </div>
            </div>
          )}

          {/* Show Current Rates */}
          <div className="bg-gray-100 p-4 rounded text-center">
            <p className="text-gray-600 text-sm">Current Rates</p>
            <p className="text-md font-medium">
              View: ₹{rate.view} | Like: ₹{rate.like} | Comment: ₹{rate.comment}
            </p>
          </div>

          {/* Set Rates Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-blue-600"
          >
            Set Rates
          </button>

          {/* Users Payout */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold mb-3">
              Users Payout
            </h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border text-xs sm:text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="p-2">User</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Views</th>
                      <th className="p-2">Likes</th>
                      <th className="p-2">Comments</th>
                      <th className="p-2">Payable (₹)</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userEarnings.map((u) => (
                      <tr key={u.userId} className="border-t">
                        <td className="p-2 font-medium">{u.username}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.totalViews}</td>
                        <td className="p-2">{u.totalLikes}</td>
                        <td className="p-2">{u.totalComments}</td>
                        <td className="p-2 text-green-700 font-semibold">
                          ₹{u.totalEarning.toFixed(0)}
                        </td>
                        <td className="p-2">
                          {paymentStatus[u.userId] ? (
                            <span className="text-yellow-600 font-medium">
                              {paymentStatus[u.userId]}
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePaymentApproval(u.userId)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-gray-50 shadow-inner p-2 xs:p-8">
          <UserList />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-96 p-6 relative">
            <h2 className="text-lg font-semibold mb-4">Set Rates</h2>
            <form onSubmit={updateRates} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Rate per View (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  value={rate.view}
                  onChange={(e) =>
                    setRate({ ...rate, view: parseInt(e.target.value) || 0 })
                  }
                  className="border px-3 py-2 rounded w-full mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Rate per Like (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  value={rate.like}
                  onChange={(e) =>
                    setRate({ ...rate, like: parseInt(e.target.value) || 0 })
                  }
                  className="border px-3 py-2 rounded w-full mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Rate per Comment (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  value={rate.comment}
                  onChange={(e) =>
                    setRate({ ...rate, comment: parseInt(e.target.value) || 0 })
                  }
                  className="border px-3 py-2 rounded w-full mt-1"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
