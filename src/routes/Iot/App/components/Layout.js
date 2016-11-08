import React from 'react'
import Header from './Header'
import classes from './Layout.scss'

export const Layout = ({ children }) => (
  <div className={classes.outContainer}>
    <Header />
    <div className={classes.mainContainer}>
      {children}
    </div>
  </div>
)

Layout.propTypes = {
  children: React.PropTypes.element.isRequired
}

export default Layout
