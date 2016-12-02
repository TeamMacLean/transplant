var Requests = {};

Requests.new = (req, res, next)=> {
    return res.render('requests/new');
};

module.exports = Requests;