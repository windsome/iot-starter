import React from 'react'
import { IndexLink, Link } from 'react-router'
import classes from './Header.scss'

export const Header = (props) => (
  <div>
    {' · '}
    <Link to='/iot/admin/lock' activeClassName={classes.activeRoute}>
      Locks
    </Link>
    {' · '}
    <Link to='/iot/admin/user' activeClassName={classes.activeRoute}>
      Users
    </Link>
    {' · '}
    <Link to={'/iot/admin/lock/'+props.params.lockId+'/set_password'} activeClassName={classes.activeRoute}>
      SetPassword
    </Link>
    {' · '}
    <Link to={'/iot/admin/lock/'+props.params.lockId+'/send_scene_id'} activeClassName={classes.activeRoute}>
      SendSceneId
    </Link>
    {' · '}
    <Link to={'/iot/admin/lock/'+props.params.lockId+'/set_config'} activeClassName={classes.activeRoute}>
      SetConfig
    </Link>
    {' · '}
    <Link to={'/iot/admin/lock/'+props.params.lockId+'/reset'} activeClassName={classes.activeRoute}>
      Reset
    </Link>
    {' · '}
    <Link to={'/iot/admin/lock/'+props.params.lockId+'/update'} activeClassName={classes.activeRoute}>
      Update
    </Link>
    {' · '}
    <Link to={'/iot/admin/lock/'+props.params.lockId+'/get_password'} activeClassName={classes.activeRoute}>
      GetPassword
    </Link>
    {' · '}
    <Link to={'/iot/admin/lock/'+props.params.lockId+'/get_config'} activeClassName={classes.activeRoute}>
      GetConfig
    </Link>
  </div>
)

export default Header
