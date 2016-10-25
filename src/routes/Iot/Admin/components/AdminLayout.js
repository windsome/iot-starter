import React from 'react'
import Header from './Header'
import classes from './AdminLayout.scss'

export const Layout = ({ info, header, main }) => (
  <div className={classes.outContainer}>
    {info || ''}
    <div>
      {header || ''}
    </div>
    <div className={classes.mainContainer}>
      {main || ''}
    </div>
  </div>
)

Layout.propTypes = {
  children: React.PropTypes.element.isRequired
}

export default Layout
