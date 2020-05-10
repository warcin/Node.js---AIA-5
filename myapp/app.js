var createError = require('http-errors');
var express = require('express');
var session=require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');

var routing = require('./routing');


var mysql = require('mysql');


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: false}));
app.use('/', routing);


app.use((req,res,next)=>{
    console.log(`${req.method} ${req.url}: ${new Date()}`)
    next();
})

module.exports = app;
