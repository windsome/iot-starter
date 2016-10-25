import { connect } from 'react-redux'
import { adminFetchLocks } from '../../modules/admin'

import { LockList } from '../components/LockList'

const mapDispatchToProps = {
    adminFetchLocks
}

const mapStateToProps = (state) => ({
    dbLocks: state.database.locks || {},
    current: state.admin.current || []
})

export default connect(mapStateToProps, mapDispatchToProps)(LockList)
