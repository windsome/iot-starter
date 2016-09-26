/**
 * @file   JsSdk.js
 * @author windsome.feng <86643838@163.com>
 * @date   Wed Sep 21 10:34:35 2016
 * 
 * @brief  微信公众号SDK服务器端代码，用于获取URL签名
 *         允许微信中网页通过JS调用微信的功能，包含菜单的功能，转发，拍照，GPS等。
 * 
 * 
 */

// 
var fs = require('fs');
var SyncRequest = require('sync-request');

module.exports = JsSdk;

function JsSdk (options) {
    var opts = options || {};
    this.appId = opts.appId;
    this.appSecret = opts.appSecret;
    this.debug = opts.debug || false;

}

JsSdk.prototype.getSignPackage = function getSignPackage(url) {
    var jsApiTicket = this._getJsApiTicket();
    var currentTimestamp = parseInt(new Date().getTime() / 1000) + '';

    var raw = function (args) {
        var keys = Object.keys(args);
        keys = keys.sort()
        var newArgs = {}; 
        keys.forEach(function (key) {
            newArgs[key.toLowerCase()] = args[key];
        }); 
        
        var string = ''; 
        for (var k in newArgs) {
            string += '&' + k + '=' + newArgs[k];
        }
        string = string.substr(1);
        return string;
    };
    
    var ret = { 
        jsapi_ticket: jsApiTicket,
        nonceStr: this._createNonceStr(),
        timestamp: currentTimestamp,
        url: url 
    };
    var string = raw(ret);
    var jsSHA = require('jssha');
    var shaObj = new jsSHA(string, 'TEXT');
    ret.signature = shaObj.getHash('SHA-1', 'HEX');
    ret.appId = this.appId;
    
    return ret;
}

JsSdk.prototype._createNonceStr = function _createNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}

JsSdk.prototype._getJsApiTicket = function _getJsApiTicket() {
    if (this.debug) {
        
    }

    var fileContents;
    try {
        fileContents = fs.readFileSync('jsapi_ticket.json');
    } catch (err) {
        console.log ("read file fail: " + err);
    }
    if (!fileContents) fileContents='{}';
    console.log ("fileContents="+fileContents);
    var data = JSON.parse (fileContents);

    var currentTimestamp = parseInt(new Date().getTime() / 1000);
    var expireTime = (data && data.expire_time) || 0;
    if (expireTime < currentTimestamp) {
        // ticket has expire.
        console.log ("ticket has expired, need refresh!");
        var accessToken = this._getAccessToken();
        var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=1&access_token="+accessToken;
        console.log ("getticket url="+url);
        var res = SyncRequest('GET', url);
        var resJson = JSON.parse(res.getBody());
        var ticket = resJson.ticket;
        if (ticket) {
            data.expire_time = currentTimestamp + 7200;
            data.ticket = ticket;
            if (this.debug) {
                
            }
            try {
                fs.writeFileSync("jsapi_ticket.json", JSON.stringify(data));
            } catch (err) {
                console.log ("write file fail: " + err);
            }
        } else {
            console.log ("_getJsApiTicket: request fail! url="+url);
        }
    } else {
        return data.jsapi_ticket;
    }
}

JsSdk.prototype._getAccessToken = function _getAccessToken() {
    if (this.debug) {
        console.log ("where store data?");
    }
    var fileContents;
    try {
        fileContents = fs.readFileSync('access_token.json');
    } catch (err) {
        console.log ("read file fail: " + err);
    }
    console.log ("fileContents="+fileContents);
    if (!fileContents) fileContents='{}';
    var data = JSON.parse (fileContents);

    var currentTimestamp = parseInt(new Date().getTime() / 1000);
    var expireTime = (data && data.expire_time) || 0;
    if (expireTime < currentTimestamp) {
        // ticket has expire.
        console.log ("access_token has expired, need refresh! url="+url);
        var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+this.appId+"&secret="+this.appSecret;
        console.log ("token url="+url);
        var res = SyncRequest('GET', url);
        console.log ("SyncRequest:"+res.getBody());
        var resJson = JSON.parse(res.getBody());
        var access_token = resJson.access_token;
        if (access_token) {
            data.expire_time = currentTimestamp + 7200;
            data.access_token = access_token;
            if (this.debug) {
                
            }
            try {
                fs.writeFileSync("access_token.json", JSON.stringify(data));
            } catch (err) {
                console.log ("write file fail: " + err);
            }
        } else {
            console.log ("_getAccessToken: request fail! url="+url);
        }
    } else {
        // use cache access_token;
    }
    return data.access_token;
}

JsSdk.prototype.getOauthAccessToken = async function (code) {
    var ret;
    try {
        var res = await fetch('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+this.appId+'&secret='+this.appSecret+'&code='+code+'&grant_type=authorization_code');
        ret = res.json();
    } catch (error) { 
        console.log('fetch error: ' + error.message);
        ret = {
            retcode: -1,
            message: error.message
        };
    }
    return ret;
}
