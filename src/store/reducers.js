import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import { reducer as reduxFormReducer } from 'redux-form'
import oauth2Reducer from './lib/oauth2'

export const makeRootReducer = (asyncReducers) => {
    //console.log ("windsome makeRootReducer", oauth2Reducer);
  return combineReducers({
    // Add sync reducers here
    router,
    oauth2: oauth2Reducer,
    form: reduxFormReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
