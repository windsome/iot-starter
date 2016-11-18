import React, { Component, PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
//import classes from './common.scss'
import styles from './common.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

import ImageGallery, { PriceContainer } from 'components/widgets/ImageGallery'
import ImageUploader from 'components/widgets/ImageUploader'
import FiveStar from 'components/widgets/FiveStar'

const CoverImage = (props) => {
    var bk= 'url('+props.img+')';
    return (
<div className={cx('cover-img')} style={{backgroundImage:bk}}>
    <div className={cx('panel-overlay-label','panel-overlay-listing-label','panel-overlay-bottom-left')}>
        <PriceContainer price={450} />
    </div>
    <div className={cx('hero__view-photos','panel-overlay-bottom-right')}>
        <button type="button" className="btn">
            <span>查看照片</span>
        </button>
    </div>
</div>
    )
}

const Summary = (props) => (
<div className={cx('summary-component')}>
    <div className="col-sm-10 col-md-9">
        <span >
            <div className={cx("text_size_title2_weight_bold")}>
                <span>Jamies Gangnam luxury home2 sale!</span>
            </div>        
        </span>
        <div>
            <div className={cx('show-inline-block')}><a>
                <span className={cx("text_size_small_weight_light_inline")}><span>Seoul , 首尔, 韩国</span></span>
            </a></div>
            <div className={cx('show-inline-block')}>
                <div><a>
                    <div className={cx('star-rating')}><FiveStar star={3.4} /></div>
                    <span/>
                    <span className='h6'><span>13条评价</span></span>
                </a></div>
            </div>
        </div>
    </div>
    <div className="col-sm-2 hide-md hide-lg">
        <div className={cx("host-profile-position-sm")}>
            <div className="media-photo-badge">
                <a href="#host-profile" rel="nofollow" className={cx("media-photo", "media-round")}>
                    <img alt="用户个人头像" data-pin-nopin="true" src="https://z2.muscache.com/im/pictures/2d86d90e-a995-4a40-bd38-654d44fb95ea.jpg?aki_policy=profile_x_medium" title="Jamie" width="48" height="48"/>
                </a>
                <img src="https://z0.muscache.com/airbnb/static/badges/superhost_photo_badge-a38e6a7d2afe0e01146ce910da3915f5.png" className={cx("superhost-photo-badge")} alt=""/>
            </div>
        </div>
    </div>
</div>
)

const Facility = (props) => {
    var facilityClass = "col-sm-3 hide-md hide-lg "+cx('facility');
return (
<div className={"col-sm-12 "+ cx('facility')}>
    <hr className="col-sm-12"/>
    <div className="col-sm-12">
        <div className={facilityClass}><i className="glyphicon glyphicon-home icon-size-2" aria-hidden="true"></i><br/><span>整套房子/公寓</span></div>
        <div className={facilityClass}><i className="glyphicon glyphicon-inbox icon-size-2" aria-hidden="true"></i><br/><span>2位房客</span></div>
        <div className={facilityClass}><i className="glyphicon glyphicon-book icon-size-2" aria-hidden="true"></i><br/><span>1间卧室</span></div>
        <div className={facilityClass}><i className="glyphicon glyphicon-hdd icon-size-2" aria-hidden="true"></i><br/><span>1张床</span></div>
    </div>
    <hr className="col-sm-12"/>
</div>
)
}

const Feedback = (props) => (
<div className='row'>
  <div className='col-sm-12'>
<div class="pull-left">
  <div class="show-inline-block">
    <div class="show-inline-block va-middle space-top-2 space-2">
      <div class="media-photo-badge">
        <a href="/users/show/25743833" rel="nofollow" class="media-photo media-round">
          <img alt="用户个人头像" data-pin-nopin="true" src="https://z2.muscache.com/im/pictures/ccea9b64-1b24-4f57-9721-41fb9ef24510.jpg?aki_policy=profile_x_medium" title="Hannah" width="48" height="48"/>
        </a>
      </div>
    </div>
    <div class="show-inline-block va-middle space-2">
      <div style="margin-left:16px;">
        <div class="name">
          <a href="/users/show/25743833" class="text-muted link-reset" target="_blank">
            <p class="text_1lobov3-o_O-size_regular_1n7tijc"><span>Hannah</span></p>
          </a>
        </div>
        <div class="date"><p class="text_1lobov3-o_O-size_small_h25x8d-o_O-weight_light_1s4oduu"><span>2016年10月</span></p></div>
      </div>
    </div>
  </div>
</div>
  </div>
  <div className='col-sm-12'>
  </div>
</div>
)

class DetailInn extends Component {
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
<div className={cx("register")}>
<div id={cx('photos')}>
    <CoverImage img="https://z2.muscache.com/im/pictures/93826918/5c633c07_original.jpg?aki_policy=x_medium"/>
</div>
<div className={cx('page-container')}>

<div className='row'><Summary/></div>
<div className='row'><Facility/></div>
<div className='row'><div>
  <h4 className={cx("space-4")}>
    <span className={cx("title")}><span>关于此房源</span></span>
  </h4>
  <div>
    <p className={cx("text_size_regular_weight_light")}>
      <span>{`Fall winter discounted 30%: outstanding location in Gangnam station.,1 min Sinnonhyeon station -easy access everywhere. brand-new luxury building in a rich and trendy neighborhood that never sleeps 24/7. Condition equal to 4 star hotel nearby with amazing cityview! Full-furnished, free WiFi, portable wifi egg, cooking &amp; laundry. 24 hr check-in available. Perfect for vacation or Business trip! As seen on review, 100% Satisfacted by all guest! Live like a local, not a tourist!`}</span>
    </p>
  </div>
  <hr/>
  <div style={{marginBottom:'24px'}}>
    <p className={cx("text_size_regular")}><span>房源</span></p>
  </div>
  <div className='col-md-6'>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>可住： 2</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>卫生间： 1</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>卧室： 1</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>床位： 2</span></p></div>
  </div>
  <div className='col-md-6'>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>入住时间： 15:00后</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>退房时间： 11:00</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>房源类型： 公寓</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>房间类型： 整套房子/公寓</span></p></div>
  </div>
  <hr/>
  <div style={{marginBottom:'24px'}}>
    <p className={cx("text_size_regular")}><span>价格</span></p>
  </div>
  <div className='col-md-6'>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>额外房客： ￥121 / 晚 每超出一人计</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>清洁费： ￥213</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>每月折扣： 10%</span></p></div>
  </div>
  <div className='col-md-6'>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>退订政策： 中等</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>周末价格： ￥518 / 晚</span></p></div>
  </div>
  <hr/>
  <div style={{marginBottom:'24px'}}>
    <p className={cx("text_size_regular")}><span>《房屋守则》</span></p>
  </div>
  <div className='col-md-6'>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>禁止吸烟</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>不适合宠物</span></p></div>
    <div style={{marginBottom:'16px'}}><p className={cx("text_size_regular")}><span>不允许举办聚会和活动</span></p></div>
  </div>
  <hr/>
  <div style={{marginBottom:'24px'}}>
    <p className={cx("text_size_regular")}><span>房间日历</span></p>
  </div>
</div></div>

<div className='row'><div>
  <h4 className={cx("space-4")}>
    <span className={cx("title")}><span>13条评价</span></span>
    <FiveStar star={3.4} />
  </h4>
  <hr/>
  <div className='col-sm-12 col-md-6'>
    <div className='row' style={{marginBottom:'16px'}}>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><p className={cx("text_size_regular")}><span>准确性</span></p></div>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><FiveStar star={2.3}/></div>
    </div>
    <div className='row' style={{marginBottom:'16px'}}>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><p className={cx("text_size_regular")}><span>沟通交流</span></p></div>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><FiveStar star={2.3}/></div>
    </div>
    <div className='row' style={{marginBottom:'16px'}}>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><p className={cx("text_size_regular")}><span>清洁度</span></p></div>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><FiveStar star={2.3}/></div>
    </div>
  </div>
  <div className='col-sm-12 col-md-6'>
    <div className='row' style={{marginBottom:'16px'}}>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><p className={cx("text_size_regular")}><span>准确性</span></p></div>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><FiveStar star={2.3}/></div>
    </div>
    <div className='row' style={{marginBottom:'16px'}}>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><p className={cx("text_size_regular")}><span>沟通交流</span></p></div>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><FiveStar star={2.3}/></div>
    </div>
    <div className='row' style={{marginBottom:'16px'}}>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><p className={cx("text_size_regular")}><span>清洁度</span></p></div>
      <div className='col-xs-6 col-sm-6' style={{float:'left'}}><FiveStar star={2.3}/></div>
    </div>
  </div>
</div></div>

<div className='row'><div>
  <hr/>
</div></div>

<div className='row'>
  <div className="col-xs-12 col-sm-12">
    <ImageUploader addImage={this.props.addImage} removeImage={this.props.removeImage} info={this.props.info} data={this.props.data}/>
  </div>
</div>

</div>

</div>
        );
    }
}

DetailInn.propTypes = {
    tempdataSet: React.PropTypes.func.isRequired
}

export default reduxForm({
    form: 'ListInn_house',  // a unique identifier for this form
    enableReinitialize: true
})(DetailInn)
