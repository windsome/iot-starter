import React from 'react'
import { IndexLink, Link } from 'react-router'
import classes from './Header.scss'

export const Header = () => (
  <div>
    {' · '}
    <Link to='/iot/admin/lock' activeClassName={classes.activeRoute}>
      Locks
    </Link>
    {' · '}
    <Link to='/iot/admin/user' activeClassName={classes.activeRoute}>
      Users
    </Link>
  </div>
)

export default Header
