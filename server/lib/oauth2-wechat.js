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

export default class  Oauth2Api {
    constructor(opts) {
        this.opts = opts || {};
        var router = require('koa-router')(this.opts.router);
        router.all('/getState', this.getState(this.opts.jssdk.appId));
        router.all('/getUserInfo', this.getUserInfo(this.opts.jssdk));
        router.getOpenId = this.getOpenId;
        this.router = router;
    }

    getState (appid) {
        return function (ctx, next) {
            var scope = ctx.request.query.scope || ctx.request.body.scope;
            var session = ctx.session;
            console.log ("windsome getState1 ", scope, "session", session);
            // start a new oauth2 flow.
            var state =  Math.random().toString(36).substr(2, 6);
            var oauth2 = {
                appid: appid,
                state: state,
                scope: scope,
            };
            session.oauth2 = oauth2;
            console.log ("windsome getState2 ", session);
            ctx.body = oauth2;
        }
    }

    getOpenId () {
        return async function(ctx, next) {
            var code = ctx.request.query.code;
            var state = ctx.request.query.state;
            var session = ctx.session;
            var oauth2 = session.oauth2;
            debug ("windsome", code, state, "session", session);
            
            if (state == oauth2.state) {
                // after handshake from wechat, already login!
                var oauth2_next = { ...oauth2, code: code };
            }
            // check whether state is in cache?
            // check whether state's ip is same as that in the cache?
            // get oauth2 access_token from weixin
            // get user info from weixin using access_token.
            
            //ctx.body = {a:'aaaa', b:'bbbb'};
            await next ();
        };
    }

    getUserInfo (jssdk) {
        return async function (ctx, next){
            var code = ctx.request.query.code || ctx.request.body.code;
            var state = ctx.request.query.state || ctx.request.body.state;
            var session = ctx.session;
            var oauth2 = session.oauth2;
            debug ("windsome getUserInfo1", code, state, "session", session);
            var ret;
            // check whether state is in cache?
            if (state === oauth2.state) {
                // after handshake from wechat, already login!
                // TODO: check whether state's ip is same as that in the cache?
                // get oauth2 access_token from weixin
                var token = await jssdk.getOauthAccessToken (code);
                // combine all value, set code to -1 to invalid it.
                var oauth2_next = { ...oauth2, code: -1, ...token };
                
                // get user info from weixin using access_token.
                console.log ("windsome getUserInfo2", token);
                session.oauth2 = oauth2_next;
                ret = oauth2_next;
            } else {
                console.log ("not found state in cache! a illege request!");
                ret = {retcode: -2, message: "illege request!" };
            }
            console.log ("windsome getUserInfo2", ret);
            ctx.body = ret;
        }
    }
}

