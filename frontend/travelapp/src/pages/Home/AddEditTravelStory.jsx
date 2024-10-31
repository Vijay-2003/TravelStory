import React, { useState } from "react";
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from "react-icons/md";
import DateSelector from "../../components/input/DateSelector";
import ImageSelector from "../../components/input/ImageSelector";
import TagInput from "../../components/input/TagInput";
import axiosInstance from "../../utils/axiosinstance";
import moment from "moment";
import { toast } from "react-toastify";
import uploadImage from "../../utils/uploadImage";

const AddEditTravelStory = ({
  storyInfo,
  type,
  onClose,
  getAllTravelStories,
}) => {
  const [title, setTitle] = useState(storyInfo?.title || "");
  const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
  const [story, setStory] = useState(storyInfo?.story || "");
  const [visitedLocation, setVisitedLocation] = useState(
    storyInfo?.visitedLocation || []
  );
  const [visitedDate, setVistedDate] = useState(storyInfo?.visitedDate || null);

  const [error, setError] = useState("");

  const addNewTravelStory = async () => {
    // add new story details
    try {
      let imageUrl = "";

      if (storyImg) {
        const imgUploadRes = await uploadImage(storyImg);
        // get image url
        imageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post("/add-travel-story", {
        title,
        story,
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
        imageUrl: imageUrl || "",
      });

      if (response.data && response.data.story) {
        toast.success("Story Added Successfully");

        // refresh stories
        getAllTravelStories();
        // clode modal or form
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An Unexpected error occurred. Please try again");
      }
    }
  };

  const updateTravelStory = async () => {
    // update story details
    const storyId = storyInfo._id;

    try {
      let imageUrl = "";

      let postData = {
        title,
        story,
        imageUrl: storyInfo.imageUrl || "",
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
      };
      if (typeof storyImg === "object") {
        // upload new img
        const imgUploadRes = await uploadImage(storyImg);
        // get image url
        imageUrl = imgUploadRes.imageUrl || "";
        // postData.imageUrl = imageUrl;
        postData = {
          ...postData,
          imageUrl: imageUrl,
        };
      }

      const response = await axiosInstance.put(
        "/edit-story/" + storyId,
        postData
      );

      if (response.data && response.data.story) {
        toast.success("Story Updated Successfully");
        // refresh stories
        getAllTravelStories();
        // clode modal or form
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An Unexpected error occurred. Please try again");
      }
    }
  };

  const handleAddOrUpdateClick = () => {
    if (!title) {
      setError("Please enter the title");
    }
    if (!story) {
      setError("Please enter the story");
    }

    setError("");

    if (type === "edit") {
      updateTravelStory();
    } else {
      addNewTravelStory();
    }
  };

  // delete story image and update the story
  const handleDeleteStoryImg = async () => {
    // delete image from server
    const deleteImgRes = await axiosInstance.delete("/delete-image", {
      params: {
        imageUrl: storyInfo.imageUrl,
      },
    });

    if (deleteImgRes.data) {
      const storyId = storyInfo._id;

      const postData = {
        title,
        story,
        visitedLocation,
        visitedDate: moment().valueOf(),
        imageUrl: "",
      };

      // Updating Story
      const response = await axiosInstance.put(
        "/edit-story/" + storyId,
        postData
      );

      setStoryImg(null);
    }
  };

  return (
    <div className="relative">
      <div className=" flex items-center justify-between">
        <h5 className=" text-xl font-medium text-slate-700">
          {type === "add" ? "Add Story" : "Update Story"}
        </h5>

        <div>
          <div className=" flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
            {type === "add" ? (
              <button className=" btn-small" onClick={addNewTravelStory}>
                <MdAdd className=" text-lg " /> ADD STORY
              </button>
            ) : (
              <>
                <button className=" btn-small" onClick={handleAddOrUpdateClick}>
                  <MdUpdate className=" text-lg" /> UPDATE STORY
                </button>

                {/* <button className=" btn-small btn-delete" onClick={onClose}>
                  <MdDeleteOutline className=" text-lg" /> DELETE
                </button> */}
              </>
            )}

            <button className="" onClick={onClose}>
              <MdClose className=" text-lg text-slate-400" />
            </button>
          </div>

          {error && (
            <p className=" text-red-500 text-xs pt-2 text-right">{error}</p>
          )}
        </div>
      </div>

      <div>
        <div className=" flex-1 flex flex-col gap-2 pt-4">
          <label className=" input-label">TITLE</label>
          <input
            type="text"
            className="text-2xl text-slate-950 outline-none"
            placeholder="A Day at the Great Wall"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />

          <div className="my-3">
            <DateSelector date={visitedDate} setDate={setVistedDate} />
          </div>

          <ImageSelector
            image={storyImg}
            setImage={setStoryImg}
            handleDeleteImg={handleDeleteStoryImg}
          />

          <div className=" flex flex-col gap-2 mt-4">
            <label className=" input-label">STORY</label>
            <textarea
              type="text"
              className=" text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
              placeholder="Your Story"
              rows={10}
              value={story}
              onChange={({ target }) => setStory(target.value)}
            />
          </div>

          <div className="pt-3">
            <label className=" input-label">VISITED LOCATIONS</label>
            <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditTravelStory;
