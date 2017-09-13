const renderError = require('../lib/renderError');
const Request = require('../models/request');

const EventGroup = require('../models/eventGroup');

let Admin = {};

/**
 *
 * @param req
 * @param res
 */
Admin.timeline = (req, res) => {

    // name (first inital + last name, trf),

    Request
        .getJoin({eventGroups: {events: true}})
        .run()
        .then(requests => {

            let groups = [];
            let items = [];

            requests.map(request => {

                const nestGroups = [];

                request.eventGroups.map((eg,i) => {


                    // console.log(eg.events);
                    eg.events.map(event => {

                        items.push({
                            group: eg.id,
                            start: event.date,
                            // type: 'box',
                            content: event.text,
                            eventID: event.id
                        });

                    });
                    nestGroups.push({id: eg.id, content: `set ${i+1}`, items: items});
                });


                groups.push({
                    id: request.id,
                    content: request.username + ' ' + request.date,
                    nestedGroups: nestGroups.map(ng => {
                        return ng.id
                    })
                });

                groups = groups.concat(nestGroups);

            });
            return res.render('admin/timeline', {groups, items});
        })
        .catch(err => {
            return renderError(err, res);
        })
};

module.exports = Admin;

