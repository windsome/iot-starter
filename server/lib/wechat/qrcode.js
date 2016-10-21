import _debug from 'debug'
const debug = _debug('app:server:wechat')

export default class WechatQrcode {
    constructor (base) {
        this.base = base;
    }

    async createTmpQRCode (sceneId, expire) {
        var access_token = await this.base.getAccessToken();
        var url = 'https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=ACCESS_TOKEN'.replace(/ACCESS_TOKEN/g, access_token);
        return await this.base.post(url, {
            expire_seconds: expire,
            action_name: 'QR_SCENE',
            action_info: { scene: { scene_id: sceneId } }
        });
    }
}
