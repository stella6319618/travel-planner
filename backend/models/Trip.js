const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  date: Date,
  transportation: {
    air: String,
    land: String,
    sea: String,
  },
  accommodation: {
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  activities: [
    {
      title: String,
      description: String,
      time: String,
      location: String,
      cost: Number,
    },
  ],
  meals: {
    breakfast: {
      restaurant: String,
      location: String,
      url: String,
    },
    lunch: {
      restaurant: String,
      location: String,
      url: String,
    },
    dinner: {
      restaurant: String,
      location: String,
      url: String,
    },
  },
  notes: String,
});

const tripSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  days: [daySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Trip", tripSchema);
