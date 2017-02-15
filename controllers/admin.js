const renderError = require('../lib/renderError');
const Request = require('../models/request');
const moment = require('moment');

let Admin = {};


Admin.timeline = (req, res) => {

    Request
        .run()
        .then(requests => {

            const groups = [];
            const items = [];

            requests.map(request => {

                const start = moment(request.createdAt);

                groups.push({id: request.id, items: items});

                items.push({
                    group: request.id,
                    start: start.format(),
                    type: 'box',
                    content: 'Plant'
                });
                items.push({
                    group: request.id,
                    start: start.add(6, 'd').format(),
                    type: 'box',
                    content: 'Dip'
                });
                items.push({
                    group: request.id,
                    start: start.add(11, 'd').format(),
                    type: 'box',
                    content: 'Harvest'
                })

            });
            return res.render('admin/timeline', {groups, items});
        })
        .catch(err => {
            return renderError(err, res);
        })
};

module.exports = Admin;

