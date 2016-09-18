import { injectReducer } from '../../store/reducers';

export default (store) => ({
    path: 'iot',
    getComponent(nextState, cb) {
        require.ensure([
            './containers/ZenContainer',
            './modules/zen'
        ], (require) => {
            const Zen = require('./containers/ZenContainer').default
            const zenReducer = require('./modules/zen').default
            
            injectReducer(store, { key:'iot', reducer:zenReducer })
            
            cb(null, Zen)
        }, 'iot')
    }
})
