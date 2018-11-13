import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { LoggedInUser } from '../../Shared/classes/LoggedInUser';

class Sidebar extends Component {
  
  constructor(){
    super();
  }
  componentWillMount() {
    window.$('body').addClass('vertical-menu-modern content-left-sidebar')
  }

  componentWillUnmount() {
    window.$('body').removeClass('vertical-menu-modern content-left-sidebar')
  }
  navigatelogout(e) {
    LoggedInUser.logoutUser();
  }
  render() {
    return (
      <div
        className="main-menu menu-fixed menu-dark menu-accordion menu-shadow"
        data-scroll-to-active="true"
      >
        <div className="main-menu-content">
          <ul
            // navigation-main => Class is removed
            className="navigation"
            id="main-menu-navigation"
            data-menu="menu-navigation"
          >
            <li className=" navigation-header">
              <span>General</span>
              <i
                className=" ft-minus"
                data-toggle="tooltip"
                data-placement="right"
                data-original-title="Apps"
              />
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/market-place">
                <i className="ft-users" />
                <span className="menu-title" data-i18n="">
                  Chat Requests
                </span>
                <span className="badge badge badge-danger badge-pill float-right mr-2 no-margin-left" style={{display: this.props.userrequests.length > 0 ? "inline-block" : "none"}}>
                {this.props.userrequests.length}
                </span> 
                {/* <span className="badge badge badge-danger badge-pill float-right mr-2 no-margin-left">
                  New
                </span> */}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard/chat-list">
                <i className="ft-message-square" />
                <span className="menu-title" data-i18n="">
                  Active Chats
                </span>
                <span className="badge badge badge-danger badge-pill float-right mr-2 no-margin-left" style={{display: this.props.acceptedrequest && this.props.acceptedrequest.length > 0 ? "inline-block" : "none"}}>
                {(this.props.acceptedrequest ? this.props.acceptedrequest.length : 0)}
                </span> 
              </NavLink>
            </li>
            <li className=" nav-item">
              <NavLink to="/dashboard/settings">
                <i className="ft-settings" />
                <span className="menu-title" data-i18n="">
                  Change Password
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" onClick={this.navigatelogout.bind(this)}>
                <i className="ft-log-out" />
                <span className="menu-title" data-i18n="">
                  Logout
                </span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

export default Sidebar
