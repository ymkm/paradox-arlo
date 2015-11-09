var Q = require('q');

var arlo = require('./clients/arlo');

exports.handler = function (event, context) {

    if (!event.TextBody) {
        context.fail('TextBody not present');
    } else {
        console.log(event.TextBody);
        var mode = "";

        if (event.TextBody.indexOf("Arming") > -1) {
            mode = "on";
        } else if (event.TextBody.indexOf("Disarming") > -1) {
            mode = "off";
        } else {
            context.fail('No arming message found in post');
        }

        console.log("setting mode to " +mode);

        arlo.setCameraMode(mode).then(function (r) {
            context.succeed(r);
        }).fail(function (error) {
            context.fail(error);
        }).done();
    }
};


