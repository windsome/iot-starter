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

var koaRoute = require('koa-route');
var apis = {
    getSignPackage: function *(){
        this.body = 'pets: ';
        var pkg = WechatJsSdk.getSignPackage('http://lancertech.net/a.html');
        console.log ("getSignPackage:"+JSON.stringify(pkg));
    },
    
    getSignPackage2: function *(name){
        if (name == "notfound") return this.throw('cannot find that pet', 404);
        this.body = name;
    }
};
app.use(convert(koaRoute.get('/apis/getSignPackage', apis.getSignPackage)));
app.use(convert(koaRoute.get('/apis/getSignPackage/:name', apis.getSignPackage2)));

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
