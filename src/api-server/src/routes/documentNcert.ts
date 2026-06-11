import { Router } from "express";
import { listDocumentNcert } from "../controllers/web/documentNcertController";

const router = Router();

router.get("/", listDocumentNcert);

export default router;
