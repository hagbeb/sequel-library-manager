var express = require('express');
var router = express.Router();

// extract the property Op from sequelize
const { Op } = require('sequelize');

// import Book model exported from Book.js, via /models/index.js
const Book = require('../models').Book;

// set how many books we want to display per page
const booksPerPage = 10;

/* Handler function to wrap each route that requires an async call. */
function asyncHandler(cb){
  return async(req, res, next) => {
    let book;
    try {
      await cb(req, res, next)
    } catch(error){
      // If the error caught by catch is a SequelizeValidationError...
      if(error.name === "SequelizeValidationError") {
        // use build() (NOT create() ) as we are not saving this version, due to error
        book = await Book.build(req.body);
        // render page that was previously requested. Pass in 'book' to display
        // Pass in the errors so we can display them
        // if it wasn't the new books page, then re-render the update-book template
        if (req.originalUrl !== '/books/new') {
          res.render("update-book", { book, errors: error.errors, title: "Update Book" })
        } else {
          // if it was the new books page, re-render 'new-book' template
          res.render("new-book", { book, errors: error.errors, title: "New Book" })
        }
      } else {
        // pass on other types of errors to global handler
        next(error);
      }
    }
  }
}
/* GET home page. */
router.get('/', function(req, res, next) {
  // redirect to books route
  res.redirect('books');
});

// books route
router.get('/books', asyncHandler(async (req, res) => {
  // variable to store books
  let Books;
  // variable to store search term, so we can pass this to Pug & so preserve the ...
  // ... existing search term when the user clicks a page button. 
  // Set to default "" to prevent Pug undefined error
  let searchTerm = "";
  // if the user made a search, store the search term
  if (req.query.search) {
    searchTerm = req.query.search;
    // find books which contain the search term in one of their fields
    Books = await Book.findAndCountAll({
      where: {
        // use Op.or & Op.like to see if search was in any of the fields
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${req.query.search}%`
            }
          },
          {
            author: {
              [Op.like]: `%${req.query.search}%`
            }
          },
          {
            genre: {
              [Op.like]: `%${req.query.search}%`
            }
          },
          {
            year: {
              [Op.like]: `%${req.query.search}%`
            }
          }
        ]
      }
    });
  // if the user didn't search, then retrieve all books
  } else {
      Books = await Book.findAndCountAll();
  }

  // GET CURRENT PAGE & BUTTONS NEEDED
  // calculate the number of pages/buttons needed
  const buttonsNeeded = Math.ceil(Books.count / booksPerPage);
  // variable to store the active page/button
  let pageNumber;
  // Get the page to display from req.query. If the user clicked a page button...
  if (req.query.button) {
    // ...set that button to the pageNumber
    pageNumber = req.query.button;
  } else {
    // else, set the pageNumber to 1 ie to show the first page
    pageNumber = 1;
  }

  // UPDATE BOOKS ARRAY FOR ACTIVE PAGE
  // calculate which should be the first book on the page, depending on page number
  const startBook = (pageNumber * booksPerPage) - booksPerPage;
  // calculate the last book on the page. Don't - 1 as array.slice(, end) is not inclusive
  const endBook = (pageNumber * booksPerPage);
  // slice the array to show based on the start and end books above
  const newBooks = Books.rows.slice(startBook, endBook);
  // render template. Pass in new books array, buttonsNeeded, pageNumber & searchTerm
  res.render('index', { title: 'Books', Books: newBooks, buttons: buttonsNeeded, pageNumber: pageNumber, searchTerm: searchTerm });
}));

// New Book route (GET version to show the form)
router.get('/books/new', (req, res) => {
  res.render('new-book', { title: 'Create New Book' });
});

// POST new book
router.post('/books/new', asyncHandler(async (req, res) => {
  // create new instance in Book table. req.body contains the form details
  const book = await Book.create(req.body);
  // redirect to the new book, using it's newly created id:
  res.redirect('/books/' + book.id);
}));

// route for individual books
router.get('/books/:id', asyncHandler(async(req, res, next) => {
  // get book based on id, using the id in the route parameter.
  // then pass the book in to update-book.pug
  const book = await Book.findByPk(req.params.id);
  // if the book URL exists, render the book
  if (book) {
    res.render('update-book', { book });
  // else pass on to next error handler, which is page-not-found
  } else {
    next();   
  }
}));

// POST route for updating individual books
router.post('/books/:id', asyncHandler(async(req, res) => {
  // find the book to update based on id, using the id in the route parameter.
  const book = await Book.findByPk(req.params.id);
  // then update the book
  await book.update(req.body);
  // render the updated book, pass in success message:
  res.render('update-book', { book, title: "Update Book", message: "Book updated!" });
}));

// POST route for deleting individual books
router.post('/books/:id/delete', asyncHandler(async(req, res) => {
  // find the book to delete based on id, using the id in the route parameter.
  const book = await Book.findByPk(req.params.id);
  // then delete the book
  await book.destroy();
  // redirect to the updated books list:
  res.redirect('/books/');
}));

module.exports = router;
