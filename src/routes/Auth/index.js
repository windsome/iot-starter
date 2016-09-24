import { injectReducer } from '../../store/reducers';

export default (store) => ({
    path: 'auth',
    component: require('../../layouts/EmptyLayout/EmptyLayout').default,
    indexRoute: {
        onEnter: function (nextState, replace) {
            replace('/auth/login')
        }
    },
    childRoutes: [
        {
            path: 'login',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const Login = require('./containers/LoginContainer').default
                    const zenReducer = require('./modules/zen').default;
                    const authReducer = require('./modules/auth').default;
                    
                    injectReducer(store, { key:'zen', reducer:zenReducer })
                    injectReducer(store, { key:'auth', reducer:authReducer })
                    cb(null, Login)
                })
            }
        }
    ]
})
