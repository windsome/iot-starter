/*
import config from '../config'
import server from '../server/main'
import _debug from 'debug'

const debug = _debug('app:bin:server')
const port = config.server_port
const host = config.server_host

server.listen(port)
debug(`Server is now running at http://${host}:${port}.`)
debug(`Server accessible via localhost:${port} if you are using the project defaults.`)
*/

import config from '../config'
import server from '../server/main'
import _debug from 'debug'
const debug = _debug('app:bin:server')

const host = config.server_host
const port = config.server_port
const port_https = config.server_port_https

var http = require("http");
var https = require('https');
  
http.createServer(server.callback()).listen(port);
https.createServer( config.https, server.callback() ).listen(port_https);

debug(`Server is now running at http://${host}:${port}.`)
debug(`Https Server is now running at http://${host}:${port_https}.`)
debug(`Server accessible via localhost:${port} and  localhost:${port_https} if you are using the project defaults.`)

