require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGO_URL;

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((e) => {
    console.log(e);
  });

require("./UserDetails");
const User = mongoose.model("UserInfo");

require("./EventDetails");
const Event = mongoose.model("EventInfo");

app.get("/", (req, res) => {
  res.send({ status: "Started" });
});



app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const oldUser = await User.findOne({ username: username });

  if (oldUser) {
    return res.send({ data: "User already exists!!" });
  }

  try {
    await User.create({
      username: username,
      password: password,
    });
    res.send({ status: "ok", data: "User Created" });
  } catch (error) {
    res.send({ status: "error", data: error });
  }
});



app.post("/login-user", async (req, res) => {
  const { username, password } = req.body;

  const oldUser = await User.findOne({ username: username });

  if (!oldUser) {
    return res.send({ data: "User doesn't exists!!" });
  }

  if (password === oldUser.password) {
    return res.send({
      status: 'ok',
      data: 'Login successful'
    });
  } else {
    return res.send({ status: 'error', data: 'Invalid password' });
  }
});



app.post("/create-event", async (req, res) => {
  const { eventName, eventDate, promptTitle, prompt, negativePrompt } = req.body;

  const oldEvent = await Event.findOne({ event_name: eventName });

  if (oldEvent) {
    return res.send({ status: "error", data: "Event name must be unique" });
  }

  try {
    const newEvent = await Event.create({
      event_name: eventName,
      event_date: eventDate,
      promptTitle: promptTitle,
      prompt: prompt,
      negative_prompt: negativePrompt,
    });
    res.send({ status: "ok", data: newEvent });
  } catch (error) {
    res.send({ status: "error", data: error });
  }
});



app.get("/events", async (req, res) => {
  try {
    const events = await Event.find({});
    res.send({ status: "ok", data: events });
  } catch (error) {
    res.send({ status: "error", data: error });
  }
});



app.post("/update-event", async (req, res) => {
  const { eventID, eventName, eventDate, promptTitle, prompt, negativePrompt } = req.body;

  try {
    const event = await Event.findOneAndUpdate(
      { _id: eventID },
      {
        event_name: eventName,
        event_date: eventDate,
        promptTitle: promptTitle,
        prompt: prompt,
        negative_prompt: negativePrompt,
      },
      { new: true }
    );

    if (!event) {
      return res.send({ status: "error", data: "Event not found" });
    }

    res.send({ status: "ok", data: "Event updated successfully" });
  } catch (error) {
    res.send({ status: "error", data: error });
  }
});



app.post("/add-photo", async (req, res) => {
  const { eventID, imageUrl, phoneNumber, email } = req.body;

  try {
    const event = await Event.findOne({ _id: eventID });
    if (!event) {
      return res.send({ status: "error", data: "Event not found" });
    }

    // Push the new photo details into the event_gallery array
    event.event_gallery.push({
      imageUrl: imageUrl,
      phoneNumber: phoneNumber || null,
      email: email || null,
      sent: null,
      uploadedAt: new Date(),
    });

    await event.save();
    res.send({ status: "ok", data: "Photo added to event gallery successfully" });
  } catch (error) {
    res.send({ status: "error", data: error });
  }
});

app.listen(5001, () => {
    console.log("Node js server started.");
});