import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/adminAuth";

import dashboardRouter from "./dashboard";
import questionsRouter from "./questions";

import examsRouter from "./exams";
import studentsRouter from "./students";
import analyticsRouter from "./analytics";
import activityLogsRouter from "./activityLogs";
import settingsRouter from "./settings";
import supportTicketsRouter from "./supportTickets";
import announcementsRouter from "./announcements";
import currentAffairsRouter from "./currentAffairs";
import quizzesRouter from "./quizzes";
import mockTestsRouter from "./mockTests";
import studyNotesRouter from "./studyNotes";
import ncertBooksRouter from "./ncertBooks";
import pyqSubjectsRouter from "./pyqSubjects";
import dailyQuizRouter from "./dailyQuiz";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.use(dashboardRouter);
router.use(questionsRouter);

router.use(examsRouter);
router.use(studentsRouter);
router.use(analyticsRouter);
router.use(activityLogsRouter);
router.use(settingsRouter);
router.use(supportTicketsRouter);
router.use(announcementsRouter);
router.use(currentAffairsRouter);
router.use(quizzesRouter);
router.use(mockTestsRouter);
router.use(studyNotesRouter);
router.use(ncertBooksRouter);
router.use(pyqSubjectsRouter);
router.use(dailyQuizRouter);

export default router;
