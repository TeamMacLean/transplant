const express = require('express');
const router = express.Router();
const Util = require('./lib/util');
const Auth = require('./controllers/auth');
const Requests = require('./controllers/requests');

router.route('/')
    .get((req, res) => res.render('index'));

//AUTH
router.route('/signin')
    .get(Auth.signIn)
    .post(Auth.signInPost);
//
router.route('/signout')
    .all(isAuthenticated)
    .get(Auth.signOut);


router.route('/new')
    .all(isAuthenticated)
    .get(Requests.new);

//LAST!
router.route('*')
    .get((req, res) => {
        console.log('404', req.url);
        res.render('404');
    });


function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.session.returnTo = req.path;
        return res.redirect('/signin');
    }
}

function isAdmin(req, res, next) {
    if (Util.isAdmin(req.user.username)) {
        return next();
    } else {
        return res.send('You cannot access this page, you are not an admin.');
    }
}

module.exports = router;