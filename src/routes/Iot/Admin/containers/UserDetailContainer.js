import { connect } from 'react-redux'
import { fetchLocks } from '../../modules/lock'

import { UserDetail } from '../components/UserDetail'

const mapDispatchToProps = {
    fetchLocks
}

const mapStateToProps = (state) => ({
    dbLocks: state.database.locks,
    user: state.user,
    lock: state.lock
})

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail)
