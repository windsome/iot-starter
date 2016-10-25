import { injectReducer } from '../../../store/reducers';
import HeaderLock from './components/HeaderLock';
import Header from './components/Header';

export default (store) => ({
    path: 'admin',
    component: require('./components/AdminLayout').default,
    /*getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const Zen = require('./containers/ZenContainer').default
            const zenReducer = require('./modules/zen').default
            
            injectReducer(store, { key:'zen', reducer:zenReducer })
            
            cb(null, Zen)
        }, 'zen')
    },*/
    indexRoute: {
        onEnter: function (nextState, replace) {
            replace('/iot/admin/lock')
        }
    },
    childRoutes: [
        {
            path: 'lock',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const LockList = require('./containers/LockListContainer').default
                    const adminLocksReducer = require('../modules/admin').default
                    injectReducer(store, { key:'admin', reducer:adminLocksReducer })
                    cb(null, { header: Header, main:LockList })
                }, 'admin')
            }
        },
        {
            path: 'lock/:lockId',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const LockInfo = require('./containers/LockInfoContainer').default
                    const adminLockReducer = require('../modules/admin').findLockReducer;
                    injectReducer(store, { key:'adminlock', reducer:adminLockReducer })
                    
                    cb(null, { header: HeaderLock, info: LockInfo })
                    //cb(null, LockInfo)
                }, 'admin')
            }
        },
        {
            path: 'lock/:lockId/set_password',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const LockInfo = require('./containers/LockInfoContainer').default
                    const LockSetPassword = require('./containers/LockSetPasswordCon').default

                    const passwordReducer = require('../modules/admin').passwordReducer;
                    injectReducer(store, { key:'adminPassword', reducer:passwordReducer })
                    
                    const tempdataReducer = require('../../../store/lib/tempdata').default;
                    injectReducer(store, { key:'tempdata', reducer:tempdataReducer })

                    cb(null, { header: HeaderLock, info: LockInfo, main: LockSetPassword })
                    //cb(null, LockInfo)
                }, 'admin')
            }
        },
        {
            path: 'user',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const UserList = require('./containers/UserListContainer').default
                    const userReducer = require('../modules/user').default
                    const deviceReducer = require('../modules/device').default;
                    
                    injectReducer(store, { key:'user', reducer:userReducer })
                    injectReducer(store, { key:'device', reducer:deviceReducer })
                    
                    cb(null, UserList)
                }, 'admin')
            }
        },
        {
            path: 'user/:id',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const UserDetail = require('./containers/UserDetailContainer').default
                    const userReducer = require('../modules/user').default
                    const lockReducer = require('../modules/lock').default;
                    
                    injectReducer(store, { key:'user', reducer:userReducer })
                    injectReducer(store, { key:'lock', reducer:lockReducer })
                    
                    cb(null, UserDetail)
                }, 'admin')
            }
        },
        {
            path: 'user/:userId/lock/:lockId',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const UserDetail = require('./containers/LockEditContainer').default
                    const userReducer = require('../modules/user').default
                    const lockReducer = require('../modules/lock').default;
                    const tempdataReducer = require('../../../store/lib/tempdata').default;
                    
                    injectReducer(store, { key:'user', reducer:userReducer })
                    injectReducer(store, { key:'lock', reducer:lockReducer })
                    injectReducer(store, { key:'tempdata', reducer:tempdataReducer })
                    
                    cb(null, UserDetail)
                }, 'admin')
            }
        }
    ]
})
