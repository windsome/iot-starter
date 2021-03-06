import { connect } from 'react-redux'
import { tempdataSet } from '../../../../store/lib/tempdata'
import { addImage, removeImage } from '../../../../store/lib/uploader'

import Component from '../components/DetailInn'

const mapDispatchToProps = {
    addImage,
    removeImage,
    tempdataSet
}

const mapStateToProps = (state) => ({
    data: state.uploader && state.uploader.data,
    info: state.uploader && state.uploader.info,
    dbLocks: (state.database && state.database.locks) || {},
    current: (state.admin && state.admin.current) || []
})

export default connect(mapStateToProps, mapDispatchToProps)(Component)
