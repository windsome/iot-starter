import React from 'react'
import { IndexLink, Link } from 'react-router'
import classes from './HeaderAirbnb.scss'
import classNames from 'classnames';

const Logo = () => (
  <div>
    <span className={classNames(classes.icon, "glyphicon", "glyphicon-home")} aria-hidden="true"></span>
    {/* 'Home' */}
  </div>
)

const Tour = () => (
  <div>
    { 'Tour' }
    <span className={classNames(classes.icon, "glyphicon", "glyphicon-sound-stereo")} aria-hidden="true"></span>
  </div>
)

const Message = () => (
  <div>
    { 'Msg' }
    {/*<span className="glyphicon glyphicon-envelope" aria-hidden="true"></span>*/}
    <i className={classNames(classes.icon, "glyphicon", "glyphicon-envelope")}>
      <i className={classNames(classes.numberBadge, "badge")}>1</i>
    </i>
  </div>
)

const Help = () => (
  <div>
    <span>Help</span>
    <span className={classNames(classes.icon, "glyphicon", "glyphicon-question-sign")} aria-hidden="true"></span>
  </div>
)

const User = (props) => (
  <div>
    <span>{props.userName || 'Login'}</span>
    <span className={classNames(classes.icon, "glyphicon")}><img src={props.avatar || '/favicon.ico'} alt="..." className={classNames(classes.avatar, "img-circle")} /></span>
  </div>
)

export const Header = (props) => (
  <div className={classes.airbnbHeader}>
    <div className={classNames(classes.comp, "pull-left")}>
    <IndexLink to='/' activeClassName={classes.activeRoute}>
      <Logo />
    </IndexLink>
    </div>

    <div className={classNames(classes.comp, "pull-right")}>
    <Link to='/sample/zen' activeClassName={classes.activeRoute}>
      <User />
    </Link>
    </div>

    <div className={classNames(classes.comp, "pull-right")}>
    <Link to='/sample/counter' activeClassName={classes.activeRoute}>
      <Help />
    </Link>
    </div>

    <div className={classNames(classes.comp, "pull-right")}>
    <Link to='/sample/counter?b=1' activeClassName={classes.activeRoute}>
      <Message />
    </Link>
    </div>

    <div className={classNames(classes.comp, "pull-right")}>
    <Link to='/iot' activeClassName={classes.activeRoute}>
      <Tour />
    </Link>
    </div>

  </div>
)

export default Header
