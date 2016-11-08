import React from 'react'
import { IndexLink, Link } from 'react-router'
import classes from './Header.scss'

export const Header = (props) => (
  <div>
        <div className="weui-search-bar" id="searchBar">
            <div className="weui_media_hd">
                <img className={classes.headAvatar} src="https://team.weui.io/avatar/bear.jpg" alt=""/>
            </div>
            <form className="weui-search-bar__form">
                <div className="weui-search-bar__box">
                    <i className="weui-icon-search"></i>
                    <input className="weui-search-bar__input" id="searchInput" placeholder="搜索" required="" type="search"/>
                    <a href="javascript:" className="weui-icon-clear" id="searchClear"></a>
                </div>
                <label className="weui-search-bar__label" id="searchText" style={{transformOrigin: '0px 0px 0px', opacity: 1, transform: 'scale(1, 1)'}}>
                    <i className="weui-icon-search"></i>
                    <span>搜索</span>
                </label>
            </form>
            <a href="javascript:" className="weui-search-bar__cancel-btn" id="searchCancel">取消</a>
        </div>
  </div>
)

export default Header
