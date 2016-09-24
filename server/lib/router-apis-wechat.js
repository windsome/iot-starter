/**
 * @file   middleware-apis.js
 * @author windsome.feng <86643838@163.com>
 * @date   Sat Sep 24 15:37:22 2016
 * 
 * @brief  should use access_token, we need user/authentication info.
 * 
 * 
 */

import _debug from 'debug'
const debug = _debug('app:server:apis')

module.exports = WechatApi;

function WechatApi(opts) {
    if (!(this instanceof WechatApi)) {
        return new WechatApi(opts);
    }
    this.opts = opts || {};
    var router = require('koa-router')(this.opts.router);
    if (this.opts.jwt) {
        console.log ("windsome", this.opts.jwt);
        var convert = require('koa-convert');
        var koajwt = require('koa-jwt');
        router.use(convert(koajwt({ secret: 'mysecret' })));
    }
    //console.log ("windsome:", routerOpts, JsSdk, router);
    router.all('/getSignPackage', this.getSignPackage());
    router.get('/getSignPackage/:name', this.getSignPackage2);
    router.all('/login', this.login);
    return router;
}

WechatApi.prototype.getSignPackage = function () {
    var WechatJsSdk = this.opts.jssdk;
    return (ctx, next) => {
        console.log ("body:"+JSON.stringify(ctx.request.body));
        var url = ctx.request.body.url;
        var pkg = WechatJsSdk.getSignPackage(url);
        console.log ("url="+url+", getSignPackage:"+JSON.stringify(pkg));
        ctx.body = pkg;
    };
}

WechatApi.prototype.getSignPackage2 = function (ctx, next){
    var name = ctx.params.name;
    if (name == "notfound") return ctx.throw('cannot find that pet', 404);
    ctx.body = {a:'aaaa', b:'bbbb'};
}

WechatApi.prototype.login = function (ctx, next){
    var user = ctx.request.body;
    console.log ("login:"+JSON.stringify(user));
    ctx.body = {a:'aaaa', b:'bbbb'};
}

