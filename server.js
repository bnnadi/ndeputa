'use strict';
var ROOT = __dirname;

// core libs
var dotenv = require('dotenv').config();
var express = require('express');
var fs = require('fs');
var http = require('http');
var bodyParser = require('body-parser');

var sequelizeInit = require(ROOT + '/config/initializers/sequelize');
var passportInit = require(ROOT + '/config/initializers/passport');

var environmentsAll = require(ROOT + '/config/environments/all');
var environmentsDev = require(ROOT + '/config/environments/development');
var environmentsPro = require(ROOT + '/config/environments/production');

sequelizeInit(function() {
    passportInit();
});


var routes = require('./config/routes');

// create servers
var app = express();
var httpPort = process.env.HTTP_PORT;

if (process.env.ENVIRONMENT === 'development') {
    environmentsDev.call(app);
} else if (process.env.ENVIRONMENT === 'production') {
    environmentsPro.call(app);
}

environmentsAll.call(app);


var httpServer = http.createServer(app);

httpServer.listen(httpPort, function() {
    console.log('HTTP server listening on port ' + httpPort + ' and process ' + process.pid);
});


routes.call(app);