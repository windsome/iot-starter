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

import convert from 'koa-convert'
var wechat = require('co-wechat');

function* processMessage() {
  // 微信输入信息都在this.weixin上
  var message = this.weixin;
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

export default function WechatMessage (opts) {
    opts = opts || {};
    var router = require('koa-router')(opts.router);
    router.all('/', convert (wechat(opts.token).middleware(processMessage)));
    //router.all('/', convert (wechat('Q0hctpus1eH5xdvrXBuTYzS23OewxhgO').middleware(processMessage)));
    return router;
}

/*
var wechat = require('co-wechat');
app.use('/wechat', convert (wechat('Q0hctpus1eH5xdvrXBuTYzS23OewxhgO').middleware(function *() {
  // 微信输入信息都在this.weixin上
  var message = this.weixin;
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
})));
*/
