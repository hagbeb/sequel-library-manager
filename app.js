var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// load static assets by loading the public folder
app.use(express.static('public'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Page Not found');
  err.status = 404;
  // render the 'page-not-found' template
  res.render('page-not-found', { err });
});

// global error handler
app.use(function(err, req, res, next) {
  // set err.message if not already defined
  if (!err.message) {
    err.message = 'Server error';
  }
  // Set the err.status property to 500 if status isn't already defined
  if (!err.status) {
    err.status = 500;
  }
  // log error info to console
  console.log('err.status:, ', err.status);
  console.log('err.message: ', err.message);
  // render the 'error' view, passing in the error object
  res.render('error', { err });
});

module.exports = app;
