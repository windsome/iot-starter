import Koa from 'koa'
import convert from 'koa-convert'
import webpack from 'webpack'
import webpackConfig from '../build/webpack.config'
import historyApiFallback from 'koa-connect-history-api-fallback'
import serve from 'koa-static'
import proxy from 'koa-proxy'
import _debug from 'debug'
import config from '../config'
import webpackDevMiddleware from './middleware/webpack-dev'
import webpackHMRMiddleware from './middleware/webpack-hmr'
import JsSdk from './lib/wechat/JsSdk'
import 'isomorphic-fetch';

import Oauth2Api from './lib/oauth2-wechat';
import WechatApi from './lib/router-apis-wechat';

const WechatJsSdk = new JsSdk ({appId:'wx1a6eca02cffc398c', appSecret:'e8bed04caeabe4129674a289847eb509', origin:'gh_9e62dd855eff'});
const debug = _debug('app:server')
const paths = config.utils_paths
const app = new Koa()

var session = require('koa-generic-session');
var RedisStore = require('koa-redis');
app.keys = ['keys', 'keykeys'];
app.use(convert(session({
  store: new RedisStore()
})));

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

var contentType = require('content-type')
var getRawBody = require('raw-body')
app.use(convert(function * (next) {
    //var rawText = yield getRawBody(this.req)
    var rawText = "";
    console.log ("["+this.req.method+"]["+this.req.url+"] "+rawText);
    //this.request.body = JSON.parse(rawText);
    yield next
}))

var bodyParser = require('koa-bodyparser');
app.use(convert(bodyParser()));

//var json = require('koa-json'); // response json body.
//app.use(convert(json()));

var routerOauth2 = new Oauth2Api ({ jssdk: WechatJsSdk, router:{prefix: '/apis'} });
app.use(routerOauth2.router.routes()).use(routerOauth2.router.allowedMethods());

var routerApi2 = new WechatApi({ router:{prefix: '/apis'}, jwt: {secret: 'mysecret', expiresIn:3600 }, jssdk:WechatJsSdk });
app.use(routerApi2.router.routes()).use(routerApi2.router.allowedMethods());

// Enable koa-proxy if it has been enabled in the config.
if (config.proxy && config.proxy.enabled) {
  app.use(convert(proxy(config.proxy.options)))
}

// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement isomorphic
// rendering, you'll want to remove this middleware.
app.use(convert(historyApiFallback({
  verbose: false
})))

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
  const compiler = webpack(webpackConfig)

  // Enable webpack-dev and webpack-hot middleware
  const { publicPath } = webpackConfig.output

  app.use(webpackDevMiddleware(compiler, publicPath))
  app.use(webpackHMRMiddleware(compiler))

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(serve(paths.client('static')))
} else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(serve(paths.dist()))
}

app.use(function (ctx, next) {
    var rawText = "";
    console.log ("not done! ["+ctx.req.method+"]["+ctx.req.url+"] "+rawText);
    //this.request.body = JSON.parse(rawText);
})

export default app
