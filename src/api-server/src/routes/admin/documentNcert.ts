import { Router } from "express";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { uploadDoc } from "../../middleware/upload";
import {
  listAllDocumentNcert,
  getDocumentNcertById,
  createDocumentNcert,
  updateDocumentNcert,
  deleteDocumentNcert,
} from "../../controllers/admin/documentNcertController";

const router = Router();

router.get("/document-ncert", listAllDocumentNcert);
router.get("/document-ncert/:id", getDocumentNcertById);
router.post("/document-ncert", uploadDoc.single("file"), logAdminActivity("create_document_ncert", "document_ncert"), createDocumentNcert);
router.patch("/document-ncert/:id", uploadDoc.single("file"), logAdminActivity("update_document_ncert", "document_ncert"), updateDocumentNcert);
router.delete("/document-ncert/:id", logAdminActivity("delete_document_ncert", "document_ncert"), deleteDocumentNcert);

export default router;
