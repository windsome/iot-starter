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

//const crypto = require('crypto'),
const fs = require("fs"),
http = require("http"),
https = require('https');
  
http.createServer(server.callback()).listen(3000);
https.createServer( { key: fs.readFileSync('2_mp.lancertech.net.key'), 
                      cert: fs.readFileSync('1_mp.lancertech.net_cert.crt') 
                    }, 
                    server.callback()
                  ).listen(443);


