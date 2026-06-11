import { Router } from "express";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import {
  listAllNcertBooks,
  getNcertBookById,
  createNcertBook,
  updateNcertBook,
  deleteNcertBook,
} from "../../controllers/admin/ncertBooksController";

const router = Router();

router.get("/ncert-books", listAllNcertBooks);
router.get("/ncert-books/:id", getNcertBookById);
router.post("/ncert-books", logAdminActivity("create_ncert_book", "ncert_book"), createNcertBook);
router.patch("/ncert-books/:id", logAdminActivity("update_ncert_book", "ncert_book"), updateNcertBook);
router.delete("/ncert-books/:id", logAdminActivity("delete_ncert_book", "ncert_book"), deleteNcertBook);

export default router;
