const renderError = require('../lib/renderError');
const Request = require('../models/request');

let Admin = {};


Admin.timeline = (req, res) => {

    Request
        .getJoin({events: true})
        .run()
        .then(requests => {

            const groups = [];
            const items = [];

            requests.map(request => {

                request.events.map(event => {

                    items.push({
                        group: request.id,
                        start: event.date,
                        type: 'box',
                        content: event.text,
                        eventID: event.id
                    })

                });

                groups.push({id: request.id, content: request.username + ' ' + request.date, items: items});

            });
            return res.render('admin/timeline', {groups, items});
        })
        .catch(err => {
            return renderError(err, res);
        })
};

module.exports = Admin;

