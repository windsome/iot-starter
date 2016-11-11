import _debug from 'debug'
const debug = _debug('app:server:wechat')

export default class WechatUser {
    constructor (base) {
        this.base = base;
    }

    async updateRemark(openid, remark) {
        var access_token = await this.base.getAccessToken();
        var url = 'https://api.weixin.qq.com/cgi-bin/user/info/updateremark?access_token=ACCESS_TOKEN'.replace(/ACCESS_TOKEN/g, access_token);
        return await this.base.post(url, {
            openid: openid,
            remark: remark
        });
    }

    async getUserInfo (openid, lang) {
        if (typeof lang === 'undefined') lang='zh_CN';
        var access_token = await this.base.getAccessToken();
        var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=LANG'.replace(/ACCESS_TOKEN/g, access_token).replace(/OPENID/g, openid).replace(/LANG/g, lang);
        return await this.base.get(url);
    }

    async batchGetUsers (openids, lang) {
        if (!!lang) lang='zh_CN';
        var access_token = await this.base.getAccessToken();
        var url = 'https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token=ACCESS_TOKEN'.replace(/ACCESS_TOKEN/g, access_token);

        var data = {};
        data.user_list = openids.map( (openid) => ({openid: openid, lang: lang}) );
        return await this.base.post(url, data);
    }


    async getFollowers (nextOpenid) {
        if (!!nextOpenid) nextOpenid='';
        var access_token = await this.base.getAccessToken();
        var url = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID'.replace(/ACCESS_TOKEN/g, access_token).replace(/NEXT_OPENID/g, nextOpenid);
        return await this.base.get(url);
    }
}
