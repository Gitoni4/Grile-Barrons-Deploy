/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DailyExamSchema = new Schema(
  {
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    isCompleted: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyExam", DailyExamSchema);
