import { connect } from 'react-redux'
import { fetchLocks } from '../../modules/lock'
import { tempdataSet } from '../../../../store/lib/tempdata'

import EditLockForm from '../../components/EditLock'

const mapDispatchToProps = {
    fetchLocks,
    tempdataSet
}

const mapStateToProps = (state) => ({
    dbLocks: state.database.locks,
    user: state.user,
    lock: state.lock,
    initialValues: state.tempdata.data
})

export default connect(mapStateToProps, mapDispatchToProps)(EditLockForm)
