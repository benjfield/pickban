'use strict';

var mongoose = require('mongoose');

function Mongoose() {
    if (!(this instanceof Mongoose)) {
        return new Mongoose();
    }
}

Mongoose.prototype.start = function (cb) {
    var db = mongoose.connection;
    var startupError = function (err) {
        return cb(err);
    };

    db.once('error', startupError);
    db.once('open', function () {
        db.removeListener('error', startupError);
        return cb(null, mongoose);
    });
    mongoose.connect('mongodb://localhost/pickban');
};

Mongoose.prototype.stop = function (cb) {
    mongoose.connection.close(function () {
        return cb();
    });
};

module.exports = Mongoose;