import { connect } from 'react-redux'
import { fetchUsers } from '../../modules/user'

import { UserList } from '../components/UserList'

const mapDispatchToProps = {
    fetchUsers
}

const mapStateToProps = (state) => ({
    dbUsers: state.database.users,
    user: state.user,
    devices: state.device.devices
})

export default connect(mapStateToProps, mapDispatchToProps)(UserList)
