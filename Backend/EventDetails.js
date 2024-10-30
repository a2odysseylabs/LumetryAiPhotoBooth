const mongoose = require("mongoose");

const EventDetailsSchema = new mongoose.Schema(
  {
    unique_id: { type: String, unique: true },
    event_name: { type: String, unique: true },
    event_date: Date,
    promptTitle: String,
    prompt: String,
    negative_prompt: String,
    event_logo: { type: String, default: '' },
    logo_placement: { type: String, default: '' },
    event_gallery: { type: Array, default: [] },
    promptsList: { type: [String], default: [] },
  },
  {
    collection: "EventInfo",
  }
);
mongoose.model("EventInfo", EventDetailsSchema);