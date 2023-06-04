/* eslint-disable no-undef */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-var-requires */

const XLSX = require("xlsx");
const Exam = require("../models/exam.model");
const Question = require("../models/question.model");
const User = require("../models/user.model");
const DailyExam = require("../models/daily-exam.model");
const DailyUserExam = require("../models/daily-user-exam.model");

exports.createExam = async (req, res) => {
  const { userId, examType, totalQuestions, difficulty, chapters } = req.body;

  try {
    let questions = [];
    switch (examType) {
      case "quick":
        const halfQuestions = Math.ceil(totalQuestions / 2);
        const easyQuestions = await Question.aggregate([
          { $match: { difficulty: "easy" } },
          { $sample: { size: halfQuestions } },
        ]);
        const hardQuestions = await Question.aggregate([
          { $match: { difficulty: "hard" } },
          { $sample: { size: totalQuestions - easyQuestions.length } },
        ]);
        questions = [...easyQuestions, ...hardQuestions];
        break;

      case "custom":
        let pipeline;
        if (difficulty === "both") {
          const halfQuestions = Math.ceil(totalQuestions / 2);
          const easyQuestions = await Question.aggregate([
            { $match: { difficulty: "easy", chapter: { $in: chapters } } },
            { $sample: { size: halfQuestions } },
          ]);
          const hardQuestions = await Question.aggregate([
            { $match: { difficulty: "hard", chapter: { $in: chapters } } },
            { $sample: { size: totalQuestions - easyQuestions.length } },
          ]);
          questions = [...easyQuestions, ...hardQuestions];
        } else {
          pipeline = [
            { $match: { difficulty: difficulty, chapter: { $in: chapters } } },
            { $sample: { size: totalQuestions } },
          ];
          questions = await Question.aggregate(pipeline);
        }
        break;

      case "simulation":
        this.totalQuestions = 50;
        const simulationHalfQuestions = 25;

        const simulationEasyQuestions = await Question.aggregate([
          { $match: { difficulty: "easy" } },
          { $sample: { size: simulationHalfQuestions } },
        ]);

        const simulationHardQuestions = await Question.aggregate([
          { $match: { difficulty: "hard" } },
          { $sample: { size: simulationHalfQuestions } },
        ]);

        questions = [...simulationEasyQuestions, ...simulationHardQuestions];
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid exam type",
        });
    }

    const newExam = new Exam({
      creator: userId,
      examType,
      totalQuestions,
      difficulty,
      questions: questions.map((question) => question._id),
    });

    await newExam.save();
    await User.findByIdAndUpdate(userId, { $push: { exams: newExam._id } });

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam: newExam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the exam",
      error: error.message,
    });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { userId, examId, selectedAnswers } = req.body;
    const exam = await Exam.findById(examId).populate("questions");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    let correctAnswersCount = 0;
    const wrongAnswers = [];

    exam.questions.forEach((question, index) => {
      const userAnswers = selectedAnswers[index];
      const correctAnswers = question.answers
        .map((answer, i) => (answer.isCorrect ? i : -1))
        .filter((index) => index !== -1);

      const isCorrect =
        JSON.stringify(userAnswers.sort()) ===
        JSON.stringify(correctAnswers.sort());

      if (isCorrect) {
        correctAnswersCount++;
      } else {
        wrongAnswers.push({
          question: question._id,
          selectedAnswers: userAnswers,
        });
      }
    });

    const score = (correctAnswersCount / exam.questions.length) * 100;

    exam.isCompleted = true;
    await exam.save();

    res.status(200).json({
      success: true,
      message: "Exam submitted successfully.",
      score: score,
      wrongAnswers: wrongAnswers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while submitting the exam.",
      error: error.message,
    });
  }
};

exports.submitDailyExam = async function (req, res) {
  const { userId, examId, selectedAnswers } = req.body;

  try {
    let dailyUserExam = await DailyUserExam.findOne({
      user: userId,
      dailyExam: examId,
    });
    if (!dailyUserExam) {
      return res.status(404).send({ message: "Exam not found" });
    }

    dailyUserExam.selectedAnswers = selectedAnswers;
    dailyUserExam.dateCompleted = new Date();
    await dailyUserExam.save();

    const user = await User.findById(userId);

    user.dailyExamsSolved.push({
      _id: dailyUserExam._id,
      date: dailyUserExam.dateCompleted,
    });

    await user.save();

    res.status(200).send({ message: "Exam submitted successfully" });
  } catch (error) {
    console.error("An error occurred while submitting the daily exam:", error);
    res
      .status(500)
      .send({ message: "An error occurred while submitting the daily exam" });
  }
};

exports.saveResponses = async (req, res) => {
  try {
    const { userId, examId, selectedAnswers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (exam.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit this exam",
      });
    }

    exam.selectedAnswers = selectedAnswers;
    await exam.save();

    return res.status(200).json({
      success: true,
      message: "Responses saved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while saving responses",
      error: error.message,
    });
  }
};

