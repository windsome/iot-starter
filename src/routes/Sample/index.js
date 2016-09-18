/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */
/*
// We only need to import the modules necessary for initial render
import CoreLayout from '../layouts/CoreLayout/CoreLayout'
import Home from './Home'
import CounterRoute from './Counter'
import ZenRoute from './Zen'
import IotRoute from './Iot'

export const createRoutes = (store) => ({
  path: '/',
  component: CoreLayout,
  indexRoute: Home, 
  childRoutes: [
    CounterRoute(store),
    ZenRoute(store),
    IotRoute(store)
  ]
})
*/

import Home from './Home'
import CounterRoute from './Counter'
import ZenRoute from './Zen'

export const createRoutes = (store) => ({
  path: 'sample',
    getComponent(nextState, cb) {
        require.ensure([
            '../../layouts/CoreLayout/CoreLayout'
        ], (require) => {
            const CoreLayout = require('../../layouts/CoreLayout/CoreLayout').default
            cb(null, CoreLayout)
        }, 'sample')
    },
    onChange: function (prevState, nextState, replace) {
        console.log ("location:");
        console.log (location.href);
        console.log ("route change:");
        console.log (nextState);
    },
  indexRoute: Home(store), 
  childRoutes: [
    CounterRoute(store),
    ZenRoute(store)
  ]
})
/*
export const createRoutes = (store) => ({
    path: '/',
    getComponent(nextState, cb) {
        require.ensure([
            '../layouts/CoreLayout/CoreLayout'
        ], (require) => {
            const CoreLayout = require('../layouts/CoreLayout/CoreLayout').default
            cb(null, CoreLayout)
        }, 'index')
    },
    getIndexRoute(partialNextState, cb) {
        // do something async here
        //cb(null, myIndexRoute)
        require.ensure([
            './Home'
        ], (require) => {
            const Home = require('./Home').default
            cb(null, Home)
        })
    },
    getChildRoutes (location, cb) {
      require.ensure([
          './Counter',
          './Zen',
          './Iot'
      ], (require) => {
          cb(null, [
              // Remove imports!
              require('./Counter').default(store),
              require('./Zen').default(store),
              require('./Iot').default(store)
          ])
      })
    }
})
*/
/*  Note: childRoutes can be chunked or otherwise loaded programmatically
    using getChildRoutes with the following signature:

    getChildRoutes (location, cb) {
      require.ensure([], (require) => {
        cb(null, [
          // Remove imports!
          require('./Counter').default(store)
        ])
      })
    }

    However, this is not necessary for code-splitting! It simply provides
    an API for async route definitions. Your code splitting should occur
    inside the route `getComponent` function, since it is only invoked
    when the route exists and matches.
*/

export default createRoutes
