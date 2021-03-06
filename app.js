var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
require('./lib/salesforce-connection');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('entry-cookie'));
app.use(session({
    key: "entry-site-key",
    secret: "entry-site-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 90 * 60 * 60 * 24 * 1000}
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/rest/*', function (req, res, next) {
    var ses = req.session;
    var userType = ses.loginUserType;
    if (!userType) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({code: 'timeout', message: '', data: {}}));
    } else {
        next();
    }
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
