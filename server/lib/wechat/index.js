import _debug from 'debug'
const debug = _debug('app:server:wechat')

import Base from './base'
import Jssdk from './jssdk'
import Device from './device'
import Qrcode from './qrcode'
import User from './user'

export default class WechatApi {
    constructor (opts) {
        this.base = new Base (opts);
        this.jssdk = new Jssdk (this.base);
        this.device = new Device (this.base);
        this.qrcode = new Qrcode (this.base);
        this.user = new User (this.base);
    }
}