exports.saveDailyExamResponses = async function (req, res) {
  const { userId, examId, selectedAnswers } = req.body;
  const userExam = await DailyUserExam.findOne({
    user: userId,
    dailyExam: examId,
  });

  if (userExam) {
    userExam.selectedAnswers = selectedAnswers;
    userExam.dateCompleted = new Date();
    await userExam.save();
    res.status(200).json({ message: "Responses saved successfully." });
  } else {
    const newDailyUserExam = new DailyUserExam({
      user: userId,
      dailyExam: examId,
      selectedAnswers: selectedAnswers,
    });

    await newDailyUserExam.save();
    res.status(200).json({ message: "Responses saved successfully." });
  }
};

exports.getExam = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const exam = await Exam.findOne({ creator: userId })
      .sort({ createdAt: -1 })
      .populate("questions");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the exam",
      error: error.message,
    });
  }
};

exports.getDailyExam = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate("dailyExamsSolved");

    const hasSolvedToday = user.dailyExamsSolved.some((de) => {
      const examDate = new Date(de.date);
      const today = new Date();
      return examDate.toDateString() === today.toDateString();
    });

    if (hasSolvedToday) {
      return res.json({ success: true, hasSolvedToday });
    }

    const dailyExam = await DailyExam.findOne().sort("-date").populate("exam");
    if (!dailyExam) {
      return res
        .status(404)
        .json({ success: false, message: "No daily exam found." });
    }

    const exam = await Exam.findById(dailyExam._id).populate("questions");
    res.json({ success: true, exam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getDailyExamVerification = async (req, res) => {
  try {
    const dailyExam = await DailyExam.findOne().sort("-date").populate("exam");
    if (!dailyExam) {
      return res
        .status(404)
        .json({ success: false, message: "No daily exam found." });
    }
    const exam = await Exam.findById(dailyExam._id).populate("questions");
    res.json({ success: true, exam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createDailyExam = async (req, res) => {
  const chapters = await Question.distinct("chapter");

  const examQuestions = [];

  for (let i = 0; i < chapters.length; i++) {
    const easyQuestion = await Question.findOne({
      chapter: chapters[i],
      difficulty: "easy",
    }).sort(() => Math.random() - 0.5);
    const hardQuestion = await Question.findOne({
      chapter: chapters[i],
      difficulty: "hard",
    }).sort(() => Math.random() - 0.5);
    if (easyQuestion) examQuestions.push(easyQuestion);
    if (hardQuestion) examQuestions.push(hardQuestion);
    if (examQuestions.length >= 10) break;
  }

  const newExam = new Exam({
    questions: examQuestions,
    examType: "daily",
    totalQuestions: examQuestions.length,
    difficulty: "both",
  });
  await newExam.save();

  const newDailyExam = new DailyExam({ exam: newExam._id });
  await newDailyExam.save();

  res.json({
    success: true,
    message: "Daily Exam Created",
    exam: newDailyExam,
  });
};

exports.uploadQuestions = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    processRowsAndSaveQuestions(rows);

    res
      .status(200)
      .json({ message: "File uploaded and processed successfully" });
  } catch (error) {
    console.error("An error occurred while processing the file:", error);
    res.status(500).json({
      message: "An error occurred while processing the file",
      error: error.message,
    });
  }
};

exports.dailyExamStatus = async (req, res) => {
  const { userId, examId } = req.params;

  try {
    const dailyUserExam = await DailyUserExam.findOne({
      user: userId,
      dailyExam: examId,
    });

    if (dailyUserExam) {
      res.json({
        status: "success",
        isCompleted: dailyUserExam.dateCompleted !== null,
      });
    } else {
      res.json({
        status: "success",
        isCompleted: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while checking the daily exam status",
    });
  }
};

exports.getDailyUserExam = async (req, res) => {
  const { userId, examId } = req.params;

  try {
    const dailyUserExam = await DailyUserExam.findOne({
      user: userId,
      dailyExam: examId,
    }).populate("dailyExam");

    if (dailyUserExam) {
      res.json({
        status: "success",
        exam: dailyUserExam,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Daily exam for the user does not exist",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching the daily user exam",
    });
  }
};

const processRowsAndSaveQuestions = async (rows) => {
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    const questionText = row[0];
    const answers = [
      { answer: row[1], isCorrect: row[2] === 1 },
      { answer: row[3], isCorrect: row[4] === 1 },
      { answer: row[5], isCorrect: row[6] === 1 },
      { answer: row[7], isCorrect: row[8] === 1 },
    ];
    const difficulty = row[9];
    const chapter = row[10];

    const question = new Question({
      questionText: questionText,
      answers: answers,
      difficulty: difficulty,
      chapter: chapter,
    });

    await question.save();
  }
};
