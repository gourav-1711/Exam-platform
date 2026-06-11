import { Router } from "express";
import { listDocumentPyp } from "../controllers/web/documentPypController";

const router = Router();

router.get("/", listDocumentPyp);

export default router;
