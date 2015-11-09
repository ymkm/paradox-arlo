var moment = require('moment');

function stampTime(obj) {
    obj.updated = moment().format("X");
    return obj;
}

function timestamp() {
    return moment().format("X");
}

function getTransactionId() {
    var uid = Math.random().toString(16).slice(2);
    var now = (new Date).getTime();
    return 'web!' + uid + '!' + now;
}

function getBaseStationIndex(data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].deviceType == "basestation") {
            return i;
        }
    }
}

module.exports = {
    stampTime: stampTime,
    timestamp: timestamp,
    getTransactionId: getTransactionId,
    getBaseStationIndex: getBaseStationIndex
};
