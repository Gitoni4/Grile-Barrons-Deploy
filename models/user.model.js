/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-var-requires */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [5, "Username must be at least 5 characters long"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["basicUser", "premiumUser", "admin"],
    default: "basicUser",
  },
  dailyExamsSolved: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "DailyUserExam" },
      date: { type: Date, default: Date.now },
    },
  ],
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;

  next();
});

// UserSchema.pre("findOneAndUpdate", async function (next) {
//   const userUpdate = this.getUpdate().$set;

//   if (!userUpdate.password) return next();

//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(userUpdate.password, salt);
//   userUpdate.password = hashedPassword;

//   next();
// });

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
