import { connect } from 'react-redux'
import { fetchZen, saveCurrentZen } from '../modules/zen'
import { handleLogin } from '../modules/auth'
import { handleOauth2 } from '../../../store/lib/oauth2'
import LoginForm from '../components/Login'

const mapDispatchToProps = {
    fetchZen,
    saveCurrentZen,
    handleLogin,
    handleOauth2
}

const mapStateToProps = (state) => ({
    zen: state.zen.zens.find(zen => zen.id === state.zen.current),
    saved: state.zen.zens.filter(zen => state.zen.saved.indexOf(zen.id) !== -1),
    sign: state.sign,
    auth: state.auth,
    oauth2: state.oauth2
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
