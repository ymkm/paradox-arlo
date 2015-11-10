var app = require('./index.js');

var context = {
    succeed: function (r) {
        console.log('------------');
        console.log('succeed');
        console.log('   result:', r);
    },
    fail: function (err) {
        console.log('------------');
        console.log('fail');
        console.log('   error:', err);
    }
};

// Simulated post from postmarkapp

var offEvent = {
    "FromName": "Your Site",
    "From": "hello@example.com",
    "Subject": "Disarming Area 1 System Master",
    "Date": "Mon, 05 Oct 2015 07:36:44 +0000",
    "TextBody": "From your Paradox internet module\r\nSite: Your Site\r\nMessage: Disarming\r\nPartition: 1 - Area 1\r\nBy: System Master\r\nTime: 5 Oct 2015 17:35\r\n",
    "Headers": [
        {
            "Name": "Content-Transfer-Encoding",
            "Value": "7bit"
        }
    ],
    "Attachments": []
};

var onEvent = {
    "FromName": "Your Site",
    "From": "hello@example.com",
    "Subject": "Disarming Area 1 System Master",
    "Date": "Mon, 05 Oct 2015 07:36:44 +0000",
    "TextBody": "From your Paradox internet module\r\nSite: Your Site\r\nMessage: Arming\r\nPartition: 1 - Area 1\r\nBy: System Master\r\nTime: 5 Oct 2015 17:35\r\n",
    "Headers": [
        {
            "Name": "Content-Transfer-Encoding",
            "Value": "7bit"
        }
    ],
    "Attachments": []
};

app.handler(offEvent, context);
