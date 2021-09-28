const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Joi = require('joi');
const wrapAsync = require('./utilities/wrapAsync')
const methodOverride = require('method-override');
const ExpressError = require('./utilities/ExpressError')
const Naturopath = require('./models/naturopath');
const ejsMate = require('ejs-mate');
const Review = require('./models/review');
const { request } = require('node:http');
const passport = require('passport');
const LocalStrategy = require('passport-local');


//connect to our mongoose model
mongoose.connect('mongodb://localhost:27017/naturopathFinder', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

//check for error when connecting to database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connnection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//Use ejs as view engine
app.set('view engine', 'ejs');

//provide greater flexibility for what folder we run app out of
app.set('views', path.join(__dirname, 'views'));

//parse the body
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/naturopaths', wrapAsync(async (req, res) => {
    const naturopaths = await Naturopath.find({});
    res.render('naturopaths/index', {naturopaths});
}))

app.get('/naturopaths/new', (req, res) => {
    res.render('naturopaths/new')
})

app.post('/naturopaths', wrapAsync(async (req, res) => {
    //if (!req.body.naturopath) throw new ExpressError('Invalid Naturopath Data', 400)
    const naturopathSchema = Joi.object({
        naturopath: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required(),
            image: Joi.string().required()
        }).required()
    })
    const {error} = naturopathSchema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(msg, 400);
    }
    const naturopath = new Naturopath(req.body.naturopath);
    await naturopath.save();
    res.redirect(`/naturopaths/${naturopath._id}`); 
}))

app.get('/naturopaths/:id', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const naturopath = await Naturopath.findById(id).populate('reviews');
    res.render('naturopaths/show', {naturopath});
}))

app.get('/naturopaths/:id/edit', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const naturopath = await Naturopath.findById(id);
    res.render('naturopaths/edit', {naturopath})
}))

app.put('/naturopaths/:id', wrapAsync(async (req, res) => {
    const naturopathSchema = Joi.object({
        naturopath: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required(),
            image: Joi.string().required()
        }).required()
    })
    const {error} = naturopathSchema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressError(msg, 400);
    }
    const {id} = req.params;
    const naturopath = await Naturopath.findByIdAndUpdate(id, {name: req.body.naturopath.name, location: req.body.naturopath.location,
        description: req.body.naturopath.description});
    res.redirect(`/naturopaths/${id}`)
}))

app.delete('/naturopaths/:id', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const naturopath = await Naturopath.findByIdAndDelete(id);
    res.redirect('/naturopaths');
}))

app.post('/naturopaths/:id/reviews', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const naturopath = await Naturopath.findById(id);
    const review = new Review(req.body.review);
    naturopath.reviews.push(review);
    await review.save();
    await naturopath.save();
    res.redirect(`/naturopaths/${naturopath._id}`);
}))

app.delete('/naturopaths/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    const {reviewId} = req.params;
    res.send(reviewId)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})


app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Oy! Something Went Wrong!';
    res.status(statusCode).render('error', {err});
})

app.listen(3333, () => {
    console.log('Serving on port 3333');
})