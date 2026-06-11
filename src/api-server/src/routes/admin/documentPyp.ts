import { Router } from "express";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { uploadDoc } from "../../middleware/upload";
import {
  listAllDocumentPyp,
  getDocumentPypById,
  createDocumentPyp,
  updateDocumentPyp,
  deleteDocumentPyp,
} from "../../controllers/admin/documentPypController";

const router = Router();

router.get("/document-pyp", listAllDocumentPyp);
router.get("/document-pyp/:id", getDocumentPypById);
router.post("/document-pyp", uploadDoc.single("file"), logAdminActivity("create_document_pyp", "document_pyp"), createDocumentPyp);
router.patch("/document-pyp/:id", uploadDoc.single("file"), logAdminActivity("update_document_pyp", "document_pyp"), updateDocumentPyp);
router.delete("/document-pyp/:id", logAdminActivity("delete_document_pyp", "document_pyp"), deleteDocumentPyp);

export default router;
