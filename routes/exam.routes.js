/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const router = express.Router();
const checkJwt = require("../middlewares/check-jwt");
const { createExam } = require("../controllers/exam.controller");
const { submitExam } = require("../controllers/exam.controller");
const { getExam } = require("../controllers/exam.controller");
const { saveResponses } = require("../controllers/exam.controller");
const { saveDailyExamResponses } = require("../controllers/exam.controller");
const { dailyExamStatus } = require("../controllers/exam.controller");
const { submitDailyExam } = require("../controllers/exam.controller");
const { getDailyExam } = require("../controllers/exam.controller");
const { uploadQuestions } = require("../controllers/exam.controller");
const { uploadExamFile } = require("../middlewares/multer-middleware");
const { getDailyUserExam } = require("../controllers/exam.controller");
const { getDailyExamVerification } = require("../controllers/exam.controller");

router.get("/solve", checkJwt, getExam);
router.get("/daily", checkJwt, getDailyExam);
router.get("/daily/verification", checkJwt, getDailyExamVerification);
router.get("/daily/status/:userId/:examId", dailyExamStatus);
router.get("/daily/user-exam/:userId/:examId", getDailyUserExam);

router.patch("/save-responses", saveResponses);
router.patch("/daily/save-responses", saveDailyExamResponses);

router.post("/submit", submitExam);
router.post("/daily/submit", submitDailyExam);
router.post("/create-exam", checkJwt, createExam);
router.post("/upload-exam", uploadExamFile, uploadQuestions);

module.exports = router;
