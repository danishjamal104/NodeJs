const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favourites = require('../models/favourite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const favourite = require('../models/favourite');

const favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({
        user: req.user._id 
    })
    .populate('user')
    .populate('dishes')
    .then(fav => {
        if(fav.length==0){
            const err = new Error('No favourites.');
            err.status = 200;
            return next(err);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav[0]);
    }, err=>next(err))
    .catch(err=>{next(err)})
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favourites.find({
        user: req.user._id 
    })
    .then(fav => {
        if(fav.length==0){
            Favourites.create({user: req.user._id, dishes: req.body})
            .then(favourite => {
                Favourites.findById(favourite._id)
                .populate('user').populate('dishes')
                .then(favourite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite); 
                }); 
            }, err=>next(err))
            .catch(err=>next(err))
        }else{
            fav = fav[0];
            const dishIds = req.body;
            for(var id of dishIds){
                var includes = false;
                for(var already_in of fav.dishes){
                    if(already_in.toString()==id._id.toString()){
                        includes = true;
                        break;
                    }
                }
                if(!includes){
                    fav.dishes.push(id);
                }
            }
            fav.save()
            .then((favourite) => {
                Favourites.findById(favourite._id)
                .populate('user').populate('dishes')
                .then(favourite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite); 
                });               
            }, (err) => next(err))
            .catch(err=>next(err));
        }
    }, err=>next(err))
    .catch(err=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favourites.find({
        user: req.user._id 
    })
    .then(fav=>{
        if(fav.length==0){
            const err = new Error('No favourites.');
            err.status = 200;
            return next(err);
        }
        fav = fav[0];
        fav.remove()
        .then(resp=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, err=>next(err))
        .catch(err=>next(err))
    }, err=>next(err))
    .catch(err=>next(err))
})

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favourites.find({
        user: req.user._id 
    })
    .then(fav => {
        if(fav.length==0){
            Favourites.create({user: req.user._id, dishes: [req.params.dishId]})
            .then(favourite => {
                Favourites.findById(favourite._id)
                .then(favourite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite); 
                }); 
            }, err=>next(err))
            .catch(err=>next(err))
        }else{
            fav = fav[0];
            const id = req.params.dishId;
            var includes = false;
            for(var already_in of fav.dishes){
                if(already_in.toString()==id.toString()){
                    includes = true;
                    break;
                }
            }
            if(!includes){
                fav.dishes.push(id);
            }
            fav.save()
            .then((favourite) => {
                Favourites.findById(favourite._id)
                .then(favourite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite); 
                });               
            }, (err) => next(err))
            .catch(err=>next(err));
        }
    }, err=>next(err))
    .catch(err=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favourites.find({
        user: req.user._id 
    })
    .then(fav=>{
        if(fav.length==0){
            const err = new Error('No favourites.');
            err.status = 200;
            return next(err);
        }
        fav = fav[0];
        const dishes = [];
        for(var already_in of fav.dishes){
            if(already_in.toString()==req.params.dishId){
                continue;
            }
            dishes.push(already_in);
        }
        fav.dishes = dishes;
        fav.save()
        .then((favourite) => {
            Favourites.findById(favourite._id)
            .then(favourite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite); 
            });               
        }, (err) => next(err))
        .catch(err=>next(err));
    }, err=>next(err))
    .catch(err=>next(err))
})

module.exports = favouriteRouter;