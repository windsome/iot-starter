import { connect } from 'react-redux'
import { fetchZen, saveCurrentZen } from '../modules/zen'

import { Zen } from '../components/Zen'
//import { ZenObject } from '../interfaces/zen'

const mapDispatchToProps = {
    fetchZen,
    saveCurrentZen
}

const mapStateToProps = (state) => ({
    zen: state.iot.zens.find(zen => zen.id === state.iot.current),
    saved: state.iot.zens.filter(zen => state.iot.saved.indexOf(zen.id) !== -1)
})

export default connect(mapStateToProps, mapDispatchToProps)(Zen)
