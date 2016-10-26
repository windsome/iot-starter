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
        getComponent(nextState, cb) {
            require.ensure([], (require) => {
                const Lock = require('./containers/LockContainer').default
                const simulatorReducer = require('../modules/simulator').default;
                
                injectReducer(store, { key:'simulator', reducer:simulatorReducer })
                
                cb(null, Lock)
            })
        }
    }
})
