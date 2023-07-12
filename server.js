/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const examRoutes = require("./routes/exam.routes");
const app = express();
const port = process.env.PORT;
const mongoose = require("mongoose");
const cron = require("node-cron");
const session = require("express-session")

const passport = require("passport")
require("./middlewares/googleAuth")(passport)

const examController = require("./controllers/exam.controller");

const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(
    "mongodb+srv://grile-barrons-root:EqMS5EuuxMXKC32h@grile-barrons-cluster.cds7iju.mongodb.net/grile-barrons?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

app.use(cors({ origin: '*' }));

cron.schedule("0 0 * * *", async () => {
  try {
    // Call the function to create the daily exam
    await examController.createDailyExam();
    console.log("Daily exam created successfully");
  } catch (error) {
    console.error("Failed to create daily exam", error);
  }
});

app.use(express.static(process.cwd() + "/dist"));

app.use(session({ 
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);

app.get("/*", (req, res) => {
  res.sendFile(process.cwd() + "/dist/index.html");
});

app.listen(port, () => {
  console.log(`Running on:${port}`);
});
