import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosinstance";
import { useNavigate } from "react-router-dom";
import SeeDetails from "./SeeDetails";

const All = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const getallPosts = async () => {
    try {
      const response = await axiosInstance.get("/get-all-user-travel-stories");
      setPosts(response.data.stories);
    } catch (error) {
      console.error("Failed to fetch travel stories:", error);
    }
  };

  useEffect(() => {
    getallPosts();
  }, []);

  const nav = () => {
    navigate("/dashboard"); // Navigate to /dashboard
  }

  const seeDetails = (id) => {
    navigate(`/Details/${id}`); // Navigate to /Details/:id
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        All Travel Stories
      </h2>
      <button
        onClick={nav} // Navigate to /dashboard
        className=" cursor-pointer absolute top-9 left-6 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition duration-300"
      >
        Back
      </button>
      <div className="max-w-4xl mx-auto space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              onClick={() => seeDetails(post._id)}
              key={post._id}
              className=" cursor-pointer  bg-white shadow-lg rounded-lg overflow-hidden p-6 hover:shadow-xl hover:shadow-cyan-200"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-60 h-30 object-cover rounded-lg border border-gray-200"
                />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.visitedDate).toLocaleDateString()} |{" "}
                    {post.visitedLocation.join(", ")}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{post.story}</p>
              <div className="text-sm text-gray-600">
                Created on: {new Date(post.createdOn).toLocaleDateString()}
              </div>
              <div className="mt-2">
                {post.isFavourite ? (
                  <span className="text-cyan-500 font-bold">💙 Favourite</span>
                ) : (
                  <span className="text-gray-500 font-medium">
                    Not a Favourite
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-lg">
            No travel stories available
          </p>
        )}
      </div>
    </div>
  );
};

export default All;
