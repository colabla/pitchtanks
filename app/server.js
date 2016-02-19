'use strict';

const express = require('express');
const app = express();
const _ = require('lodash');
const path = require('path');
const db = require('./server/models');
const passport = require('passport');
const myPassport = require('../config/passport')(passport, db);
const session = require('express-session');
const routes = require('./server/routes');
const sassMiddleware = require('node-sass-middleware');
const morgan = require('morgan');


// require local env vars
require('dotenv').load();

const reloadify = require('reloadify')([
	`${__dirname}/client/views`,
	`${__dirname}/public`,
	`${__dirname}/sass`,
]);

const sassSrcPath = `${__dirname}/sass`;
const sassDestPath = `${__dirname}/public/styles`;

/** MIDDLEWARE */

app.use(reloadify);

app.use(
	'/public/styles',
	sassMiddleware({
		src: sassSrcPath,
		dest: sassDestPath,
		outputStyle: 'compressed',
		debug: true,
	})
);

app.use(morgan('tiny'));

app.use('/public', express.static(`${__dirname}/public`));
// app.use('/views', express.static(`${__dirname}/client/views`));
app.use('/client', express.static(`${__dirname}/client`));
// app.engine('.jade', require('jade').__express)
// app.set('view engine', 'jade')
app.set('views', `${__dirname}/client/views`);
app.use(session({ resave: true, secret: 'pitchtanks', saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

routes(app, passport, db, __dirname);
console.log(`ENV: ${process.env.NODE_ENV}`);
app.listen(process.env.PORT || 3000, () => {
	console.log(`App running on port ${process.env.PORT || 3000}`);
});
