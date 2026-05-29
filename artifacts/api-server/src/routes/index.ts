import { Router, type IRouter } from "express";
import healthRouter from "./health";
import statsRouter from "./stats";
import quizzesRouter from "./quizzes";
import currentAffairsRouter from "./currentAffairs";
import studyNotesRouter from "./studyNotes";
import pyqRouter from "./pyq";
import ncertRouter from "./ncert";
import papersRouter from "./papers";
import supportRouter from "./support";

const router: IRouter = Router();

router.use(healthRouter);
router.use(statsRouter);
router.use(quizzesRouter);
router.use(currentAffairsRouter);
router.use(studyNotesRouter);
router.use(pyqRouter);
router.use(ncertRouter);
router.use(papersRouter);
router.use(supportRouter);

export default router;
