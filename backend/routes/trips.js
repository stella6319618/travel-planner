const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const axios = require("axios");
const auth = require("../middleware/auth");

// 地理編碼路由
router.get("/geocode", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ message: "請提供地址" });
    }

    console.log("正在查詢地址:", address);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "TravelApp/1.0", // 添加 User-Agent 以符合 Nominatim 的使用條款
        },
      }
    );

    console.log("地理編碼回應:", response.data);

    if (response.data && response.data[0]) {
      res.json({
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
      });
    } else {
      res.status(404).json({ message: "找不到該地址" });
    }
  } catch (error) {
    console.error("地理編碼錯誤:", error.message);
    if (error.response) {
      console.error("錯誤回應:", error.response.data);
      res.status(error.response.status).json({
        message: "地理編碼服務錯誤",
        details: error.response.data,
      });
    } else {
      res.status(500).json({
        message: "地理編碼服務暫時無法使用",
        details: error.message,
      });
    }
  }
});

// Get all trips
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const trips = await Trip.find({ user: userId }).sort({ startDate: 1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single trip
router.get("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id, // 確保只能查自己資料
    });

    if (!trip) {
      return res
        .status(404)
        .json({ message: "Trip not found or unauthorized" });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new trip
router.post("/", auth, async (req, res) => {
  const userId = req.user.id;

  const trip = new Trip({
    user: userId,
    destination: req.body.destination,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    days: [],
  });

  // 同樣產生每一天
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    trip.days.push({
      date: new Date(currentDate),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  try {
    const newTrip = await trip.save();
    res.status(201).json(newTrip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a trip
router.patch("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res
        .status(404)
        .json({ message: "Trip not found or unauthorized" });
    }

    // 更新欄位
    if (req.body.destination) trip.destination = req.body.destination;
    if (req.body.startDate) trip.startDate = req.body.startDate;
    if (req.body.endDate) trip.endDate = req.body.endDate;
    if (req.body.days) trip.days = req.body.days;

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a specific day in a trip
router.patch("/:id/days/:dayIndex", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const dayIndex = parseInt(req.params.dayIndex);
    if (dayIndex < 0 || dayIndex >= trip.days.length) {
      return res.status(400).json({ message: "Invalid day index" });
    }

    // Update the specific day
    const day = trip.days[dayIndex];
    if (req.body.transportation) day.transportation = req.body.transportation;
    if (req.body.accommodation) day.accommodation = req.body.accommodation;
    if (req.body.activities) day.activities = req.body.activities;
    if (req.body.meals) day.meals = req.body.meals;
    if (req.body.notes) day.notes = req.body.notes;

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a new activity to a specific day
router.post("/:id/days/:dayIndex/activities", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const dayIndex = parseInt(req.params.dayIndex);
    if (dayIndex < 0 || dayIndex >= trip.days.length) {
      return res.status(400).json({ message: "Invalid day index" });
    }

    const day = trip.days[dayIndex];
    if (!day.activities) {
      day.activities = [];
    }

    day.activities.push(req.body);
    const updatedTrip = await trip.save();
    res.status(201).json(updatedTrip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a specific activity in a day
router.patch(
  "/:id/days/:dayIndex/activities/:activityIndex",
  async (req, res) => {
    try {
      const trip = await Trip.findById(req.params.id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const dayIndex = parseInt(req.params.dayIndex);
      const activityIndex = parseInt(req.params.activityIndex);

      if (dayIndex < 0 || dayIndex >= trip.days.length) {
        return res.status(400).json({ message: "Invalid day index" });
      }

      const day = trip.days[dayIndex];
      if (
        !day.activities ||
        activityIndex < 0 ||
        activityIndex >= day.activities.length
      ) {
        return res.status(400).json({ message: "Invalid activity index" });
      }

      day.activities[activityIndex] = {
        ...day.activities[activityIndex],
        ...req.body,
      };

      const updatedTrip = await trip.save();
      res.json(updatedTrip);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a specific activity from a day
router.delete(
  "/:id/days/:dayIndex/activities/:activityIndex",
  async (req, res) => {
    try {
      const trip = await Trip.findById(req.params.id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const dayIndex = parseInt(req.params.dayIndex);
      const activityIndex = parseInt(req.params.activityIndex);

      if (dayIndex < 0 || dayIndex >= trip.days.length) {
        return res.status(400).json({ message: "Invalid day index" });
      }

      const day = trip.days[dayIndex];
      if (
        !day.activities ||
        activityIndex < 0 ||
        activityIndex >= day.activities.length
      ) {
        return res.status(400).json({ message: "Invalid activity index" });
      }

      day.activities.splice(activityIndex, 1);
      const updatedTrip = await trip.save();
      res.json(updatedTrip);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a trip
router.delete("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // 確保是自己的 trip 才能刪
    });

    if (!trip) {
      return res.status(404).json({ message: "找不到此旅程或無權限刪除" });
    }

    res.json({ message: "旅程已刪除" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
