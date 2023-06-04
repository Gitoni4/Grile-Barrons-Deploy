/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  answer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const QuestionSchema = new Schema(
  {
    questionText: {
      type: String,
      required: true,
    },
    answers: {
      type: [AnswerSchema],
    },
    difficulty: {
      type: String,
      enum: ["easy", "hard"],
      required: true,
    },
    chapter: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
