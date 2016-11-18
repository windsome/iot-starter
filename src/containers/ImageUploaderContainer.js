import { connect } from 'react-redux'
import { addImage, removeImage } from '../../../../store/lib/uploader'

import Component from '../components/widgets/ImageUploader'

const mapDispatchToProps = {
    addImage,
    removeImage,
}

const mapStateToProps = (state) => ({
    data: state.uploader && state.uploader.data,
    info: state.uploader && state.uploader.info,
})

export default connect(mapStateToProps, mapDispatchToProps)(Component)
