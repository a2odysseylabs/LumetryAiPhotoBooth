const mongoose = require("mongoose");

const EventDetailsSchema = new mongoose.Schema(
  {
    event_name: { type: String, unique: true },
    event_date: Date,
    promptTitle: String,
    prompt: String,
    negative_prompt: String,
    event_gallery: { type: Array, default: [] },
  },
  {
    collection: "EventInfo",
  }
);
mongoose.model("EventInfo", EventDetailsSchema);