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



app.listen(5001, () => {
    console.log("Node js server started.");
});