'use strict'

const router = require('koa-router')();

function register(app) {
    router.get('/file', function* (next) {

    });

    app.use(router.routes());
    app.use(router.allowedMethods());
}

module.exports = register;