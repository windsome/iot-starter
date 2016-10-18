import { connect } from 'react-redux'
import { fetchZen, saveCurrentZen } from '../../modules/zen'
import { fetchDevices } from '../../modules/device'

import { DeviceList } from '../components/List'

const mapDispatchToProps = {
    fetchZen,
    saveCurrentZen,
    fetchDevices
}

const mapStateToProps = (state) => ({
    zen: state.zen.zens.find(zen => zen.id === state.zen.current),
    saved: state.zen.zens.filter(zen => state.zen.saved.indexOf(zen.id) !== -1),
    signpkg: state.sign.pkg,
    wxjs: state.sign.wxjs,
    wxerror: state.sign.wxerror,
    devices: state.device.devices
})

export default connect(mapStateToProps, mapDispatchToProps)(DeviceList)
