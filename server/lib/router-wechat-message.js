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
const debug = _debug('app:server:wechat')

import convert from 'koa-convert'
var wechat = require('co-wechat');

var apis = null;
var redis = null;

async function doEventScene (ctx, qrscene) {
    if (apis && redis) {
        redis._redisClient.hgetall ('qrscene',async function(err,res){
            if (err) {
                console.log('Error:'+ err);
                ctx.body='error';
                return;
            }
            console.dir(res);
            var scene_value = res[qrscene];
            if (scene_value) {
                var obj = JSON.parse (scene_value);
                console.log ('get qrscene', obj);
                var lockCmd = await apis._sendCmdToMqtt (apis.mqttTopicPrefix+id, { cmd: 'open', id: obj.id });
                ctx.body='success';
                return;
            }
            ctx.body='error';
            return;
        });
    }
}

async function processMessage(ctx, next) {
    // 微信输入信息都在this.weixin上
    var message = ctx.weixin;
    console.log ("windsome processMessage", message);

    switch (message.MsgType) {
    case 'event': {
        var event = message.Event && message.Event.toLowerCase();
        switch (event) {
        case 'subscribe': {
            if (message.EventKey && (message.EventKey.indexOf('qrscene_') >= 0)) {
                // get qrcode, scene_id
                var qrscene = message.EventKey.substr(message.EventKey.indexOf('qrscene_'), 'qrscene_'.length);
                debug ("get scene_id:"+ qrscene);
                return await doEventScene(ctx, qrscene);
            }
        }
        case 'scan': {
            var qrscene = message.EventKey;
            debug ("get scene_id:"+ qrscene);
            return await doEventScene(ctx, qrscene);
        }
        default:
            break;
        }
        break;
    }
    case 'text':
        break;
    case 'image':
        break;
    case 'voice':
        break;
    case 'video':
        break;
    case 'location':
        break;
    case 'link':
        break;
    default:
        ctx.body = 'fail';
        break;
    }
    ctx.body = 'success';
}

/*function* processMessage() {
  // 微信输入信息都在this.weixin上
  var message = this.weixin;
  console.log ("windsome processMessage", message);
  if (message.FromUserName === 'diaosi') {
    // 回复屌丝(普通回复)
    this.body = 'hehe';
  } else if (message.FromUserName === 'text') {
    //你也可以这样回复text类型的信息
    this.body = {
      content: 'text object',
      type: 'text'
    };
  } else if (message.FromUserName === 'hehe') {
    // 回复一段音乐
    this.body = {
      type: "music",
      content: {
        title: "来段音乐吧",
        description: "一无所有",
        musicUrl: "http://mp3.com/xx.mp3",
        hqMusicUrl: "http://mp3.com/xx.mp3"
      }
    };
  } else if (message.FromUserName === 'kf') {
    // 转发到客服接口
    this.body = {
      type: "customerService",
      kfAccount: "test1@test"
    };
  } else {
    // 回复高富帅(图文回复)
    this.body = [
      {
        title: '你来我家接我吧',
        description: '这是女神与高富帅之间的对话',
        picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
        url: 'http://nodeapi.cloudfoundry.com/'
      }
    ];
  }
}
*/
export default function WechatMessage (opts) {
    opts = opts || {};
    apis = opts.apis;
    redis = opts.redis;
    var router = require('koa-router')(opts.router);
    router.all('/', wechat(opts.token).middleware2(processMessage));
    //router.all('/', convert (wechat('Q0hctpus1eH5xdvrXBuTYzS23OewxhgO').middleware(processMessage)));
    return router;
}

