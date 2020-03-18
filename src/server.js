'use strict';

const path = require('path');

const helmet = require('helmet');
const express = require('express');
const sslify = require('express-sslify');
const compression = require('compression');

const apiRouter = require('./api');
const proxyHandler = require('./proxy');
const { __ENV__ } = require('./config');

const { loggerMiddleware, errorLoggerMiddleware } = require('./utils/logger');

const DIST_DIR = path.resolve(__dirname, '../dist');

const app = express();

// Request logger
if (__ENV__ !== 'test') {
    app.use(loggerMiddleware);
}

// Disable certain HTTP headers.
app.use(helmet());

if (__ENV__ === 'production') {
    // Forward HTTP traffic to HTTPS. Service worker requires SSL to be enabled.
    // On localhost this is not required.
    app.use(sslify.HTTPS({ trustProtoHeader: true }));
}

// GZip all the responses.
app.use(compression());

// Match all the request to serve static assets
app.use(express.static(DIST_DIR));

// Since some of the podcast enclosed URL doesn't provide CORS headers, we use this endpoint as a proxy to get around
// the same origin policy.
app.get('/proxy/*', proxyHandler);

// Match API requests
app.use('/api/v1', apiRouter);

// Match all the other requests and return the HTML entry
app.use('*', (req, res) => {
    res.sendFile(path.resolve(DIST_DIR, 'index.html'));
});

// Error logger
if (__ENV__ !== 'test') {
    app.use(errorLoggerMiddleware);
}

module.exports = app;

