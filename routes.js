const express = require('express');
const router = express.Router();
const Util = require('./lib/util');
const Auth = require('./controllers/auth');
const Requests = require('./controllers/requests');
const Admin = require('./controllers/admin');
const API = require('./controllers/api');

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
    .get(Requests.new)
    .post(Requests.save);

router.route('/requests')
    .all(isAuthenticated)
    .get(Requests.my);

router.route('/request/:id')
    .all(isAuthenticated)
    .get(Requests.show);

router.route('/timeline')
    .all(isAuthenticated)
    .all(isAdmin)
    .get(Admin.timeline);


router.route('/api/events/add')
    .post(API.add);

router.route('/api/events/move')
    .post(API.move);

router.route('/api/events/update')
    .post(API.update);

router.route('/api/events/delete')
    .post(API.delete);


//LAST!
router.route('*')
    .get((req, res) => {
        console.log('404', req.url);
        res.render('404');
    });


/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.session.returnTo = req.path;
        return res.redirect('/signin');
    }
}

/**
 * 
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function isAdmin(req, res, next) {
    if (Util.IsAdmin(req.user.username)) {
        return next();
    } else {
        return res.send('You cannot access this page, you are not an admin.');
    }
}

module.exports = router;