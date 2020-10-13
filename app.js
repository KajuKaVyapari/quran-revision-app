const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// Database
require('dotenv').config()

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})

// Models
const surahSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  memorised: {
    type: Boolean,
    required: true
  },
  lastRevised: Date,
})

const Surah = mongoose.model('Surah', surahSchema)

// Routers
const indexRouter = (req ,res) => {
  res.render('index')
}

const allSurahsRouter = (req, res) => {
    Surah.find({}, (err, doc) => {
        if (err) {
            console.error(err)
        }
        res.json(doc)
    })
}

const memorisedSurahsRouter = (req, res) => {
    Surah.find({memorised: true}).sort('lastRevised').exec((err, doc) => {
        if (err) {
            console.error(err)
        }
        res.json(doc)
    })
}

const nonMemorisedSurahsRouter = (req, res) => {
    Surah.find({memorised: false}, (err, doc) => {
        if (err) {
            console.error(err)
        }
        res.json(doc)
    })
}

// Handlers
const memoriseHandler = (req, res) => {
    Surah.findOneAndUpdate({number: req.params.number}, {memorised: true, lastRevised: new Date()}, {new: true},(err, doc) => {
        if (err) {
            console.error(err)
        }
        console.log(doc)
    })
}

const reviseHandler = (req, res) => {
    Surah.findOneAndUpdate({number: req.params.number}, {lastRevised: new Date()}, {new: true},(err, doc) => {
        if (err) {
            console.error(err)
        }
        console.log(doc)
    })
}


// App
app.get('/', indexRouter)

// API
app.get('/surahs/all', allSurahsRouter)
app.get('/surahs/memorised', memorisedSurahsRouter)
app.get('/surahs/nonMemorised', nonMemorisedSurahsRouter)

app.get('/memorise/:number', memoriseHandler)
app.get('/revise/:number', reviseHandler)

// catch 404 and forward to error handler
app.use((req, res) => {
  res.render('error')
})

module.exports = app;
