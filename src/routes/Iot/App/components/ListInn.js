import React, { Component, PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import classes from './common.scss'
import ImageGallery from 'components/widgets/ImageGallery'

class ListInn extends Component {
    componentWillMount () {
        const { tempdataSet } = this.props;
        tempdataSet ({ address: '黄山', start: '2016-11-01 16:00', end: '2016-11-01 16:00' });
    }
    componentDidMount () {
        console.log ("componentDidMount");
    }

    render () {
        const { pristine, reset, submitting, tempdataSet, initialValues } = this.props;
        return (
<div className="register">
<div>
    <ImageGallery imgUrl="https://z2.muscache.com/im/pictures/93826918/5c633c07_original.jpg?aki_policy=x_medium" imgDesc="东京的照片" link="https://z2.muscache.com/im/pictures/93826918/5c633c07_original.jpg?aki_policy=x_medium"/>
    <ImageGallery imgUrl="https://z2.muscache.com/im/pictures/93826918/5c633c07_original.jpg?aki_policy=x_medium" imgDesc="东京的照片" link="https://z2.muscache.com/im/pictures/93826918/5c633c07_original.jpg?aki_policy=x_medium"/>
    <ImageGallery imgUrl="https://z2.muscache.com/im/pictures/93826918/5c633c07_original.jpg?aki_policy=x_medium" imgDesc="东京的照片" link="https://z2.muscache.com/im/pictures/93826918/5c633c07_original.jpg?aki_policy=x_medium"/>
</div>
<form id="registerForm">
    <div className="weui-cells__title">用户注册</div>
    <div className="weui-cells weui-cells_form">
        <div className="weui-cell">
            <div className="weui-cell__hd">
                <label htmlFor="address" className="weui-label">目的地点</label>
            </div>
            <div className="weui-cell__bd weui-cell_primary">
                <Field name="address" className="weui-input" component="input" type="text" placeholder="上海/北京/歙县"/>
            </div>
            <div className="weui-cell__ft">
                <i className="weui-icon-warn"></i>
            </div>
        </div>
        <div className="weui-cell">
            <div className="weui-cell__hd">
                <label htmlFor="start" className="weui-label">开始时间</label>
            </div>
            <div className="weui-cell__bd weui-cell_primary">
                <Field name="start" className="weui-input" component="input" type="text" placeholder="开始时间 2016-11-01 14:00"/>
            </div>
            <div className="weui-cell__ft">
                <i className="weui_icon_warn"></i>
            </div>
        </div>
        <div className="weui-cell">
            <div className="weui-cell__hd">
                <label htmlFor="end" className="weui-label">结束时间</label>
            </div>
            <div className="weui-cell__bd weui-cell_primary">
                <Field name="end" className="weui-input" component="input" type="text" placeholder="结束时间 2016-11-02 12:00"/>
            </div>
            <div className="weui-cell__ft">
                <i className="weui-icon-warn"></i>
            </div>
        </div>
    </div>
    <p className="weui-cells__tips">在微信里面其实可以调网页授权的</p>

    <div className="weui_btn_area">
        <button type="submit" className="weui-btn weui-btn_primary js_btn" disabled={pristine || submitting}>搜索</button>
    </div>
</form>
</div>
        );
    }
}

ListInn.propTypes = {
    tempdataSet: React.PropTypes.func.isRequired
}

export default reduxForm({
    form: 'ListInn_house',  // a unique identifier for this form
    enableReinitialize: true
})(ListInn)
