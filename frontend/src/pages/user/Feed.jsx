import React, { useEffect, useState } from "react";
import PostCard from "../../components/PostCard";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logout } from "../../store/authSlice";
import Navbar from "../../components/Navbar";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //Fetch posts with pagination
  const fetchPosts = async (pageNum = 1) => {
    try {
      setFetching(true);
      const res = await axios.get(
        `https://mediabackend-r8i8.onrender.com/api/posts?page=${pageNum}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newPosts = res.data.data || [];

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) =>
          pageNum === 1 ? newPosts : [...prev, ...newPosts] // ✅ reset if page=1 else append
        );
      }
    } catch (err) {
      console.error("Error fetching posts:", err.response?.data || err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
    // eslint-disable-next-line
  }, [page]);

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  // Create new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !file) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("caption", caption);
      if (file) {
        formData.append("media", file);
      }

      const res = await axios.post(
        "https://mediabackend-r8i8.onrender.com/api/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //Add new post to top
      setPosts((prev) => [res.data.data, ...prev]);
      setCaption("");
      setFile(null);
      setPreview("");
    } catch (err) {
      console.error("Error creating post:", err.response?.data || err.message);
      alert("Failed to create post!");
    } finally {
      setLoading(false);
    }
  };


  console.log("posts:", posts);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar  />
    

      {/* Feed */}
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/*Create Post Form */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="font-semibold text-lg mb-3">Create Post</h2>
          <form onSubmit={handleCreatePost} className="space-y-3">
            <input
              type="text"
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring focus:ring-blue-300 outline-none"
            />

            {/* File Upload */}
            <label
              htmlFor="fileUpload"
              className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <p className="text-sm text-gray-600">
                <span className="font-medium">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, MP4 (max 5MB)</p>
              <input
                id="fileUpload"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Preview */}
            {preview && (
              <div className="mt-3">
                {file && file.type.startsWith("image") ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full rounded-md max-h-60 object-cover border"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="w-full rounded-md max-h-60 border"
                  />
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>

        {/* Posts */}
        {posts.length === 0 && !fetching ? (
          <p className="text-center text-gray-500">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id || post._id} post={post} />)
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={fetching}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
            >
              {fetching ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
