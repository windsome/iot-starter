import config from '../../config';
import _debug from 'debug'
const debug = _debug('app:server:apis')

import mqtt from 'mqtt'
import KoaJwt from 'koa-jwt'
import Wechat from './wechat';
import models from '../models';
import { dbCreate, dbUpdate, dbList, dbDestroy, dbDestroyById } from './dbBase'

export default class WechatApi {
    constructor (opts) {
        // save opts.
        this.opts = opts || {};

        // init router for apis.
        var router = require('koa-router')(this.opts.router);
        this.router = router;
        this.redis =  this.opts.redis;

        // init wechat middleware.
        this.wechat = new Wechat(this.opts.wechat);

        // init database.
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

        // init mqtt client.
        const { url, prefix, ...restMqttOpts } = config.mqtt;
        this.mqttTopicPrefix = prefix;
        var client  = mqtt.connect(url, restMqttOpts);
        this.mqttClient = client;
        client.on('connect', function () {
            console.log ('connected '+url+' ok!');
            this.mqttConnected = true;
            var serverTopic = this.mqttTopicPrefix+'server';
            console.log ("subscribe to " + serverTopic);
            client.subscribe (serverTopic);
        }.bind(this));
        //client.on('message', function (topic, message) {
        //    console.log("message", topic, message.toString())
        //});
        client.on('message', this.processMqttMessageWrap.bind(this));

        
        // routers start.........
        // ......................
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
        // lock 
        router.all('/lock/check_cmd', this.checkLockCmd.bind(this));
        router.all('/lock/send_scene_id', this.sendSceneIdToLock.bind(this));
        router.all('/lock/password', this.setPassword.bind(this));
        router.all('/lock/get_password_list', this.getPasswordList.bind(this));
        router.all('/lock/get_config', this.getConfig.bind(this));
        router.all('/lock/update', this.updateLock.bind(this));
        router.all('/lock/open', this.openLock.bind(this));
        router.all('/lock/get_lock_list', dbList(models.Lock));
        router.all('/lock/find', this.findLock.bind(this));
        //router.all('/lock/config', this.getBindDevice());
        //router.all('/lock/reset', this.getBindDevice());

        // database/user
        //router.all('/db/list_user', this.dbListUser.bind(this));
        router.all('/db/create_user', this.dbCreateUser.bind(this));
        //router.all('/db/destroy_user', this.dbDestroyUser.bind(this));
        router.all('/db/update_user', this.dbUpdateUser.bind(this));
        router.all('/db/list_user', dbList(models.User));
        router.all('/db/destroy_user', dbDestroyById(models.User));
        // database/lock
        router.all('/db/create_lock', dbCreate(models.Lock));
        router.all('/db/update_lock', dbUpdate(models.Lock));
        router.all('/db/list_lock', dbList(models.Lock));
        router.all('/db/destroy_lock', dbDestroyById(models.Lock));

        // save router.
        //this.router = router;
    }

