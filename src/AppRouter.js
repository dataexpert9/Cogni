import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
// Components
import Login from './components/login/login'
import Dashboard from './components/dashboard/dashboard'
// Extarnal Libs
import jQuery from './../node_modules/jquery/dist/jquery.slim'

window.$ = window.jQuery = jQuery
class AppRouter extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={Login} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/login" component={Login} />
        </div>
      </Router>
    )
  }
}

export default AppRouter
