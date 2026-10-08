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
  const Books = await Book.findAll();
  console.log('Books: ', Books);
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

module.exports = router;
