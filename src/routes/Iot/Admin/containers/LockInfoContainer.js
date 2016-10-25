import { connect } from 'react-redux'
import { fetchLockIfNeeded } from '../../modules/admin'

import { LockInfo } from '../components/LockInfo'

const mapDispatchToProps = {
    fetchLockIfNeeded
}

const mapStateToProps = (state) => ({
    dbLocks: (state.database && state.database.locks) || {},
    current: (state.adminlock && state.adminlock.current) || ''
})

export default connect(mapStateToProps, mapDispatchToProps)(LockInfo)
