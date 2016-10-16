import _debug from 'debug'
const debug = _debug('app:server:wechat')

export default class WechatDevice {
    constructor (base) {
        this.base = base;
    }

    async getBindDevice(openid) {
        var access_token = await this.base.getAccessToken();
        var url = 'https://api.weixin.qq.com/device/get_bind_device?access_token=ACCESS_TOKEN&openid=OPENID'.replace(/ACCESS_TOKEN/g, access_token).replace(/OPENID/g, openid);
        return await this.base.get(url);
    }

}
