'use strict'

let env = process.env.NODE_ENV;
/* istanbul ignore if  */
if (env === 'development') {
    require('node-monkey').start({ host: "127.0.0.1", port: "50500" });
}

const fs = require('fs');
const config = require('../config/config.js');
const mongoose = require('mongoose');

const koa = require('koa');
const json = require('koa-json');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const end = require('./middleware/response.js');
const assert = require('./middleware/assert.js');
const app = koa();

// use native Promise
mongoose.Promise = global.Promise;

// connect database
mongoose.connect(env !== 'test' ? /* istanbul ignore next */ config.database : config.testDatabase, err => {
    /* istanbul ignore if  */
    if (err) {
        console.log('connect database error -->', err);
        process.exit(10601);
    }
    if (env === 'test') {
        mongoose.connection.db.dropDatabase();
    }
    console.log('connect database success');
});

// provide this.end() function
app.use(end);

// provide this.assert() function
app.use(assert);

// support request log
/* istanbul ignore if  */
if (env !== 'test')
    app.use(logger());

// error handle
app.use(function* (next) {
    try {
        yield next;
    }
    catch (err) {
        let message = err.message;

        /* istanbul ignore if  */
        if (message === 'invalid json data') {
            return this.end({
                status: 400,
                data: message,
            });
        }
        else if (message === 'assert check fail') {
            return;
        }

        /* istanbul ignore next */
        console.log('error --> ', message);
        /* istanbul ignore next */
        return this.end({
            status: 500,
            data: env === 'development' ? message : 'server error',
        })
    }
})

// support json type response
app.use(json());

// support body data
app.use(bodyParser({
    onerror: /* istanbul ignore next */ function (err, ctx) {
        ctx.throw('invalid json data');
    }
}));

// import all routers
fs.readdir(__dirname + '/router', (err, result) => {
    /* istanbul ignore if  */
    if (err) {
        console.log('require routers error --> ', err);
        return;
    }

    for (let file of result) {
        require(`./router/${file}`)(app);
    }
});

// start listener
app.listen(config.port, () => {
    console.log('start server at http://localhost:' + config.port);
});

// other error handle
app.on('error', err => {
    /* istanbul ignore next */
    console.log('error --> ', err.message);
    /* istanbul ignore next */
    process.exit(1);
});


module.exports = app;