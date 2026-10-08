var express = require('express');
var router = express.Router();

// import Book model exported from Book.js, via /models/index.js
const Book = require('../models').Book;

/* Handler function to wrap each route that requires an async call. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // This forwards the error to the global error handler in app.js
      next(error);
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
  const Books = Book.findAll();
  // render template. Pass in data returned from Books.findAll
  res.render('index', { title: 'Books', Books });
}));

// New Book route (GET version to show the form)
router.get('/books/new', (req, res) => {
  res.render('new-book', { title: 'Create New Book' });
});

// POST new book
router.post('/books/new', asyncHandler(async (req, res) => {
  // create new instance in Book table. req.body contains the form details
  console.log('req.body: ', req.body);
  const book = await Book.create(req.body);
  // redirect to the new book, using it's newly created id:
  res.redirect('/books/' + book.id);
}));

// route for individual book pages
router.get('/books/:id', (req, res) => {
  res.render('new-book', { title: 'Create New Book' });
});

module.exports = router;
