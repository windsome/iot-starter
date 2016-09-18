/*import HomeView from './components/HomeView'

// Sync route definition
export default {
  component: HomeView
}*/


export default (store) => ({
    getComponent(nextState, cb) {
        require.ensure([
            './components/HomeView'
        ], (require) => {
            const HomeView = require('./components/HomeView').default
            cb(null, HomeView)
        }, 'home')
    }
})
