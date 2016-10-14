/**
 * @file   mqtt-lock.js
 * @author windsome.feng <86643838@163.com>
 * @date   Thu Oct 13 21:34:32 2016
 * 
 * @brief  
 * 
 * 
 */

import _debug from 'debug'
const debug = _debug('app:server:apis')

import mqtt from 'mqtt'
const fs = require("fs");

export default class MqttLock {
/*
    constructor (opts) {
        var client  = mqtt.connect('mqtt://mqtt.lancertech.net')
        
        client.on('connect', function () {
            client.subscribe('presence')
            client.publish('presence', 'Hello mqtt')
        })
        
        client.on('message', function (topic, message) {
            // message is Buffer
            console.log(message.toString())
            client.end()
        })

        this.client = client;
    }
*/
/*
    constructor (opts) {
        // see https://github.com/mqttjs/MQTT.js/issues/339
        var KEY = fs.readFileSync(__dirname + '\\mqttServer_key.pem');
        var CERT = fs.readFileSync(__dirname + '\\mqttServer_b64.cer');
        var TRUSTED_CA_LIST = fs.readFileSync(__dirname + '/ca.mqtt.lock.cer');
        
        var PORT = 8883;
        var HOST = 'mqttServer';
        
        var options = {
            port: PORT,
            host: HOST,
            keyPath: KEY,
            certPath: CERT,
            rejectUnauthorized : true,
            //The CA list will be used to determine if server is authorized
            ca: TRUSTED_CA_LIST,
            will: {
                topic: 'node/status',
                payload: new Buffer('offline')
            }
        };
        
        var client  = mqtt.connect('mqtts://mqttServer', options);
    }        
*/
    constructor (opts) {
        // see https://github.com/mqttjs/MQTT.js/issues/339
        this.opts = opts;
        var topicPrefix = '/broker/smartlock/';
        var TRUSTED_CA_LIST = fs.readFileSync(__dirname + '/ca.mqtt.lock.cer');
        var options = {
            port: 8883,
            host: 'mqtt.lancertech.net',
            //The CA list will be used to determine if server is authorized
            ca: TRUSTED_CA_LIST,
            will: {
                topic:topicPrefix+'server',
                qos:2
            }
        };
        
        var client  = mqtt.connect('mqtts://mqtt.lancertech.net', options);
        client.on('connect', function () {
            var serverTopic = topicPrefix+'server';
            console.log ("already connected, send test message to " + serverTopic);
            client.subscribe (serverTopic, {qos:2});
            client.publish (serverTopic, 'test');
        })
        
        var that = this;
        client.on('message', function (topic, message) {
            // message is Buffer
            //var msg = message.toString();
            //console.log("message", topic, msg)
            that.process (topic, message);
        })
        //client.on('message', this.process);
        
        this.topicPrefix = topicPrefix;
        this.client = client;
    }

    publish (target, msg) {
        var topic = this.topicPrefix + target;
        this.client.publish(topic, msg);
    }

    process (topic, message) {
        //console.log ("message", topic, message.toString());
        // message is Buffer
        var msg = {}; 
        try {
            msg = JSON.parse(message.toString());
        } catch (e) {
            console.log ("windsome", message.toString(), e);
        }
        console.log ("message", topic, msg);
        var res = {};
        var jssdk = this.opts.jssdk;
        switch (msg.cmd) {
        case 'get_access_token':
            res.uuid = msg.uuid;
            res.access_token = jssdk.getAccessToken();
            //res.access_token = '1111';
            this.publish (msg.uuid, JSON.stringify(res));
            break;
        default:
            console.log ("windsome: unsupport cmd");
            break;
        }
    }
}
