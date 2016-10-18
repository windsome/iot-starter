import { injectReducer } from '../../../store/reducers';

export default (store) => ({
    path: 'device',
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
            replace('/iot/device/list')
        }
    },
    childRoutes: [
        {
            path: 'list',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const DeviceList = require('./containers/ListContainer').default
                    const zenReducer = require('../modules/zen').default
                    const deviceReducer = require('../modules/device').default;
                    
                    injectReducer(store, { key:'zen', reducer:zenReducer })
                    injectReducer(store, { key:'device', reducer:deviceReducer })
                    
                    cb(null, DeviceList)
                }, 'devicelist')
            }
        }
    ]
})
