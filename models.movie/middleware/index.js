const Movie = require('../models/movie');
const middleware = {};

middleware.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
};

middleware.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/movies/${id}`);
    }
    next();
};

module.exports = middleware;