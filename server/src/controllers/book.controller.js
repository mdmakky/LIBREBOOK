import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleWares.js";
import Book from "../models/book.model.js";
import { User } from "../models/user.model.js";


// ================= ADD_BOOK =================

export const addBook = catchAsyncError(async (req, res, next) => {

    const { title, author, description, price, stock } = req.body;

    if (!title || !author || !description || !price || !stock) {
        return next(new ErrorHandler(
            "Please provide all required fields",
            400
        ));
    }

    const existingBook = await Book.findOne({ title });

    if (existingBook) {
        return next(new ErrorHandler(
            "Book with this title already exists",
            400
        ));
    }

    const book = await Book.create({
        title,
        author,
        description,
        price,
        stock,
        addedBy: req.user._id
    });

    res.status(201).json({
        success: true,
        message: "Book added successfully",
        book
    });
});

// ================= DELETE_BOOK =================
export const deleteBook = catchAsyncError(async (req, res, next) => {

    const book = await Book.findById(req.params.id);

    if (!book) {
        return next(new ErrorHandler("Book not found", 404));
    }

    if (book.addedBy.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to delete this book", 403));
    }

    await book.deleteOne();

    res.status(200).json({
        success: true,
        message: "Book deleted successfully"
    });
});

// ================= GET_ALL_BOOKS =================
export const getAllBooks = catchAsyncError(async (req, res, next) => {

    const books = await Book.find();

    res.status(200).json({
        success: true,
        message: "Books fetched successfully",
        books
    });
});

// ================= GET_BOOK_DETAILS =================
export const getBookDetails = catchAsyncError(async (req, res, next) => {

    const book = await Book.findById(req.params.id);

    if (!book) {
        return next(new ErrorHandler("Book not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Book details fetched successfully",
        book
    });
}); 
