import { Router } from "express";
import { requireAdmin } from "../../middlewares/adminMiddleware";
import dashboardRouter from "./dashboard";
import questionsRouter from "./questions";
import draftsRouter from "./drafts";
import examsRouter from "./exams";
import studentsRouter from "./students";
import analyticsRouter from "./analytics";
import activityLogsRouter from "./activityLogs";

const router = Router();

router.use(requireAdmin);

router.use(dashboardRouter);
router.use(questionsRouter);
router.use(draftsRouter);
router.use(examsRouter);
router.use(studentsRouter);
router.use(analyticsRouter);
router.use(activityLogsRouter);

export default router;
