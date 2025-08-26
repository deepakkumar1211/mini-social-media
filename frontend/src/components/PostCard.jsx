import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";
import { FaRegUserCircle } from "react-icons/fa";

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [likedByMe, setLikedByMe] = useState(post.likedByMe || false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { token } = useSelector((state) => state.auth);

  //Toggle Like API
  const handleLike = async () => {
    try {
      const res = await axios.post(
        `https://mediabackend-r8i8.onrender.com/api/posts/${post.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setLikes(res.data.likesCount);
        setLikedByMe(!likedByMe);
      }
    } catch (err) {
      console.error("Like failed:", err.response?.data || err.message);
    }
  };

  //Add Comment API
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);

      const res = await axios.post(
        `https://mediabackend-r8i8.onrender.com/api/posts/${post.id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCommentsCount(res.data.commentsCount);
        setNewComment("");
        setShowCommentBox(false);
      }
    } catch (err) {
      console.error("Failed to add comment:", err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        {post.user?.username ? (
          <FaRegUserCircle className="w-10 h-10 text-gray-400" />
        ) : (
          <FaRegUserCircle className="w-10 h-10 text-gray-400" />
        )}
        <div>
          <h3 className="font-semibold text-gray-800">@{post.user?.username}</h3>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Media */}
      {post.mediaType === "image" && (
        <img
          src={post.mediaUrl}
          alt="post"
          className="w-full max-h-96 object-cover"
        />
      )}
      {post.mediaType === "video" && (
        <video
          src={post.mediaUrl}
          controls
          className="w-full max-h-96 object-cover"
        />
      )}

      {/* Body */}
      <div className="p-4">
        <p className="text-gray-700 mb-3">{post.caption}</p>

        {/* Actions */}
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-red-500 transition"
          >
            {likedByMe ? (
              <AiFillHeart className="text-red-500 text-lg" />
            ) : (
              <AiOutlineHeart className="text-lg" />
            )}
            <span>{likes}</span>
          </button>

          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="flex items-center gap-1 hover:text-blue-500 transition"
          >
            <FaRegCommentDots className="text-lg" /> <span>{commentsCount}</span>
          </button>

          <span className="text-gray-500">👀 {post.viewsCount}</span>
        </div>

        {/* Comment Box */}
        {showCommentBox && (
          <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring focus:ring-blue-300 outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? "..." : "Post"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
