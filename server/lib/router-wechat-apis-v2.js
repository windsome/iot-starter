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
import models from '../models';

export default class WechatApi {
    constructor (opts) {
        this.opts = opts || {};
        this.wechat = new Wechat(this.opts.wechat);
        var mqttOpts = this.opts.mqtt;
        mqttOpts = { ...mqttOpts, wechat: this.wechat };
        this.mqttLock = new MqttLock(mqttOpts);
        this.initDatabase ();

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

        // database/user
        //router.all('/db/list_user', this.dbListUser.bind(this));
        router.all('/db/create_user', this.dbCreateUser.bind(this));
        //router.all('/db/destroy_user', this.dbDestroyUser.bind(this));
        router.all('/db/update_user', this.dbUpdateUser.bind(this));
        router.all('/db/list_user', this.dbList(models.User).bind(this));
        router.all('/db/destroy_user', this.dbDestroyById(models.User));
        // database/lock
        router.all('/db/create_lock', this.dbCreate(models.Lock).bind(this));
        router.all('/db/update_lock', this.dbUpdate(models.Lock));
        router.all('/db/list_lock', this.dbList(models.Lock));
        router.all('/db/destroy_lock', this.dbDestroyById(models.Lock));

        // save router.
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
            ret = {errcode: -2, message: "illege request!" };
        }
        console.log ("windsome getUserInfo2", ret);
        ctx.body = ret;
    }

    // database.
    initDatabase () {
        this.database_status = false;
        models.sequelize.sync()
            .then(function() {
                debug ("windsome database init ok!");
                this.database_status = true;
            }.bind(this))
            .catch(function (e) {
                debug ("windsome database init fail!", e.message);
                this.database_status = false;
            }.bind(this));
    }
    // common database method.
    dbCreate (table) {
        return async function (ctx) {
            var thing = ctx.request.query.thing || ctx.request.body.thing;
            try {
                if (thing && (typeof thing === 'string')) thing = JSON.parse(thing);
            } catch (e) {
                ctx.body = {errcode: -1, errmsg: e.message};
                return;
            }
            //console.log ("windsome mqtt", this.mqttLock);
            var instance = await table.create(thing);
            var obj = instance && instance.get({ plain: true });
            console.log ("windsome", obj);
            ctx.body = {...obj, errcode: 0};
        }
    }
    
    dbUpdate (table) {
        return async function (ctx) {
            var thing = ctx.request.query.thing || ctx.request.body.thing;
            try {
                if (thing && (typeof thing === 'string')) thing = JSON.parse(thing);
            } catch (e) {
                ctx.body = {errcode: -1, errmsg: e.message};
                return;
            }
            var id = ctx.request.query.id || ctx.request.body.id || thing.id;

            var instance = await table.findOne({ where: { id: id } });

            if (instance) {
                await instance.update(thing);
                var obj = instance && instance.get({ plain: true });
                console.log ("windsome", obj);
                ctx.body = {...obj, errcode: 0};
            } else {
                ctx.body = {errcode: -1, errmsg: 'no such record!'};
            }
        }
    }

    dbList (table) {
        return async function (ctx) {
            var offset = ctx.request.query.offset || ctx.request.body.offset || 0;
            var count = ctx.request.query.count || ctx.request.body.count || 10;
            var instances = await table.findAll({
                offset: offset,
                limit: count
            });
            //console.log ("windsome", locks);
            var objs = instances.map((instance)=>{return instance.get({ plain:true })});
            ctx.body = {errcode: 0, data: objs};
        }
    }

    dbDestroyById (table) {
        return async function (ctx) {
            var id = ctx.request.query.id || ctx.request.body.id;
            var count = await table.destroy({
                where: {
                    id: id
                }
            });
            console.log ("windsome", count);
            ctx.body = {errcode: 0, count: count};
        }
    }

    // database/user
    async dbListUser (ctx) {
        var offset = ctx.request.query.offset || ctx.request.body.offset || 0;
        var count = ctx.request.query.count || ctx.request.body.count || 10;
        var users = await models.User.findAll({
            offset: offset,
            limit: count,
            include: [ models.Lock ]
        });
        //console.log ("windsome", users);
        var objs = users.map((user)=>{return user.get({ plain:true })});
        ctx.body = {errcode: 0, users: objs};
    }

    async dbCreateUser (ctx) {
        var openid = ctx.request.query.openid || ctx.request.body.openid;
        var info = ctx.request.query.info || ctx.request.body.info;
        var instance = await models.User.create({
            openid: openid,
            info: info
        });
        var obj = instance && instance.get({ plain: true });
        console.log ("windsome", obj);
        ctx.body = {...obj, errcode: 0};
    }

    async dbUpdateUser (ctx) {
        var id = ctx.request.query.id || ctx.request.body.id;

        var instance = await models.User.findOne({ where: { id: id } });

        if (instance) {
            var openid = ctx.request.query.openid || ctx.request.body.openid;
            var info = ctx.request.query.info || ctx.request.body.info;
            var toUpdate = {};
            if (!!openid) toUpdate.openid = openid;
            if (!!info) toUpdate.info = info;
            await instance.update(toUpdate);
            var obj = instance && instance.get({ plain: true });
            console.log ("windsome", obj);
            ctx.body = {...obj, errcode: 0};
        } else {
            ctx.body = {errcode: -1, errmsg: 'no such record!'};
        }
    }

    async dbDestroyUser (ctx) {
        var id = ctx.request.query.id || ctx.request.body.id;
        var count = await models.User.destroy({
            where: {
                id: id
            }
        });
        console.log ("windsome", count);
        ctx.body = {errcode: 0, count: count};
    }
    
}
