var admin = {};

admin.timeline = ((req, res, next)=> {
    // http://visjs.org/timeline_examples.html

    res.render('admin/timeline');
});

module.exports = admin;

