import _debug from 'debug'
const debug = _debug('app:server:wechat')

import fs from 'fs';

export default class WechatBase {
    constructor (opts) {
        this.setOpts (opts);
    }

    setOpts (opts) {
        opts = opts || {};
        this.appId = opts.appId;
        this.appSecret = opts.appSecret;
        this.debug = opts.debug || false;
        this.getToken = opts.getToken || function(appId) {
            var filename = 'access_token_'+appId+'.json';
            return this._defaultReadJson(filename);
        };
        this.saveToken = opts.saveToken || function(appId, token) {
            var filename = 'access_token_'+appId+'.json';
            return this._defaultSaveJson(filename, token);
        }
        this.opts = opts;
    }

    async getAccessToken () {
        if (this.debug) {
            console.log ("where store data?");
        }
        var cachedToken = this.getToken(this.appId);
        
        var currentTimestamp = parseInt(new Date().getTime() / 1000);
        var expireTime = (cachedToken && cachedToken.expire_time) || 0;
        if (expireTime < currentTimestamp) {
            // ticket has expire, need to request new access token.
            var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+this.appId+"&secret="+this.appSecret;
            var resJson = await this.get(url);
            if (resJson && resJson.access_token) {
                var newToken = {};
                newToken.expire_time = currentTimestamp + 7200;
                newToken.access_token = resJson.access_token;
                this.saveToken (this.appId, newToken);
                cachedToken = newToken;
            } else {
                console.log ("getAccessToken: request fail! url="+url);
            }
        }
        return cachedToken.access_token;
    }

    async request (url, opts, retry) {
        if (typeof retry === 'undefined') {
            retry = 3;
        }

        var data;
        try {
            var res = await fetch(url, opts || {} );
            data = res.json();
        } catch (error) { 
            console.log('fetch error: ' + error.message);
            let err = new Error(error.message);
            err.name = 'WeChatAPIError';
            err.code = -1;
            throw err;
        }

        if (data && data.errcode) {
            // get error!
            let err = new Error(data.errmsg);
            err.name = 'WeChatAPIError';
            err.code = data.errcode;
            
            if (data.errcode === 40001 && retry > 0) {
                // maybe access_token is timeout. update access_token, and retry!
                await this.getAccessToken ();
                return await this.request(url, opts, retry-1);
            }
            throw err;
        }
        return data;
    }
    
    async get (url) {
        return await this.request(url);
    }
    
    async post (url, data) {
        var opts = {
            dataType: 'json',
            method: 'POST',
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        return await this.request(url, opts);
    }

    _defaultReadJson (filename) {
        try {
            var fileContents = fs.readFileSync (filename);
            var data = JSON.parse (fileContents);
            console.log ("_defaultReadJson: ", filename, data);
            return data;
        } catch (err) {
            console.log ("_defaultReadJson fail: ", err.message);
        }
        return null;
    }

    _defaultSaveJson (filename, data) {
        try {
            fs.writeFileSync(filename, JSON.stringify(data));
            console.log ("_defaultSaveJson: ", filename, data);
            return data;
        } catch (err) {
            console.log ("_defaultSaveJson fail: ", err.message);
        }
        return null;
    }

}
