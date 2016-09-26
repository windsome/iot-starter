/**
 * @file   oauth2-wechat.js
 * @author windsome.feng <86643838@163.com>
 * @date   Mon Sep 26 10:20:27 2016
 * 
 * @brief  
 * oauth2: {
 *   appid: APPID,
 *   state: STATE,
 *   scope: SCOPE,
 *   code:  CODE,
 *   access_token: ACCESS_TOKEN,
 *   expires_in: 7200,
 *   refresh_token: REFRESH_TOKEN,
 *   openid: OPENID
 * }
 * 
 * 
 */

import _debug from 'debug'
const debug = _debug('app:server:oauth2')

function Oauth2Api(opts) {
    if (!(this instanceof Oauth2Api)) {
        return new Oauth2Api(opts);
    }
    this.opts = opts || {};
    var router = require('koa-router')(this.opts.router);
    router.all('/getState', this.getState);
    router.all('/getUserInfo', this.getUserInfo);
    router.getOpenId = this.getOpenId;
    return router;
}

Oauth2Api.prototype.getState = function (ctx, next) {
    var scope = ctx.request.query.scope;
    var session = ctx.session;
    console.log ("windsome getState1 ", session);
    // start a new oauth2 flow.
    var state =  Math.random().toString(36).substr(2, 6);
    var oauth2 = {
        appid: this.opts.appId,
        state: state,
        scope: scope,
    };
    session.oauth2 = oauth2;
    console.log ("windsome getState2 ", session);
    ctx.body = oauth2;
}

Oauth2Api.prototype.getOpenId = function () {
    return async function(ctx, next) {
        var code = ctx.request.query.code;
        var state = ctx.request.query.state;
        var session = ctx.session;
        debug ("windsome", code, state, ctx.request.query, session);
        
        // check whether state is in cache?
        // check whether state's ip is same as that in the cache?
        // get oauth2 access_token from weixin
        // get user info from weixin using access_token.
        
        //ctx.body = {a:'aaaa', b:'bbbb'};
        await next ();
    };
}

Oauth2Api.prototype.getUserInfo = function (ctx, next){
    var session = ctx.session;
    console.log ("windsome getUserInfo ", session);
    var user = ctx.session.oauth2;

    // check whether state is in cache?
    // check whether state's ip is same as that in the cache?
    // get oauth2 access_token from weixin
    // get user info from weixin using access_token.

    ctx.body = user;
}

//export default Oauth2Api;
module.exports = Oauth2Api;

