/* jshint node: true */
/*jshint esversion: 6 */
'use strict';

const express = require('express');
const router = express.Router();
const Question = require('./models').Question;

router.param("id", (req, res, next, id)=>{
    Question.findById(req.params.id, (err, doc)=>{
        if (err) return next(err);
        if (!doc){
            err = new Error("Not Found");
            err.status = 404;
            return next(err);
        }
        req.question = doc;
        return next();
    });
});

router.param("aID", (req, res, next, id)=>{
    req.answer = req.question.answers.id(id);
    if (!req.answer){
        var err = new Error("Not Found");
        err.status = 404;
        return next(err);
    }
    next();
});

//GET /questions
//Return all the questions
router.get('/', (req, res, next) =>{
    Question.find({})
                .sort({createdAt: -1})
                .exec((err, questions) =>{
                        if(err) return next(err);
                        res.json(questions);
    });
});

//POST /questions
//Creating questions
router.post('/', (req, res, next) =>{
    var question = new Question(req.body);
    question.save(function(err, question){
        if (err) return next(err);
        res.status(201);
        res.json(question);
    });
});

//GET /questions/:id
//Return a specific function
router.get('/:id', (req, res, next) =>{
    res.json(req.question);
});

//POST /questions/:id/answers
//Creating an answer
router.post('/:id/answers', (req, res, next) =>{
    req.question.answers.push(req.body);
    req.question.save(function(err, question){
        if (err) return next(err);
        res.status(201);
        res.json(question);
    });
});


//PUT /questions/:id/answers/:aID
//Edit a specific answer
router.put('/:id/answers/:aID', (req, res, next) =>{
    req.answer.update(req.body, (err, result)=>{
        if(err) return next(err);
        res.json(result);
    });
});

//DELETE /questions/:id/answers/:aID
//Delete a specific answer
router.delete('/:id/answers/:aID', (req, res) =>{
    req.answer.remove((err)=>{
        req.question.save((err, question)=>{
            if(err) return next(err);
            res.json(question);
        });
    });
});

//POST /questions/:id/answers/:aID/up-vote
//POST /questions:/id/answers:/aID/down-vote
//Vote on a specific answer
router.post('/:id/answers/:aID/:dir-vote', (req, res, next) =>{
    if(req.params.dir != 'up' && req.params.dir != 'down'){
        var err = new Error("Not Found");
        err.status = 404;
        next(err);
    }
    else{
        req.vote = req.params.dir;
        next();
    }
}, (req, res) =>{
        req.answer.vote(req.vote, (err, question)=>{
            if(err) return next(err);
            res.json(question);
        });
});
module.exports = router;