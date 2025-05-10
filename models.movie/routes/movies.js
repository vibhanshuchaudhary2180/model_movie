const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');

// Middleware to check if user is authenticated
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
};

// Middleware to check if user is the author of the movie review
const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/movies/${id}`);
    }
    next();
};

// GET /movies - Show all movies
router.get('/', async (req, res) => {
    const movies = await Movie.find({}).populate('author');
    res.render('movies/index', { movies });
});

// GET /movie/new - Show form to create new movie
router.get('/new', isLoggedIn, (req, res) => {
    res.render('movies/new');
});

// POST /movie - Create a new movie
router.post('/', isLoggedIn, async (req, res) => {
    try {
        const movie = new Movie(req.body.movie);
        movie.author = req.user._id;
        await movie.save();
        req.flash('success', 'Successfully added a new movie!');
        res.redirect(`/movies/${movie._id}`);
    } catch (e) {
        req.flash('error', 'Failed to add movie');
        res.redirect('/movies/new');
    }
});

// GET /movies/:id - Show details for a specific movie
router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id).populate('author');
    if (!movie) {
        req.flash('error', 'Cannot find that movie!');
        return res.redirect('/movies');
    }
    res.render('movies/show', { movie });
});

// GET /movies/:id/edit - Show edit form for a movie
router.get('/:id/edit', isLoggedIn, isAuthor, async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        req.flash('error', 'Cannot find that movie!');
        return res.redirect('/movies');
    }
    res.render('movies/edit', { movie });
});

// PUT /movies/:id - Update a movie
router.put('/:id', isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    // Get the existing movie to preserve the title
    const existingMovie = await Movie.findById(id);
    if (!existingMovie) {
        req.flash('error', 'Cannot find that movie!');
        return res.redirect('/movies');
    }
    
    // Keep the original title and update other fields
    const movieData = req.body.movie;
    movieData.title = existingMovie.title; // Title is immutable
    
    const movie = await Movie.findByIdAndUpdate(id, movieData, { new: true });
    req.flash('success', 'Successfully updated movie!');
    res.redirect(`/movies/${movie._id}`);
});

// DELETE /movies/:id - Delete a movie
router.delete('/:id', isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    await Movie.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted movie');
    res.redirect('/movies');
});

module.exports = router;