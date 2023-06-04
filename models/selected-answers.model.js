/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SelectedAnswerSchema = new Schema({
  question: { type: Schema.Types.ObjectId, ref: "Question" },
  selectedOption: {
    type: Number,
    required: true,
    min: [0, "Option number must be at least 0"],
    max: [2, "Option number must be less than or equal to 2"],
  },
});
