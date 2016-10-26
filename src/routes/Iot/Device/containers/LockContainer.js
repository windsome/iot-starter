import { connect } from 'react-redux'
import { init, deinit, emit2Server, startHeartBeat, stopHeartBeat } from '../../modules/simulator'

import { Lock } from '../components/Lock'

const mapDispatchToProps = {
    init,
    deinit,
    emit2Server,
    startHeartBeat,
    stopHeartBeat
}

const mapStateToProps = (state) => ({
    simulator: state.simulator
})

export default connect(mapStateToProps, mapDispatchToProps)(Lock)
