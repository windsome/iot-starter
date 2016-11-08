import React from 'react'
import { IndexLink, Link } from 'react-router'
import classes from './Header.scss'

export const Header = () => (
  <div>
    <h1>Iot</h1>
    <IndexLink to='/' activeClassName={classes.activeRoute}>
      Home
    </IndexLink>
    {' · '}
    <Link to='/sample' activeClassName={classes.activeRoute}>
      Sample
    </Link>
    {' · '}
    <Link to='/iot/device' activeClassName={classes.activeRoute}>
      Device
    </Link>
    {' · '}
    <Link to='/iot/admin' activeClassName={classes.activeRoute}>
      Admin
    </Link>
    {' · '}
    <Link to='/iot/app' activeClassName={classes.activeRoute}>
      APP
    </Link>
    {' · '}
    <Link to='/iot/appadmin' activeClassName={classes.activeRoute}>
      APP Admin
    </Link>
  </div>
)

export default Header
