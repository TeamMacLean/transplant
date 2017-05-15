const API = {};

const Event = require('../models/event');

/**
 *
 * @param req
 * @param res
 * @param next
 */
API.add = (req, res, next) => {
    new Event({
        requestID: req.body.group,
        text: req.body.content,
        date: req.body.start
    })
        .save()
        .then(savedEvent => {
            return res.status(200).send({id: savedEvent.id})
        })
        .catch(err => {
            return next(err);
        });
};
/**
 *
 * @param req
 * @param res
 * @param next
 */
API.move = (req, res, next) => {

    Event.get(req.body.eventID)
        .then(event => {
            event.date = req.body.start;
            event.save()
                .then(() => {
                    return res.status(200).send('ok');
                })
                .catch(err => {
                    return next(err);
                })
        })
        .catch(err => {
            return next(err);
        })
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
API.update = (req, res, next) => {

    Event.get(req.body.eventID)
        .then(event => {
            event.text = req.body.content;
            event.save()
                .then(() => {
                    return res.status(200).send('ok');
                })
                .catch(err => {
                    return next(err);
                })
        })
        .catch(err => {
            return next(err);
        })
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
API.delete = (req, res, next) => {

    Event.get(req.body.eventID)
        .then(event => {
            event.delete()
                .then(() => {
                    return res.status(200).send('ok');
                })
                .catch(err => {
                    console.error(err);
                    return next(err);
                })
        })
        .catch(err => {
            console.error(err);
            return next(err);
        })
};

module.exports = API;