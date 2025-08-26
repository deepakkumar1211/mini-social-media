import React, { useState } from "react";

const CreatePost = ()=> {
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);

  const handleFileChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description && !media) {
      alert("Please add description or media");
      return;
    }


    const formData = new FormData();
    formData.append("description", description);
    if (media) {
      formData.append("media", media);
    }

    try {
      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Post created:", data);
      alert("Post created successfully!");

      setDescription("");
      setMedia(null);
    } catch (err) {
      console.error(err);
      alert("Error creating post");
    }
  };

  return (
      <div className="max-w-[420px] mx-auto my-10 p-8 bg-white rounded-2xl shadow-xl ring-2 ring-gray-100">
        <h2 className="text-center mb-6 text-[#222] text-2xl font-semibold">
          Create Post
        </h2>

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="What's on your mind?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-lg border border-[#e0e0e0] mb-4 text-base resize-y bg-[#fafbfc] outline-none transition-colors duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          <label
            htmlFor="media-upload"
            className="block bg-[#f4f6fa] border border-dashed border-[#bfc9d9] rounded-lg p-4 text-center text-gray-500 cursor-pointer mb-5 text-[0.98rem] transition-colors duration-200 hover:bg-[#eef2f8] focus-within:ring-2 focus-within:ring-blue-200"
          >
            {media ? media.name : "Click to add image or video"}
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg py-3 text-[1.05rem] font-semibold cursor-pointer shadow-sm transition-colors duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Post
          </button>
        </form>
      </div>
  );
}

export default CreatePost;
