import _debug from 'debug'
const debug = _debug('app:server:wechat')

import Base from './base'
import Jssdk from './jssdk'
import Device from './device'

export default class WechatApi {
    constructor (opts) {
        this.base = new Base (opts);
        this.jssdk = new Jssdk (this.base);
        this.device = new Device (this.base);
    }
}
