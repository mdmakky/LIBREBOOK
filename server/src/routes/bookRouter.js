import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import express from "express";
import { deleteBook, getAllBooks, getBookDetails, addBook } from "../controllers/book.controller.js";

const router = express.Router();

router.post("/admin/add", isAuthenticated, isAuthorized("admin"), addBook);
router.delete("/delete/:id", isAuthenticated, isAuthorized("admin"), deleteBook);
router.get("/all", getAllBooks);
router.get("/:id", getBookDetails);

export default router;