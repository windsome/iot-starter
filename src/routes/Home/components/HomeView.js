import React from 'react'
import Slider from 'react-slick'
import DuckImage from '../assets/Duck.jpg'
import classes from './HomeView.scss'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import classNames from 'classnames';

export const HomeView = () => (
  <div>
    <h4>Welcome!</h4>
  <div className='container'>
    <Slider dots={true} infinite={true} autoplay={false} autoplaySpeed={300} pauseOnHover={true} speed={500} slidesToShow={2} slidesToScroll={1}>
      <img src='http://tupian.enterdesk.com/2015/gha/0304/35/9.jpg'   width='100%'/>
      <div>
        <div><h6>Product1</h6></div>
        <div>description: this is a new pic.</div>
        <img src='http://pic3.bbzhi.com/mingxingbizhi/fanbingbinggaoqingbizhi/star_starcn_165256_4.jpg' width="100%"/>
      </div>
      <img src='http://img.tuku.com/upload/attach/2013/07/97561-3l9Yc5A.jpg'   width="100%"/>
      <img src='http://a3.att.hudong.com/44/96/01300542445633139624963191710.jpg'  width="100%"/>
      <img src='http://a1.att.hudong.com/47/72/01300000251452123245721883782.jpg'  width="100%"/>
    </Slider>
  </div>

    <div className={classNames('container', classes.company)}>
      <div className={classes.img}><img src='http://a1.att.hudong.com/47/72/01300000251452123245721883782.jpg'  width="100%"/></div>
      <div className={classes.text}>
        <h2>company description</h2>
        <div className={classes.info}>this is company description, we are a good company, founded in 2011, focus on DigitalSignage and IOT.</div>
      </div>
    </div>
    <img
      alt='This is a duck, because Redux!'
      className={classes.duck}
      src={DuckImage} />
  </div>

)

export default HomeView
