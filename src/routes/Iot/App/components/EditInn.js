import React, { Component, PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
//import classes from './common.scss'
import styles from './EditInn.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);
import { HOUSE_TYPES } from '../../modules/commonData';

const InnStyle = (props) => {
    return (
<div className={cx('main-panel', 'main-panel-padding', 'main-panel-inner-half')}>
    <div className={cx('panel--no-border','panel-title')}>
        <h3 className={cx("no-margin-padding")}>您打算发布什么类型的房源？</h3>
    </div>
    <div>
        <div className={cx('space-4')}>
            <div>
	              <label htmlFor="houseType" className="h4 text-gray text-normal"><span>这是什么类型的房源？</span></label>
	              <div className="select select-block select-jumbo">
                    <Field name="houseType" component="select">
                    <option></option>
            { HOUSE_TYPES.map ( (item) => {
                var key = item.id;
                var value = item.value;
                console.log (key, value);
                if (value === 'disabled') 
                    return (<option key={key} value={key} disabled>──────────────</option>);
                else {
                    return (<option key={key} value={key}>{value}</option>);
                }
              })
            }
                   </Field>
	              </div>
            </div>
        </div>
        <div className={cx("space-top-4", "space-4")}>
	          <div>
    		        <label htmlFor="roomType" className="h4 text-gray text-normal"><span>房客会住在什么类型的空间？</span></label>
		            <div className="select select-block select-jumbo">
                    <Field name="roomType" component="select">
				                <option value="entire_home">整套房源</option>
				                <option value="private_room">独立房间</option>
				                <option value="shared_room">合住房间</option>
                   </Field>
		            </div>
	          </div>
        </div>
    </div>
</div>
    )
}

const BedRoom = (props) => {
    return (
<div className="main-panel main-panel-padding main-panel-progress pull-right main-panel-inner-half space-sm-8">
	<div className="panel--no-border panel-title">
		<h3 className="no-margin-padding">您的房源可以容纳多少个房客？</h3>
	</div>
	<div>
		<div>
			<div className="increment-btn no-padding">
				<div className="increment-btn btn-group no-padding no-border-bottom-radius">
					<div className="text-gray btn increment-jumbo increment-btn__label increment-btn__label--with-increment-btns" tabIndex="0" role="textbox">
						<div className="increment-btn__border-container-label text-truncated">
							<span className="text-muted"><span>1张床</span></span>
              <Field name="bedCount" component="input" type="hidden"/>
						</div>
					</div>
					<button type="button" className="btn btn-jumbo increment-btn__decrementer" disabled="" aria-label="minus 1">
					  <div className="increment-btn__border-container-decrementer"/>
					</button>
          <button type="button" className="btn btn-jumbo increment-btn__incrementer" aria-label="plus 1"></button>
				</div>
			</div>
		</div>
	</div>
	<div className="row no-margin-h space-top-6">
		<label htmlFor="accommodates-select" className="text-gray"><span>能住多少位房客？</span></label>
		<div>
			<div className="increment-btn no-padding">
				<div className="increment-btn btn-group no-padding">
					<div className="text-gray btn increment-jumbo increment-btn__label increment-btn__label--with-increment-btns" tabIndex="0" role="textbox">
						<div className="increment-btn__border-container-label text-truncated">
							<span className="text-muted"><span>2位房客</span></span>
              <Field name="peopleCount" component="input" type="hidden"/>
						</div>
					</div>
					<button type="button" className="btn btn-jumbo increment-btn__decrementer" aria-label="minus 1">
					  <div className="increment-btn__border-container-decrementer"/>
					</button>
          <button type="button" className="btn btn-jumbo increment-btn__incrementer" aria-label="plus 1"></button>
				</div>
			</div>
		</div>
	</div>
</div>
    )
}

class EditInn extends Component {
    componentWillMount () {
        const { tempdataSet } = this.props;
        tempdataSet ({ houseType: 44, roomType:"shared_room", bedCount: 1, peopleCount: 2 });
    }
    componentDidMount () {
        console.log ("componentDidMount");
    }

    render () {
        const { pristine, reset, submitting, tempdataSet, initialValues } = this.props;
        return (
<div>
    <form id="editInn">
        <InnStyle />
        <BedRoom />
        <div className="weui_btn_area">
            <button type="submit" className="weui-btn weui-btn_primary js_btn" disabled={pristine || submitting}>发布</button>
        </div>
    </form>
</div>
        );
    }
}

EditInn.propTypes = {
    tempdataSet: React.PropTypes.func.isRequired
}

export default reduxForm({
    form: 'editInn',  // a unique identifier for this form
    enableReinitialize: true
})(EditInn)
