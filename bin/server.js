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
const port = config.server_port
const host = config.server_host

const crypto = require('crypto'),
fs = require("fs"),
http = require("http");

var privateKey = fs.readFileSync('privatekey.pem').toString();
var certificate = fs.readFileSync('certificate.pem').toString();
var credentials = crypto.createCredentials({key: privateKey, cert: certificate});

http.createServer(server.callback()).listen(3000);
http.createServer(server.callback()).setSecure(credentials).listen(443);

