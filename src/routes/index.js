/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */

// We only need to import the modules necessary for initial render
import EmptyLayout from '../layouts/EmptyLayout/EmptyLayout'
import SampleRoute from './Sample'
import IotRoute from './Iot'
import AuthRoute from './Auth'

export const createRoutes = (store) => ({
  path: '/',
  component: EmptyLayout,
  indexRoute: {
      onEnter: function (nextState, replace) {
          replace('sample/')
      }
  },
  childRoutes: [
    SampleRoute(store),
    IotRoute(store),
    AuthRoute(store)
  ]
})
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
