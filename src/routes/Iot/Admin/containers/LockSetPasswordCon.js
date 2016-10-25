import { connect } from 'react-redux'
import { tempdataSet } from '../../../../store/lib/tempdata'

import { tryAdminSetPassword } from '../../modules/admin'
import LockSetPassword from '../components/LockSetPassword'

const mapDispatchToProps = {
    tempdataSet,
    tryAdminSetPassword
}

const mapStateToProps = (state) => ({
    initialValues: state.tempdata.data
})

export default connect(mapStateToProps, mapDispatchToProps)(LockSetPassword)
