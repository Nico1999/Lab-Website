var express = require('express');
var config = require('./config');

var userManagement = require('./userManagement');
var users = require('./users');
var lab = require('./lab');
var manage = require('./manage');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var common = require('./common');
var sites = {};

var internal = express();
var external = express();

internal.locals.pretty = true;
external.locals.pretty = true;
internal.use(express.static('public'));
external.use(express.static('public'));

internal.set('view engine', 'jade');
external.set('view engine', 'jade');

var bodyParser = require('body-parser');
internal.use(bodyParser.json());
external.use(bodyParser.json());

external.use(session({
  store: new RedisStore(),
  secret: config.cookieSecret,
  resave: false,
  saveUninitialized: false
}));

internal.get('/', function(req, res){
    res.render('internalIndex');
});

external.get('/', common.getLogin, function(req, res){
    res.render('externalIndex',{'user':req.user});
});

internal.use('/lab', lab.internal);
external.use('/lab', lab.external);

internal.use('/users', users);
external.use('/users', users);

manage.setLab(lab.labActions);
external.use('/manage', manage.routes);

setup();
internal.set('domain','localhost');
sites.internal = internal.listen(config.internalPort);
sites.external = external.listen(config.externalPort);

function setup(){
  if(config.nukeOnRestart){
    common.resetDatabase();
  }
}


module.exports = sites;
