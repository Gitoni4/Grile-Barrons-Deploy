/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require("mongoose");
const SelectedAnswerSchema = require("./selected-answers.model");
const Schema = mongoose.Schema;

const DailyUserExamSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    dailyExam: { type: Schema.Types.ObjectId, ref: "DailyExam" },
    selectedAnswers: [SelectedAnswerSchema],
    dateCompleted: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyUserExam", DailyUserExamSchema);
