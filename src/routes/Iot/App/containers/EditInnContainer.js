import { connect } from 'react-redux'
import { tempdataSet } from '../../../../store/lib/tempdata'

import Component from '../components/EditInn'

const mapDispatchToProps = {
    tempdataSet
}

const mapStateToProps = (state) => ({
    initialValues: state.tempdata && state.tempdata.data
})

export default connect(mapStateToProps, mapDispatchToProps)(Component)