    async processMqttMessageWrap (topic, message) {
        try {
            return await this.processMqttMessage(topic, message);
        } catch (e) {
            console.log ("processMqttMessage fail!", e.message);
        }
    }
    async processMqttMessage (topic, message) {
        // Process Message published by Lock or App. 
        // ***currently, only Lock publish messages.
        // Lock ---publish---> Service
        console.log("message", topic, message.toString())
        var msg = {}; 
        try {
            var msgstr = message.toString();
            msg = JSON.parse(msgstr);
        } catch (e) {
            console.log ("parse error", message.toString(), e.message);
            return;
        }

        var res = {};
        var wechat = this.wechat;
        switch (msg.cmd) {
        case 'get_access_token':
            res.uuid = msg.uuid;
            res.access_token = await wechat.base.getAccessToken();
            //await this.sleep(4000);
            this.mqttClient.publish (msg.uuid, JSON.stringify(res));
            break;
        case 'register':
            // direct: LOCK->SERVICE, MQTT  
            // input: {cmd:'register', id: 'temp-UUID', mac:'mac'}  
            // output: {errcode:0, errmsg:'', ca1:'', ca2:'', ca3:'', id:'NEW-UUID', qrcode:''}  
            var instance = await models.Lock.create ({ id: msg.id, mac: msg.mac });
            var obj = instance && instance.get({ plain: true });
            if (obj) {
                this.mqttClient.publish(this.mqttTopicPrefix + msg.id, JSON.stringify({ cmd:'register_ack', errcode: 0, id: obj.id }), (err) => {
                    //console.log ("publish", err);
                });
            } else {
                console.log ("insert lock fail!");
            }
            
            break;
        case 'heartbeat':
            // direct: LOCK->SERVICE, MQTT  
            // input: {cmd:'heartbeat', id:'UUID'}  
            // output: {errcode: 0, errmsg:'', time:timestamp}  
            var timestamp = Math.round(new Date().getTime()/1000);
            this.mqttClient.publish(this.mqttTopicPrefix + msg.id, JSON.stringify({ cmd:'heartbeat_ack', errcode: 0, time: timestamp }), (err) => {
                console.log ("publish", err);
            });
            break;
        case 'log':
            // direct: LOCK->SERVICE, MQTT  
            // input: {cmd:'log', id:'UUID', log:[{action:scan, time:timestamp},{action:password, time:timestamp},...]}  
            // output: {errcode: 0, errmsg:''}  
            try {
                var logs = msg.log.map ((log) => ({ lockId: msg.id, 
                                                    info: JSON.stringify(log)
                                                  }) );
                var instance = await models.LockLog.bulkCreate(logs);
                console.log ("LockLog, insert", instance.length);
            } catch (e) {
                console.log ("log exception", e.message);
            }
            break;
        case 'qrcode':
            // direct: LOCK->SERVICE, MQTT  
            // input: {cmd:'qrcode', id:'UUID', scene_id:'GENERATED_SCENE_ID', expire: TIME_IN_SECONDS}  
            // output: {errcode: 0, errmsg:'', qrcode:'GENERATED_QRCODE', expire: TIME_IN_SECONDS}  
            var scene_id = Math.floor (Math.random()*100000);
            var obj = {id: msg.id, scene_id: scene_id};
            this.redis._redisClient.hmset('qrscene', scene_id.toString(), JSON.stringify(obj));
            var qrcode = await this.wechat.qrcode.createTmpQRCode (scene_id, msg.expire);
            console.log ("get qrcode", qrcode);
            this.mqttClient.publish(this.mqttTopicPrefix + msg.id, JSON.stringify({ cmd: 'qrcode_ack', ...qrcode }), (err) => {
                console.log ("publish", err);
            });
            break;
        case 'cmd_ack':
            var instance = await models.LockCmd.findOne({ where: { id: msg.cmd_id } });
            if (instance) {
                await instance.update({ ack: message.toString() });
                var obj = instance && instance.get({ plain: true });
                console.log ("update LockCmd", obj);
            } else {
                console.log ("no such command in LockCmd", msg);
            }
            break;
        default:
            console.log ("windsome: unsupport cmd");
            break;
        }
    }
    async sendSceneIdToLock (ctx, next) {
        // direct: APP->SERVICE->LOCK  
        // input: {id:'UUID', scene_id:'GENERATED_SCENE_ID'}  
        // output: {errcode: 0, errmsg:''}  
        var id = ctx.request.query.id || ctx.request.body.id;
        var scene_id = ctx.request.query.scene_id || ctx.request.body.scene_id;
        var lockCmd = await this._sendCmdToMqtt (this.mqttTopicPrefix+id, { cmd: 'send_scene_id', id: id, scene_id: scene_id });
        ctx.body = lockCmd;
        console.log ("sendSceneIdToLock", lockCmd);
    }
    async setPassword (ctx, next) {
        // direct: APP->SERVICE->LOCK
        // input: {id:'UUID', password:'MD5-PASSWORD'}  
        // output: {errcode: 0, errmsg:''}  
        var id = ctx.request.query.id || ctx.request.body.id;
        var password = ctx.request.query.password || ctx.request.body.password;
        var lockCmd = await this._sendCmdToMqtt (this.mqttTopicPrefix+id, { cmd: 'password', id: id, password: password });
        ctx.body = lockCmd;
        console.log ("setPassword", lockCmd);
    }
    async getPasswordList (ctx, next) {
        // direct: APP->SERVICE->LOCK  
        // input: {id:'UUID', cmd:'update', url:'https://......'}  
        // output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD'}  
        var id = ctx.request.query.id || ctx.request.body.id;
        var lockCmd = await this._sendCmdToMqtt (this.mqttTopicPrefix+id, { cmd: 'get_password_list', id: id });
        ctx.body = lockCmd;
        console.log ("getPasswordList", lockCmd);
    }
    async getConfig (ctx, next) {
        // direct: APP->SERVICE->LOCK  
        // input: {id:'UUID', cmd:'get_config'}  
        // output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD',id:'', ca1:'', ca2:'', ca3:'',software_version:'1.1.1',hardware_version:'1.0.1',mac:'MAC', ...OTHER_CONFIG}  
        var id = ctx.request.query.id || ctx.request.body.id;
        var lockCmd = await this._sendCmdToMqtt (this.mqttTopicPrefix+id, { cmd: 'get_config', id: id });
        ctx.body = lockCmd;
        console.log ("getConfig", lockCmd);
    }
    async updateLock (ctx, next) {
        // direct: APP->SERVICE->LOCK  
        // input: {id:'UUID', cmd:'update', url:'https://......'}  
        // output: {errcode: 0, errmsg:'', cmd_id: 'ID_IN_LOCK_CMD'}  
        var id = ctx.request.query.id || ctx.request.body.id;
        var url = ctx.request.query.url || ctx.request.body.url;
        var lockCmd = await this._sendCmdToMqtt (this.mqttTopicPrefix+id, { cmd: 'update', id: id, url: url });
        ctx.body = lockCmd;
        console.log ("updateLock", lockCmd);
    }
    async openLock (ctx, next) {
        // direct: APP->SERVICE->LOCK  
        // input: {id:'UUID', cmd:'open', ...OTHER_OPEN_DOOR_NEED_INFO}  
        // output: {errcode: 0, errmsg:''}  
        var id = ctx.request.query.id || ctx.request.body.id;
        var lockCmd = await this._sendCmdToMqtt (this.mqttTopicPrefix+id, { ...ctx.request.body, cmd: 'open', id: id });
        ctx.body = lockCmd;
        console.log ("openLock", lockCmd);
    }
    async _sendCmdToMqtt (topic, cmd, expire) {
        if (typeof(expire) == "undefined" || expire == null || isNaN(expire))
            expire = 30;

        // save cmd in LockCmd, and then send to mqtt.
        var instance = await models.LockCmd.create ({ cmd: JSON.stringify(cmd) });
        var obj = instance && instance.get({ plain: true });
        if (obj) {
            // insert into LockCmd table for async cmd temp storage.
            // wait for cmd ack to remove item in LockCmd.
            this.mqttClient.publish(topic, JSON.stringify({ cmd_id: obj.id, ...cmd }), (err) => {
                console.log ("publish", err);
            });
            // return obj;
            if ( expire <= 0) {
                return { errcode: 1, errmsg: 'LockCmd in queue!' }
            } else
                return await this._waitMqttResponse (obj.id, expire);
        } else {
            console.log ("LockCmd insert fail!");
            return { errcode: -1, errmsg: 'insert LockCmd fail!' };
        }
    }
    async _waitMqttResponse (cmd_id, expire) {
        if (!!!expire) expire = 20;

        for (var i = 0; i < expire; i++) {
        debug ("i", i);
            await this._sleep(1000);
            var instance = await models.LockCmd.findOne({ where: { id: cmd_id, ack: { $ne: null } } });
            var obj = instance && instance.get ({ plain: true });
            if (obj) {
                console.log ("_waitMqttResponse", obj);
                return JSON.parse(obj.ack);
            }
        }
        console.log ("timeout! cmd_id=" + cmd_id);
        return { errcode: 1, errmsg: 'timeout', cmd_id: cmd_id };
    }
    async _sleep(timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                resolve();
            }, timeout);
        });
    }
    async checkLockCmd (ctx, next) {
        // direct: APP->SERVICE  
        // input: {cmd_id: 'ID_IN_LOCK_CMD'}  
        // output: {LockCmd.ack字段内容}  
        var cmd_id = ctx.request.query.cmd_id || ctx.request.body.cmd_id;
        if (!cmd_id) {
            ctx.body = { errcode: -1, errmsg: 'parameter error! no cmd_id!' };
            return;
        }
        var instance = await models.LockCmd.findOne({ where: { id: cmd_id } });
        var obj = instance && instance.get({ plain: true });
        if (obj) {
            if (!obj.ack) {
                ctx.body = JSON.parse(obj.ack);
                return;
            } else {
                return { errcode: 1, errmsg: 'timeout', cmd_id: cmd_id };
            }
        }
        ctx.body = { errcode: -1, errmsg: 'not find such command!' };
    }
    async findLock (ctx, next) {
        // direct: APP->SERVICE  
        // input: {where: {id:'INPUT-UUID', mac:'INPUT-MAC', qrcode:'SCAN-QRCODE', device_id:'SCAN-DEVICE_ID'}}, where中的条件只需填写一项就行  
        // output: {errcode: 0, errmsg:'', data: {...}}  
        var where = ctx.request.query.where || ctx.request.body.where;
        try {
            if (where && (typeof where === 'string')) where = JSON.parse(where);
        } catch (e) {
            console.log ("parse fail", where, e.message);
            ctx.body = {errcode: -1, errmsg: e.message};
            return;
        }

        var instance = await models.Lock.findOne({ where: where });
        if (instance) {
            var obj = instance && instance.get({ plain: true });
            if (obj) {
                console.log ("windsome", obj);
                ctx.body = { errcode: 0, data: obj };
                return;
            }
        }
        ctx.body = {errcode: -1, errmsg: 'no such record!'};
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
