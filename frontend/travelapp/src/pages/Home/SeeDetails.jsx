import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosinstance";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const SeeDetails = () => {
  const { id } = useParams(); // Get the id from URL parameters
  const [story, setStory] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getStoryDetails = async () => {
      try {
        const response = await axiosInstance.get(`/get-travel-story/${id}`); // Update the endpoint as per your API
        setStory(response.data.story);
        console.log("Story details fetched successfully:", response.data.story);
      } catch (error) {
        console.error("Failed to fetch story details:", error);
      }
    };

    getStoryDetails();
  }, [id]);

  const nav = () => {
    navigate("/all"); // Navigate to /dashboard
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <button
        onClick={nav} // Navigate to /dashboard
        className="cursor-pointer absolute top-9 left-6 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition duration-300"
      >
        Back
      </button>
      {story ? (
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6 shadow-cyan-400">
          <h3 className="text-3xl font-semibold text-gray-900 hover:text-cyan-500 transition duration-300">
            {story.title}
          </h3>
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-85 object-cover rounded-lg border border-gray-200 my-4 hover:scale-105 transition-transform duration-300"
          />
          <p className="text-lg text-gray-700 mb-4">{story.story}</p>
          <div className="text-sm text-gray-600">
            Visited on: {new Date(story.visitedDate).toLocaleDateString()} |{" "}
            Location: {story.visitedLocation.join(", ")} | Created on:{" "}
            {new Date(story.createdOn).toLocaleDateString()}
          </div>
          <div className="mt-2">
            {story.isFavourite ? (
              <span className="text-cyan-500 font-bold">💙 Favourite</span>
            ) : (
              <span className="text-gray-500 font-medium">Not a Favourite</span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">
          Loading story details...
        </p>
      )}
    </div>
  );
};

export default SeeDetails;
