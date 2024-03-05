const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const wiki = require('./routes/wiki');
const catalog = require('./routes/catalog');
const helmet = require('helmet');
require('dotenv').config();

const compression = require('compression');

const app = express();

app.use(compression()); // compress all routes

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URI;

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require('express-rate-limit');
const limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
});
//Apply rate limiter to all requests
app.use(limiter);

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));;
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES TO USE
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wiki', wiki);
app.use('/catalog', catalog); // Import routes for "catalog" area of site
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
  });

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            'script-src': ["'self", 'code.jquery.com', 'cdn.jsdelivr.net'],
        },
    })
);

main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
}

module.exports = app;
