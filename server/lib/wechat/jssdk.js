import _debug from 'debug'
const debug = _debug('app:server:wechat')

export default class WechatJssdk {
    constructor (base, getApiTicket, saveApiTicket) {
        this.base = base;
        this.getApiTicket = getApiTicket || function (appId) {
            var filename = 'temp/jsapi_ticket_'+appId+'.json';
            return this.base._defaultReadJson(filename);
        };
        this.saveApiTicket = saveApiTicket || function (appId, ticket) {
            var filename = 'temp/jsapi_ticket_'+appId+'.json';
            return this.base._defaultSaveJson(filename, ticket);
        };
    }

    async getSignPackage (url) {
        if (this.base.debug) {
            console.log ("where store data?");
        }
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
        ret.appId = this.base.appId;
        
        return ret;
    }

    async getOauthAccessToken(code) {
        var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+this.base.appId+'&secret='+this.base.appSecret+'&code='+code+'&grant_type=authorization_code';
        return await this.base.get(url);
    }

    _createNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    }

    async _getJsApiTicket() {
        var cachedTicket = this.getApiTicket (this.base.appId);
        var currentTimestamp = parseInt(new Date().getTime() / 1000);
        var expireTime = (cachedTicket && cachedTicket.expire_time) || 0;
        if (expireTime < currentTimestamp) {
            // ticket has expire.
            console.log ("ticket has expired, need refresh!");
            var accessToken = await this.base.getAccessToken();
            var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=1&access_token="+accessToken;
            var resJson = await this.base.get(url);
            if (resJson && resJson.ticket) {
                var newTicket = {};
                newTicket.expire_time = currentTimestamp + 7200;
                newTicket.ticket = resJson.ticket;
                this.saveApiTicket(this.base.appId, newTicket);
                cachedTicket = newTicket;
            } else {
                console.log ("_getJsApiTicket: request fail! url="+url);
            }
        }
        return cachedTicket.jsapi_ticket;
    }

}
