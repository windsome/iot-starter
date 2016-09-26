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

export default class WechatApi {
    constructor (opts) {
        this.opts = opts || {};
        var router = require('koa-router')(this.opts.router);
        router.all('/getJwt', this.getJwt());
        if (this.opts.jwt) {
            console.log ("windsome", this.opts.jwt);
            var convert = require('koa-convert');
            router.use(convert(KoaJwt({ secret: this.opts.jwt.secret })));
        }
        //console.log ("windsome:", routerOpts, JsSdk, router);
        router.all('/getSignPackage', this.getSignPackage());
        router.get('/getSignPackage/:name', this.getSignPackage2);
        router.all('/login', this.login);
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
    getSignPackage () {
        var WechatJsSdk = this.opts.jssdk;
        return (ctx, next) => {
            console.log ("body:"+JSON.stringify(ctx.request.body));
            var url = ctx.request.body.url;
            var pkg = WechatJsSdk.getSignPackage(url);
            console.log ("url="+url+", getSignPackage:"+JSON.stringify(pkg));
            ctx.body = pkg;
        };
    }
    
    getSignPackage2 (ctx, next){
        var name = ctx.params.name;
        if (name == "notfound") return ctx.throw('cannot find that pet', 404);
        ctx.body = {a:'aaaa', b:'bbbb'};
    }

    login (ctx, next){
        var user = ctx.request.body;
        console.log ("login:"+JSON.stringify(user));
        ctx.body = {a:'aaaa', b:'bbbb'};
    }
}
