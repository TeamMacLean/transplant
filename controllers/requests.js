var Requests = {};

Requests.new = (req, res, next)=> {
    return res.render('requests/new');
};

Requests.save = (req, res, next)=> {
    //send email to group leader to sign off request
    return res.send('TODO');
};

module.exports = Requests;