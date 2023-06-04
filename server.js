/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const examRoutes = require("./routes/exam.routes");
const app = express();
const port = process.env.PORT;
const mongoose = require("mongoose");
const cron = require("node-cron");
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

app.use(cors());
app.use(express.static(process.cwd() + "/dist/grileprod"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);

app.get("/*", (req, res) => {
  res.sendFile(process.cwd() + "/dist/grileprod/index.html");
});

app.listen(port, () => {
  console.log(`Running on:${port}`);
});
