import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { LoggedInUser } from '../../Shared/classes/LoggedInUser';

class TopNav extends Component {
  _LoggedInUser;

  constructor(props){
    super(props)
    this._LoggedInUser = LoggedInUser.getLoggedInUser();
    if(!this._LoggedInUser){
      this.props.history.push('/');
      return;
  }
  }

  componentWillMount() {
    window.$('body').addClass('fixed-navbar')
  }

  componentWillUnmount() {
    window.$('body').removeClass('fixed-navbar')
  }

  navigatelogout(e) {
      LoggedInUser.logoutUser();
  }
  render() {
    return (
      <nav className="header-navbar navbar-expand-md navbar navbar-with-menu fixed-top navbar-semi-dark navbar-shadow">
        <div className="navbar-wrapper">
          <div className="navbar-header">
            <ul className="nav navbar-nav flex-row position-relative">
              <li className="nav-item mobile-menu d-md-none mr-auto">
                <a className="nav-link nav-menu-main menu-toggle hidden-xs">
                  <i className="ft-menu font-large-1" />
                </a>
              </li>
              <li className="nav-item mr-auto">
                <a className="navbar-brand" href="index.html">
                  <img
                    className="brand-logo"
                    alt="logo"
                    src="../../../app-assets/images/congni-sleep-icon.png"
                    width="40px"
                    height="40px"
                  />
                  <h3 className="brand-text">Cogni Sleep</h3>
                </a>
              </li>
              <li className="nav-item d-none d-md-block nav-toggle">
                <a
                  className="nav-link modern-nav-toggle pr-0"
                  data-toggle="collapse"
                >
                  <i
                    className="toggle-icon ft-toggle-right font-medium-3 white"
                    data-ticon="ft-toggle-right"
                  />
                </a>
              </li>
              <li className="nav-item d-md-none">
                <a
                  className="nav-link open-navbar-container"
                  data-toggle="collapse"
                  data-target="#navbar-mobile"
                >
                  <i className="fa fa-ellipsis-v" />
                </a>
              </li>
            </ul>
          </div>
          <div className="navbar-container content">
            <div
              className="collapse navbar-collapse float-right"
              id="navbar-mobile"
            >
              <ul className="nav navbar-nav float-right">
                {/* <li className="dropdown dropdown-notification nav-item">
                  <a className="nav-link nav-link-label" data-toggle="dropdown">
                    <i className="ficon ft-bell" />
                    <span className="badge badge-pill badge-default badge-danger badge-default badge-up">
                      5
                    </span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-media dropdown-menu-right">
                    <li className="dropdown-menu-header">
                      <h6 className="dropdown-header m-0">
                        <span className="grey darken-2">Notifications</span>
                        <span className="notification-tag badge badge-default badge-danger float-right m-0">
                          5 New
                        </span>
                      </h6>
                    </li>
                    <li className="scrollable-container media-list">
                      <a>
                        <div className="media">
                          <div className="media-left align-self-center">
                            <i className="ft-plus-square icon-bg-circle bg-cyan" />
                          </div>
                          <div className="media-body">
                            <h6 className="media-heading">
                              You have new order!
                            </h6>
                            <p className="notification-text font-small-3 text-muted">
                              Lorem ipsum dolor sit amet, consectetuer elit.
                            </p>
                            <small>
                              <time
                                className="media-meta text-muted"
                                dateTime="2015-06-11T18:29:20+08:00"
                              >
                                30 minutes ago
                              </time>
                            </small>
                          </div>
                        </div>
                      </a>
                      <a>
                        <div className="media">
                          <div className="media-left align-self-center">
                            <i className="ft-download-cloud icon-bg-circle bg-red bg-darken-1" />
                          </div>
                          <div className="media-body">
                            <h6 className="media-heading red darken-1">
                              99% Server load
                            </h6>
                            <p className="notification-text font-small-3 text-muted">
                              Aliquam tincidunt mauris eu risus.
                            </p>
                            <small>
                              <time
                                className="media-meta text-muted"
                                dateTime="2015-06-11T18:29:20+08:00"
                              >
                                Five hour ago
                              </time>
                            </small>
                          </div>
                        </div>
                      </a>
                      <a>
                        <div className="media">
                          <div className="media-left align-self-center">
                            <i className="ft-alert-triangle icon-bg-circle bg-yellow bg-darken-3" />
                          </div>
                          <div className="media-body">
                            <h6 className="media-heading yellow darken-3">
                              Warning notifixation
                            </h6>
                            <p className="notification-text font-small-3 text-muted">
                              Vestibulum auctor dapibus neque.
                            </p>
                            <small>
                              <time
                                className="media-meta text-muted"
                                dateTime="2015-06-11T18:29:20+08:00"
                              >
                                Today
                              </time>
                            </small>
                          </div>
                        </div>
                      </a>
                      <a>
                        <div className="media">
                          <div className="media-left align-self-center">
                            <i className="ft-check-circle icon-bg-circle bg-cyan" />
                          </div>
                          <div className="media-body">
                            <h6 className="media-heading">Complete the task</h6>
                            <small>
                              <time
                                className="media-meta text-muted"
                                dateTime="2015-06-11T18:29:20+08:00"
                              >
                                Last week
                              </time>
                            </small>
                          </div>
                        </div>
                      </a>
                      <a>
                        <div className="media">
                          <div className="media-left align-self-center">
                            <i className="ft-file icon-bg-circle bg-teal" />
                          </div>
                          <div className="media-body">
                            <h6 className="media-heading">
                              Generate monthly report
                            </h6>
                            <small>
                              <time
                                className="media-meta text-muted"
                                dateTime="2015-06-11T18:29:20+08:00"
                              >
                                Last month
                              </time>
                            </small>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="dropdown-menu-footer">
                      <a className="dropdown-item text-muted text-center">
                        Read all notifications
                      </a>
                    </li>
                  </ul>
                </li> */}
                <li className="dropdown dropdown-user nav-item">
                  <a
                    className="dropdown-toggle nav-link dropdown-user-link"
                    data-toggle="dropdown"
                  >
                    <span className="avatar avatar-online">
                      <img
                        src="../../../app-assets/images/portrait/small/avatar-s-1.png"
                        alt="avatar"
                      />
                      <i />
                    </span>
                    <span className="user-name">{this._LoggedInUser.name}</span>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right">
                    <NavLink to="/dashboard/settings" className="dropdown-item">
                      <i className="ft-user" /> Change Password
                    </NavLink>
                    <div className="dropdown-divider" />
                    <NavLink to="/login" onClick={this.navigatelogout.bind(this)} className="dropdown-item">
                      <i className="ft-power" /> Logout
                    </NavLink>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    )
  }
}

export default TopNav
