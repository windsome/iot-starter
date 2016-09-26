/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */

// We only need to import the modules necessary for initial render
import EmptyLayout from '../layouts/EmptyLayout/EmptyLayout'
import SampleRoute from './Sample'
import IotRoute from './Iot'
import AuthRoute from './Auth'
import { fetchUser } from '../store/lib/oauth2'

export const createRoutes = (store) => ({
  path: '/',
  component: EmptyLayout,
  onEnter: function () {
      //injectReducer(store, { key:'sign', reducer:signReducer })
      console.log ("windsome routes/",location.search, " query2: ", location.search.substring(1).split('&'));
      var qsObj = {};
      var qs = location.search.substring(1);
      var qsArr = qs && qs.split('&');
      for (var i = 0; i < qsArr.length; i++) {
          var arr2 = qsArr[i].split('=');
          var name = arr2[0];
          qsObj[name] = arr2[1];
      }
      if (qsObj.code && qsObj.state) {
          // has code & state.
          console.log ("qsObj", qsObj);
          store.dispatch(fetchUser(qsObj));
      }
  },
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
