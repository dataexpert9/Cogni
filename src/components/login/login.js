import React from 'react'
import { RequestHelper } from "../../helpers/RequestHelper"
import { LoggedInUser } from '../../Shared/classes/LoggedInUser';
import { UserType } from '../../helpers/constents';

class Login extends React.Component {

  constructor(props){
    super(props);
    var userObj = LoggedInUser.getLoggedInUser();
    if(userObj){
      this.props.history.push('/dashboard');
    }
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      showInvalidLoginMsg : false
    }
  }

  handleSubmit(e){

    // var postData = new FormData();
    // postData.append("email",this.refs.username.value);
    // postData.append("password",this.refs.password.value);

    var postData = {
      email : this.refs.username.value,
      password : this.refs.password.value,
      userType : 0
    };

    var request = new RequestHelper();
    var that = this;
    that.setState({
      showInvalidLoginMsg : false
     }); 
     
    request.APIPostRequest('/api/users/login',postData,function(response){
      if(response && response.status == 200 && response.data && response.data.statusCode == 200 ){
            LoggedInUser.addLoggedInUser(response.data.user);
            that.props.history.push('/dashboard');
        }
        else{
          that.setState({
            showInvalidLoginMsg : true
          });
        }
    });
   
    e.preventDefault();
  }
  
  render() {
    return (
      <div className="app-content content">
        <div className="content-wrapper">
          <div className="content-header row" />
          <div className="content-body">
            <section className="flexbox-container">
              <div className="col-12 d-flex align-items-center justify-content-center">
                <div className="col-md-4 col-10 box-shadow-2 p-0">
                  <div className="card border-grey border-lighten-3 m-0">
                    <div className="card-header border-0">
                      <div className="card-title text-center">
                        <div className="p-1">
                          <img
                            src="../../../app-assets/images/congni-sleep-logo.png"
                            alt="branding logo"
                          />
                        </div>
                      </div>
                      <h6 className="card-subtitle line-on-side text-muted text-center font-small-3 pt-2">
                        <span>Agent Area</span>
                      </h6>
                    </div>
                    <div className="card-content">
                      <div className="card-body pt-0">
                        <form className="form-horizontal" onSubmit={this.handleSubmit.bind(this)}>
                        <p style={{color:"red", display: this.state.showInvalidLoginMsg ? "block" : "none"}} >Invalid Username or Password</p>
                          <fieldset className="form-group floating-label-form-group">
                            <label htmlFor="user-name">Username</label>
                            <input
                              type="text"
                              className="form-control"
                              id="user-name"
                              placeholder="Your Username"
                              ref="username"
                            />
                          </fieldset>
                          <fieldset className="form-group floating-label-form-group mb-1">
                            <label htmlFor="user-password">Password</label>
                            <input
                              type="password"
                              className="form-control"
                              id="user-password"
                              placeholder="Enter Password"
                              ref="password"
                            />
                          </fieldset>
                            <button
                              type="submit"
                              className="btn btn-outline-primary btn-block"
                            >
                              <i className="ft-unlock" /> Login
                            </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }
}

export default Login
