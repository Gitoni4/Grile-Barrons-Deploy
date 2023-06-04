/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require("mongoose");
const SelectedAnswerSchema = require("./selected-answers.model");
const Schema = mongoose.Schema;

const ExamSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    examType: {
      type: String,
      enum: ["custom", "quick", "simulation"],
      required: true,
    },
    totalQuestions: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "hard", "both"],
      required: true,
    },
    selectedAnswers: [SelectedAnswerSchema],
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", ExamSchema);
