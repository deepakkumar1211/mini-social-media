// final code 
import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";
import { LuEye } from "react-icons/lu";

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [likedByMe, setLikedByMe] = useState(post.likedByMe || false);
  const [likedBy, setLikedBy] = useState(post.likedBy || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [popupType, setPopupType] = useState(null);

  const { token, user } = useSelector((state) => state.auth);

  // Toggle Like API
  const handleLike = async () => {
    try {
      const res = await axios.post(
        `https://mediabackend-r8i8.onrender.com/api/posts/${post.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setLikes(res.data.likesCount);

        if (likedByMe) {
          // remove current user from likedBy
          setLikedBy((prev) => prev.filter((u) => u._id !== user._id));
        } else {
          // add current user if not already there
          setLikedBy((prev) => {
            const exists = prev.some((u) => u._id === user._id);
            if (exists) return prev;
            return [
              { _id: user._id, username: user.username, profilePic: user.profilePic },
              ...prev,
            ];
          });
        }

        setLikedByMe(!likedByMe);
      }
    } catch (err) {
      console.error("Like failed:", err.response?.data || err.message);
    }
  };

  // Add Comment API
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
        setComments((prev) => [
          ...prev,
          {
            _id: Date.now(),
            text: newComment,
            user: {
              _id: user._id,
              username: user.username,
              profilePic: user.profilePic,
            },
          },
        ]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Render avatar
  const renderAvatar = (u) => {
    return (
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
        {u?.username?.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Popup content
  const renderPopupContent = () => {
    let list = [];
    if (popupType === "likes") list = likedBy;
    if (popupType === "views") list = post.viewedBy || [];
    if (popupType === "comments") list = comments;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-96 max-h-[70vh] overflow-y-auto p-4 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold capitalize">{popupType}</h2>
            <button
              className="text-gray-600 hover:text-red-500 font-bold"
              onClick={() => setPopupType(null)}
            >
              ✕
            </button>
          </div>
          {list.length > 0 ? (
            list.map((item) => (
              <div
                key={item._id || item.id}
                className="flex items-center gap-3 p-2 border-b last:border-none"
              >
                {renderAvatar(popupType === "comments" ? item.user : item)}
                <div>
                  <span className="font-semibold">
                    @{popupType === "comments" ? item.user?.username : item.username}
                  </span>
                  {popupType === "comments" && (
                    <p className="text-sm text-gray-700">{item.text}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No {popupType} yet</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        {renderAvatar(post.user)}
        <div>
          <h3 className="font-semibold text-gray-800">@{post.user?.username}</h3>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Media */}
      {post.mediaType === "image" && (
        <img src={post.mediaUrl} alt="post" className="w-full max-h-96 object-cover" />
      )}
      {post.mediaType === "video" && (
        <video src={post.mediaUrl} controls className="w-full max-h-96 object-cover" />
      )}

      {/* Body */}
      <div className="p-4">
        <p className="text-gray-700 mb-3">{post.caption}</p>

        {/* Actions */}
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          {/* Likes */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-red-500 transition"
          >
            {likedByMe ? (
              <AiFillHeart className="text-red-500 text-lg" />
            ) : (
              <AiOutlineHeart className="text-lg" />
            )}
            <span>{likes} Likes</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setPopupType("comments")}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-500"
          >
            <FaRegCommentDots className="text-lg" />
            <span>{commentsCount} Comments</span>
          </button>

          {/* Views */}
          <button
            onClick={() => setPopupType("views")}
            className="flex items-center gap-1 text-gray-500 hover:text-green-500"
          >
            <LuEye className="text-lg" />
            {post.viewsCount} Views
          </button>
        </div>

        {/* Show liked by */}
        {likedBy.length > 0 && (
          <div
            className="text-xs text-gray-600 mb-2 cursor-pointer hover:underline"
            onClick={() => setPopupType("likes")}
          >
            ❤️ Liked by <span className="font-semibold">@{likedBy[0]?.username}</span>
            {likedBy.length > 1 && ` and ${likedBy.length - 1} others`}
          </div>
        )}

        {/* Comment Box */}
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
            {submitting ? "..." : "Comment"}
          </button>
        </form>
      </div>

      {/* Popup */}
      {popupType && renderPopupContent()}
    </div>
  );
}






// optimized code
// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
// import { FaRegCommentDots } from "react-icons/fa";
// import { LuEye } from "react-icons/lu";

// export default function PostCard({ post }) {
//   const [likes, setLikes] = useState(post.likesCount || 0);
//   const [likedByMe, setLikedByMe] = useState(post.likedByMe || false);
//   const [likedBy, setLikedBy] = useState(post.likedBy || []);
//   const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
//   const [comments, setComments] = useState(post.comments || []);
//   const [newComment, setNewComment] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [popupType, setPopupType] = useState(null);

//   const { token, user } = useSelector((state) => state.auth);

//   /** Toggle Like */
//   const handleLike = async () => {
//     try {
//       const { data } = await axios.post(
//         `https://mediabackend-r8i8.onrender.com/api/posts/${post.id}/like`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (data.success) {
//         setLikes(data.likesCount);

//         setLikedBy((prev) => {
//           if (likedByMe) {
//             return prev.filter((u) => u._id !== user._id);
//           }
//           const exists = prev.some((u) => u._id === user._id);
//           return exists
//             ? prev
//             : [{ _id: user._id, username: user.username, profilePic: user.profilePic }, ...prev];
//         });

//         setLikedByMe(!likedByMe);
//       }
//     } catch (err) {
//       console.error("Like failed:", err.response?.data || err.message);
//     }
//   };

//   /** Add Comment */
//   const handleAddComment = async (e) => {
//     e.preventDefault();
//     if (!newComment.trim()) return;

//     setSubmitting(true);
//     try {
//       const { data } = await axios.post(
//         `https://mediabackend-r8i8.onrender.com/api/posts/${post.id}/comment`,
//         { text: newComment },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (data.success) {
//         setCommentsCount(data.commentsCount);
//         setComments((prev) => [
//           ...prev,
//           {
//             _id: Date.now(),
//             text: newComment,
//             user: { _id: user._id, username: user.username, profilePic: user.profilePic },
//           },
//         ]);
//         setNewComment("");
//       }
//     } catch (err) {
//       console.error("Failed to add comment:", err.response?.data || err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   /** Render avatar */
//   const Avatar = () =>
//       <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
//         {user?.username?.charAt(0).toUpperCase()}
//       </div>
//     ;

//   /** Render popup */
//   const renderPopupContent = () => {
//     const list =
//       popupType === "likes" ? likedBy : popupType === "views" ? post.viewedBy || [] : comments;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-xl w-96 max-h-[70vh] overflow-y-auto p-4 shadow-lg">
//           <div className="flex justify-between items-center mb-3">
//             <h2 className="text-lg font-semibold capitalize">{popupType}</h2>
//             <button
//               className="text-gray-600 hover:text-red-500 font-bold"
//               onClick={() => setPopupType(null)}
//             >
//               ✕
//             </button>
//           </div>

//           {list.length > 0 ? (
//             list.map((item) => {
//               const displayUser = popupType === "comments" ? item.user : item;
//               return (
//                 <div key={item._id || item.id} className="flex items-center gap-3 p-2 border-b last:border-none">
//                   <Avatar user={displayUser} />
//                   <div>
//                     <span className="font-semibold">@{displayUser?.username}</span>
//                     {popupType === "comments" && (
//                       <p className="text-sm text-gray-700">{item.text}</p>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <p className="text-gray-500 text-sm">No {popupType} yet</p>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
//       {/* Header */}
//       <div className="flex items-center gap-3 p-4">
//         <Avatar user={post.user} />
//         <div>
//           <h3 className="font-semibold text-gray-800">@{post.user?.username}</h3>
//           <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
//         </div>
//       </div>

//       {/* Media */}
//       {post.mediaType === "image" && (
//         <img src={post.mediaUrl} alt="post" className="w-full max-h-96 object-cover" />
//       )}
//       {post.mediaType === "video" && (
//         <video src={post.mediaUrl} controls className="w-full max-h-96 object-cover" />
//       )}

//       {/* Body */}
//       <div className="p-4">
//         <p className="text-gray-700 mb-3">{post.caption}</p>

//         {/* Actions */}
//         <div className="flex justify-between text-sm text-gray-600 mb-3">
//           {/* Likes */}
//           <button onClick={handleLike} className="flex items-center gap-1 hover:text-red-500 transition">
//             {likedByMe ? <AiFillHeart className="text-red-500 text-lg" /> : <AiOutlineHeart className="text-lg" />}
//             <span>{likes} Likes</span>
//           </button>

//           {/* Comments */}
//           <button
//             onClick={() => setPopupType("comments")}
//             className="flex items-center gap-1 text-gray-600 hover:text-blue-500"
//           >
//             <FaRegCommentDots className="text-lg" />
//             <span>{commentsCount} Comments</span>
//           </button>

//           {/* Views */}
//           <button
//             onClick={() => setPopupType("views")}
//             className="flex items-center gap-1 text-gray-500 hover:text-green-500"
//           >
//             <LuEye className="text-lg" />
//             {post.viewsCount} Views
//           </button>
//         </div>

//         {/* Liked by */}
//         {likedBy.length > 0 && (
//           <div
//             className="text-xs text-gray-600 mb-2 cursor-pointer hover:underline"
//             onClick={() => setPopupType("likes")}
//           >
//             ❤️ Liked by <span className="font-semibold">@{likedBy[0]?.username}</span>
//             {likedBy.length > 1 && ` and ${likedBy.length - 1} others`}
//           </div>
//         )}

//         {/* Comment Box */}
//         <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
//           <input
//             type="text"
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             placeholder="Write a comment..."
//             className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring focus:ring-blue-300 outline-none"
//           />
//           <button
//             type="submit"
//             disabled={submitting}
//             className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
//           >
//             {submitting ? "..." : "Comment"}
//           </button>
//         </form>
//       </div>

//       {/* Popup */}
//       {popupType && renderPopupContent()}
//     </div>
//   );
// }