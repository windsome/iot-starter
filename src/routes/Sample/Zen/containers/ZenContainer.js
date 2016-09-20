import { connect } from 'react-redux'
import { fetchZen, saveCurrentZen } from '../modules/zen'

import { Zen } from '../components/Zen'

const mapDispatchToProps = {
    fetchZen,
    saveCurrentZen
}

const mapStateToProps = (state) => ({
    zen: state.zen.zens.find(zen => zen.id === state.zen.current),
    saved: state.zen.zens.filter(zen => state.zen.saved.indexOf(zen.id) !== -1),
    signpkg: state.sign.pkg
})

export default connect(mapStateToProps, mapDispatchToProps)(Zen)
