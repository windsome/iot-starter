import _debug from 'debug'
const debug = _debug('app:server:apis')

import { dbCreate, dbUpdate, dbList, dbDestroy, dbDestroyById } from './dbBase'
import Wechat from './wechat';
import MqttLock from './mqtt-lock';
import models from '../models';

export default class ServiceLock {
    constructor (router, wechat) {
        this.router = router;
        this.wechat = wechat;
        // lock associate.

        // database/lock
        router.all('/db/create_lock', this.dbCreate(models.Lock).bind(this));
        router.all('/db/update_lock', this.dbUpdate(models.Lock));
        router.all('/lock/list_lock', dbList(models.Lock));
        router.all('/db/destroy_lock', this.dbDestroyById(models.Lock));
    }

}
