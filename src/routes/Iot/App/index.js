import { injectReducer } from '../../../store/reducers';
//import '../../../styles/weui.css';
import Header from './containers/HeaderContainer';

export default (store) => ({
    path: 'app',
    component: require('./components/Layout').default,
    indexRoute: {
        getComponent(nextState, cb) {
            require.ensure([], (require) => {
                const Search = require('./containers/SearchContainer').default
                //const adminLocksReducer = require('../modules/admin').default
                //injectReducer(store, { key:'admin', reducer:adminLocksReducer })
                cb(null, Search)
            })
        }
    },
    childRoutes: [
        {
            path: 'search',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const Search = require('./containers/SearchContainer').default
                    cb(null, Search)
                })
            }
        },
        {
            path: 'inn',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const Component = require('./containers/ListInnContainer').default
                    cb(null, Component)
                })
            }
        },
        {
            path: 'inn/create',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const tempdataReducer = require('../../../store/lib/tempdata').default;
                    injectReducer(store, { key:'tempdata', reducer:tempdataReducer })

                    const Component = require('./containers/EditInnContainer').default
                    cb(null, Component)
                })
            }
        },
        {
            path: 'inn/:id',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    const Component = require('./containers/DetailInnContainer').default
                    const uploaderReducer = require('../../../store/lib/uploader').default
                    injectReducer(store, { key:'uploader', reducer:uploaderReducer })
                    cb(null, Component)
                })
            }
        }
    ]
})
