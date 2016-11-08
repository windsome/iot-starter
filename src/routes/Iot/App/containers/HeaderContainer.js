import { connect } from 'react-redux'
import { adminFetchLocks } from '../../modules/admin'

import Header from '../components/Header'

const mapDispatchToProps = {
    adminFetchLocks
}

const mapStateToProps = (state) => ({
    dbLocks: (state.database && state.database.locks) || {},
    current: (state.admin && state.admin.current) || []
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)
