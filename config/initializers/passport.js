// libraries
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var passport = require('passport');

// strategies
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(done) {

    done = (typeof done === 'function') ? done : function() {};

    passport.use('v1-local-user', new LocalStrategy(function(username, password, done) {

        username.toLowerCase().replace(/^[ \t]+|[ \t]+$/ig, '');

        var UserModel = require(BACKEND + '/models').user;
        console.log("password check query");
        UserModel
            .findOne({
                where: { email: username }
            })
            .then(function(user) {

                if (!user) { return done(null, false); }
                if (password !== user.password) { return done(null, false); }

                done(null, user);
                return;
            })
            .catch(function(reason) {
                return done(reason);
            });

    }));


    passport.serializeUser(function(user, done) {

        done(null, {
            '_id': user.id,
            'accountType': user.accountType
        });
    });

    passport.deserializeUser(function(user, done) {

        // done(null, false);

        var id = user._id;
        var UserModel = require(BACKEND + '/models').user;

        UserModel
            .findOne({
                where: { id: id }
            })
            .then(function(err) {
                if (user) {
                    done(null, user);
                } else {
                    done(user.errors, null);
                }
            });
    });

    done();
};