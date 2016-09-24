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

const WechatJsSdk = new JsSdk ({appId:'wx1a6eca02cffc398c', appSecret:'e8bed04caeabe4129674a289847eb509', origin:'gh_9e62dd855eff'});
const debug = _debug('app:server')
const paths = config.utils_paths
const app = new Koa()

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
var routerApi1 = require('./lib/router-apis-wechat')({router:{prefix: '/apis'}, jssdk:WechatJsSdk});
app.use(routerApi1.routes()).use(routerApi1.allowedMethods());
/*
var koajwt = require('koa-jwt');
var token = koajwt.sign({ id: 123 }, 'mysecret', { expiresIn: 60*60 });
console.log ("token", token);
app.use(convert(koajwt({ secret: 'mysecret' })));
//app.use(jwt({ secret: 'shared-secret' }).unless({ path: [/^\/public/] }));
//app.use(jwt({ secret: publicKey }));
app.use(convert(function *(){
  if (this.url.match(/^\/apis/)) {
    this.body = {wokao:"protected", cao:"11"};
  } else {
    this.body = {wokao:'xxxx'};
  }
}));
*/

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

export default app
