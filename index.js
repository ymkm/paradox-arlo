var Q = require('q');

var arlo = require('./clients/arlo');

exports.handler = function (event, context) {

    if (!event.TextBody) {

        context.fail('TextBody not present');

    } else {

        if (event.TextBody.indexOf("Arming") > -1) {

            arlo.setSchedule(false)
                .then(function () {
                    arlo.setCameraMode("on").then(context.succeed, context.fail);
                }, context.fail)

        } else if (event.TextBody.indexOf("Disarming") > -1) {

            arlo.setSchedule(true).then(context.succeed, context.fail);

        } else {

            context.fail('No arming message found in post');
        }

    }
};

