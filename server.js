/*

The MIT License (MIT)

Copyright (c) Thu Aug 18 2016 Zhong Wu zhong.wu@autodesk.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORTOR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var favicon = require('serve-favicon');
var express = require('express');
var search = require('./routes/search.js');
var solrsearch = require('./routes/solrsearch');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

// prepare our API endpoint routing
var oauth = require('./server/oauth');
var dm = require('./server/data.management');
var md = require('./server/model.derivative');


var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

////////////////////////////////////
app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy - HTTPS on Heroku 
app.use(session({
    secret: 'autodeskforge',
    cookie: {
        httpOnly: true,
        secure: (process.env.NODE_ENV === 'production'),
        maxAge: 1000 * 60 * 60 // 1 hours to expire the session and avoid memory leak
    },
    resave: false,
    saveUninitialized: true
}));

app.use('/', express.static(__dirname + '/www'));
app.use(favicon(__dirname + '/www/img/favicon.ico'));
app.use('/search', search);
app.use('/solrsearch', solrsearch);

app.use('/', oauth); // redirect oauth API calls
app.use('/dm', dm); // redirect our Data Management API calls
app.use('/md', md); // redirect our Data Management API calls
///////////////////////////////////////////////////////


app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Server listening on port ' + server.address().port);
});