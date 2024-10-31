require("dotenv").config();

const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const config = require("./config.json");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");

mongoose.connect(config.connectionString);

const User = require("./models/user.models");
const TravelStory = require("./models/travelstory.model");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required." });
  }

  const isUser = await User.findOne({ email });
  if (isUser) {
    return res
      .status(400)
      .json({ error: true, message: "User already exists." });
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ fullName, email, password: hashedPassword });

  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "72h",
    }
  );

  return res.status(201).json({
    error: false,
    message: {
      fullName: user.fullName,
      email: user.email,
    },
    accessToken,
    message: "Registration Successful",
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required." });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: true, message: "User not found." });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid credentials." });
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "72h",
    }
  );

  return res.status(200).json({
    error: false,
    message: "Login Successful",
    user: {
      fullName: user.fullName,
      email: user.email,
    },
    accessToken,
  });
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  const isUser = await User.findOne({ _id: userId });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: isUser,
    message: "",
  });
});

// Route to handle image Upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: "No Image uploaded" });
    }

    const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;

    res.status(200).json({
      error: false,
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error uploading image" });
  }
});

// Delete an image from uploads folder
app.delete("/delete-image", async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: true, message: "No image provided" });
  }

  try {
    // Extract filename from URL
    const filename = path.basename(imageUrl);

    // Define the file path
    const filePath = path.join(__dirname, "uploads", filename);

    // check if the file exists
    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlinkSync(filePath);
      return res
        .status(200)
        .json({ error: false, message: "Image deleted successfully" });
    } else {
      return res.status(404).json({ error: true, message: "Image not found" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error deleting image" });
  }
});

// Serve static files from the uploads ans assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "uploads")));

// Add Travel Story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  // Validate required fields
  if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required." });
  }
  const parsedVisitedDate = new Date(parseInt(visitedDate));

  try {
    const travelStory = new TravelStory({
      title,
      story,
      visitedLocation,
      imageUrl,
      visitedDate: parsedVisitedDate,
      userId,
    });

    await travelStory.save();

    return res.status(201).json({
      error: false,
      message: "Travel Story added successfully",
      story: travelStory,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ error: true, message: "Error adding travel story." });
  }
});

// Get All Travel Stories
app.get("/get-all-travel-stories", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const travelStories = await TravelStory.find({ userId: userId }).sort({
      isFavourite: -1,
    });

    return res.status(200).json({
      message: "Travel Stories fetched successfully",
      stories: travelStories,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error fetching travel stories." });
  }
});

// Edit Travel Story
app.put("/edit-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  // Validate required fields
  if (!title || !story || !visitedLocation || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required." });
  }
  // convert visitedDate from milliseconds to Date
  const parsedVisitedDate = new Date(parseInt(visitedDate));

  try {
    const travelstory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelstory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel Story not found." });
    }

    const placeholderimg = `https://localhost:8000/assets/travel.png`;

    travelstory.title = title;
    travelstory.story = story;
    travelstory.visitedLocation = visitedLocation;
    travelstory.imageUrl = imageUrl || placeholderimg;
    travelstory.visitedDate = parsedVisitedDate;
    await travelstory.save();

    res.status(200).json({
      error: false,
      message: "Travel Story updated successfully",
      story: travelstory,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: true, message: "Error updating travel story." });
  }
});

// Delete Travel Story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel Story not found." });
    }

    // Delete the travel story from the database
    await travelStory.deleteOne({ _id: id, userId: userId });

    // Extract the file name from the imageUrl
    const imageUrl = travelStory.imageUrl;
    const filename = path.basename(imageUrl);

    // define the file path
    const filePath = path.join(__dirname, "uploads", filename);

    // Delete the image file from uploads folder
    fs.unlink(filePath, (err) => {
      if (err) console.error("Falied to delete", err);
      else console.log(`Deleted ${filename}`);
    });

    res.status(200).json({
      error: false,
      message: "Travel Story deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: true, message: "Error deleting travel story." });
  }
});

// Update isfavourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { isFavourite } = req.body;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel Story not found." });
    }

    travelStory.isFavourite = isFavourite;

    await travelStory.save();

    res.status(200).json({
      error: false,
      message: "Favourite status updated successfully",
      story: travelStory,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: true, message: "Error updating favourite status." });
  }
});

// Search Travel Stories
app.get("/search", authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required." }); // Return 400 Bad Request if query is not provided.
  }

  try {
    const searchResults = await TravelStory.find({
      userId: userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { visitedLocation: { $regex: query, $options: "i" } },
      ],
    }).sort({ isFavourite: -1 });
    //   .limit(10);

    return res.status(200).json({
      message: "Travel Stories fetched successfully",
      stories: searchResults,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error fetching travel stories." });
  }
});

// Filter Travel Stories by data range
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const { startDate, endDate } = req.query;

  try {
    // Convert startdate and enddate from milliseconds to Date objects
    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));

    const filteredStories = await TravelStory.find({
      userId: userId,
      visitedDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 });

    return res.status(200).json({
      message: "Travel Stories fetched successfully",
      stories: filteredStories,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error fetching travel stories." });
  }
});

// Get All Travel Stories by All Users
app.get("/get-all-user-travel-stories", authenticateToken, async (req, res) => {
  try {
    const travelStories = await TravelStory.find().sort({ isFavourite: -1 });

    return res.status(200).json({
      message: "All Travel Stories fetched successfully",
      stories: travelStories,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error fetching all travel stories." });
  }
});

// Get All Travel Stories by Other Users
app.get("/get-all-stories-other-users", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const travelStories = await TravelStory.find({
      userId: { $ne: userId }  // Exclude stories by the logged-in user
    }).sort({ isFavourite: -1 });

    return res.status(200).json({
      message: "Travel Stories by other users fetched successfully",
      stories: travelStories,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error fetching travel stories by other users." });
  }
});


// Get Travel Story by ID
app.get("/get-travel-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    // Find the travel story by ID and userId
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res.status(404).json({ error: true, message: "Travel Story not found." });
    }

    return res.status(200).json({
      error: false,
      message: "Travel Story fetched successfully",
      story: travelStory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: "Error fetching travel story." });
  }
});

app.listen(8000, console.log("Server running"));
module.exports = app;
