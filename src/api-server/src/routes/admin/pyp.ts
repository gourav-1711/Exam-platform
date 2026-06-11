import { Router } from "express";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import {
  listAllPyp,
  getPypById,
  createPyp,
  updatePyp,
  deletePyp,
} from "../../controllers/admin/pypController";

const router = Router();

router.get("/pyp", listAllPyp);
router.get("/pyp/:id", getPypById);
router.post("/pyp", logAdminActivity("create_pyp", "pyp"), createPyp);
router.patch("/pyp/:id", logAdminActivity("update_pyp", "pyp"), updatePyp);
router.delete("/pyp/:id", logAdminActivity("delete_pyp", "pyp"), deletePyp);

export default router;
