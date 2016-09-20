import DeviceRoute from './Device'
import { injectReducer } from '../../store/reducers';
import signReducer, { fetchSign } from '../../store/lib/signPackage';

export default (store) => ({
  path: 'iot',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const IotLayout = require('./components/IotLayout').default
            cb(null, IotLayout)
        }, 'iot')
    },
    onEnter: function () {
        injectReducer(store, { key:'sign', reducer:signReducer })
        store.dispatch(fetchSign (location.href));
    },
    onChange: function (prevState, nextState, replace) {
        store.dispatch(fetchSign (location.href));
    },
  indexRoute: {
      onEnter: function (nextState, replace) {
          replace('/iot/device')
      }
  },
  childRoutes: [
    DeviceRoute(store)
  ]
})
