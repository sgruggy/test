/* jshint node: true */
/*jshint esversion: 6 */
'use strict';

const express = require('express');
const app = express();
const routes = require('./routes');
const bodyParser = require('body-parser').json;
const logger = require('morgan');

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/qa");
const db = mongoose.connection;

app.use(logger('dev'));
app.use(bodyParser());


db.on("error", (err)=>{
    console.error("connection error:", err);
});

db.once("open", ()=>{
    console.log("database connection succesful");
});

app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow_Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if(req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE");
        return res.status(200).json({});
    }
    next();
});

app.use('/questions', routes);

//catch 404 and foward to error handler
app.use((req, res, next) => {
    var err = new Error("Not found");
    err.status = 404;
    next(err);
});

//Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

const port = process.env.POT || 3000;
app.listen(port, () => {
    console.log("Listening on port 3000");
});