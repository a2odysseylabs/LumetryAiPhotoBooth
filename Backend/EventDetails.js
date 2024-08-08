const mongoose = require("mongoose");

const EventDetailsSchema = new mongoose.Schema(
  {
    event_name: { type: String, unique: true },
    event_date: Date,
    prompt: String,
    negative_prompt: String
  },
  {
    collection: "EventInfo",
  }
);
mongoose.model("EventInfo", EventDetailsSchema);