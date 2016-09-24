import { connect } from 'react-redux'
import { fetchZen, saveCurrentZen } from '../modules/zen'
import { handleLogin } from '../modules/auth'
import LoginForm from '../components/Login'

const mapDispatchToProps = {
    fetchZen,
    saveCurrentZen,
    handleLogin
}

const mapStateToProps = (state) => ({
    zen: state.zen.zens.find(zen => zen.id === state.zen.current),
    saved: state.zen.zens.filter(zen => state.zen.saved.indexOf(zen.id) !== -1),
    sign: state.sign,
    auth: state.auth
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
