var express = require('express');
var router = express.Router();

// import Book model exported from Book.js, via /models/index.js
const Book = require('../models').Book;

/* Handler function to wrap each route that requires an async call. */
function asyncHandler(cb){
  return async(req, res, next) => {
    let book;
    try {
      await cb(req, res, next)
    } catch(error){
      // If the error caught by catch is a SequelizeValidationError...
      if(error.name === "SequelizeValidationError") { // checking the error
        // use build() (NOT create() ) as we are not saving this version, due to error
        book = await Book.build(req.body);
        // Pass in the errors so we can display them
        console.log('book: ', book);
        // render page that was previously requested. Pass in 'book' to display
        // if it wasn't the new books page, then re-render the update-book template
        if (req.originalUrl !== '/books/new') {
          res.render("update-book", { book, errors: error.errors, title: "Update Book" })
        } else {
          // if it was the new books page, re-render 'new-book' template
          res.render("new-book", { book, errors: error.errors, title: "New Book", Test: output })
        }
      } else {
        // throw other types of errors, which will be handled by the catch block...
        // ... in the asyncHandler function
        throw error; // error caught in the asyncHandler's catch block
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
  // findAll books so we can render the list of books
  const Books = await Book.findAll();
  console.log('Books: ', Books);
  // render template. Pass in data returned from Books.findAll
  res.render('index', { title: 'Books', Books });
}));

// test function. 'book' will exist in pug templates where function is called
function output(attribute) {
  let att = book[attribute];
  if (book) {
    return att;
  } else {
    return "";
  }
}
// New Book route (GET version to show the form)
router.get('/books/new', (req, res) => {
  res.render('new-book', { title: 'Create New Book', Test: output });
});

// POST new book
router.post('/books/new', asyncHandler(async (req, res) => {
  // create new instance in Book table. req.body contains the form details
  console.log('req.body: ', req.body);
  const book = await Book.create(req.body);
  // redirect to the new book, using it's newly created id:
  res.redirect('/books/' + book.id);
}));

// route for individual books
router.get('/books/:id', asyncHandler(async(req, res) => {
  // get book based on id, using the id in the route parameter.
  // then pass the book in to update-book.pug
  const book = await Book.findByPk(req.params.id);
  console.log('book: ', book);
  res.render('update-book', { book });
}));

// POST route for updating individual books
router.post('/books/:id', asyncHandler(async(req, res) => {
  // find the book to update based on id, using the id in the route parameter.
  const book = await Book.findByPk(req.params.id);
  console.log('book: ', book);
  // then update the book
  await book.update(req.body);
  console.log('updated book: ', book);
  // redirect to the updated book, using it's id:
  res.redirect('/books/' + book.id);
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
