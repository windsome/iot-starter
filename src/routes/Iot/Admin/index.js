import { injectReducer } from '../../../store/reducers';

export default (store) => ({
    path: 'admin',
    component: require('../../../layouts/EmptyLayout/EmptyLayout').default,
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
            replace('/iot/admin/user')
        }
    },
    childRoutes: [
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
