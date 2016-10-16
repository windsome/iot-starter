/**
 * @file   middleware-apis.js
 * @author windsome.feng <86643838@163.com>
 * @date   Sat Sep 24 15:37:22 2016
 * 
 * @brief  should use access_token, we need user/authentication info.
 * 
 * 
 */
import KoaJwt from 'koa-jwt'

import _debug from 'debug'
const debug = _debug('app:server:apis')

import Wechat from './wechat';
import MqttLock from './mqtt-lock';

export default class WechatApi {
    constructor (opts) {
        this.opts = opts || {};
        this.wechat = new Wechat(this.opts.wechat);
        var mqttOpts = this.opts.mqtt;
        mqttOpts = { ...mqttOpts, wechat: this.wechat };
        this.mqttLock = new MqttLock(mqttOpts);

        var router = require('koa-router')(this.opts.router);
        router.all('/getJwt', this.getJwt());
        //if (this.opts.jwt) {
        //    console.log ("windsome", this.opts.jwt);
        //    var convert = require('koa-convert');
        //    router.use(convert(KoaJwt({ secret: this.opts.jwt.secret })));
        //}

        // test
        router.get('/getSignPackage/:name', this.getSignPackage2.bind(this));
        router.all('/login', this.login);
        // oauth2
        router.all('/oauth2/get_state', this.oauth2GetState.bind(this));
        router.all('/oauth2/get_user_info', this.oauth2GetUserInfo.bind(this));
        // jsapi
        router.all('/jsapi/get_sign_package', this.getSignPackage.bind(this));
        // device
        router.all('/device/get_bind_device', this.getBindDevice());
        
        this.router = router;
    }

    getJwt () {
        var jwt = this.opts.jwt;
        return (ctx, next) => {
            var token = "";
            if (jwt) {
                var secret = jwt && jwt.secret;
                var expiresIn = jwt && jwt.expiresIn;
                var openid = ctx.request.body.openid;
                // get user info from openid.
                var info = { openid: openid };
                token = KoaJwt.sign(info, secret, { expiresIn: expiresIn });
                //var token = KoaJwt.sign({ id: 123 }, 'mysecret', { expiresIn: 60*60 });
                console.log ("token", token);
            }
            ctx.body = { jwt: token };
        };
    }

    async getSignPackage (ctx, next) {
        console.log ("body:"+JSON.stringify(ctx.request.body));
        var url = ctx.request.body.url;
        var pkg = await this.wechat.jssdk.getSignPackage(url);
        console.log ("url="+url+", getSignPackage:"+JSON.stringify(pkg));
        ctx.body = pkg;
    }

    getBindDevice () {
        var wechatDevice = this.wechat.device;
        return async (ctx, next) => {
            var oauth2 = ctx.session.oauth2;
            var openid = oauth2 && oauth2.openid;
            var pkg = await wechatDevice.getBindDevice(openid);
            console.log ("getBindDevice", openid, pkg);
            ctx.body = pkg;
        };
    }
    
    async getSignPackage2 (ctx, next){
        var name = ctx.params.name;
        var pkg = await this.wechat.jssdk.getSignPackage(name);
        if (name == "notfound") return ctx.throw('cannot find that pet', 404);
        ctx.body = {a:'aaaa', b:'bbbb'};
    }

    login (ctx, next){
        var user = ctx.request.body;
        console.log ("login:"+JSON.stringify(user));
        ctx.body = {a:'aaaa', b:'bbbb'};
    }

    // oauth2
    oauth2GetState(ctx, next) {
        var scope = ctx.request.query.scope || ctx.request.body.scope;
        //var session = ctx.session;
        //console.log ("windsome getState1 ", scope, "session", session);
        // start a new oauth2 flow.
        var state =  Math.random().toString(36).substr(2, 6);
        var oauth2 = {
            appid: this.wechat.base.appId,
            state: state,
            scope: scope,
        };
        ctx.session.oauth2 = oauth2;
        console.log ("windsome getState2 ", oauth2);
        ctx.body = oauth2;
    }

    async oauth2GetUserInfo (ctx, next){
        var code = ctx.request.query.code || ctx.request.body.code;
        var state = ctx.request.query.state || ctx.request.body.state;
        //var session = ctx.session;
        var oauth2 = ctx.session.oauth2;
        debug ("windsome getUserInfo1", code, state, "oauth2", oauth2);
        var ret;
        // check whether state is in cache?
        if (state && oauth2 && (state == oauth2.state)) {
            // after handshake from wechat, already login!
            // TODO: check whether state's ip is same as that in the cache?
            // get oauth2 access_token from weixin
            var token = await this.wechat.jssdk.getOauthAccessToken (code);
            // combine all value, set code to -1 to invalid it.
            var oauth2_next = { ...oauth2, code: -1, ...token };
            
            // get user info from weixin using access_token.
            console.log ("windsome getUserInfo2", token);
            ctx.session.oauth2 = oauth2_next;
            ret = oauth2_next;
        } else {
            console.log ("not found state in cache! a illege request!");
            ret = {retcode: -2, message: "illege request!" };
        }
        console.log ("windsome getUserInfo2", ret);
        ctx.body = ret;
    }
    
}
