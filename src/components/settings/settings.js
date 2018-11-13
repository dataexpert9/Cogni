import React, { Component } from 'react'
// import { NavLink } from 'react-router-dom'
import { RequestHelper } from "../../helpers/RequestHelper"
import { LoggedInUser } from '../../Shared/classes/LoggedInUser';

export default class Settings extends Component {

  _showLoader;
	constructor(props) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);

		this.state = {
			messageColor: "green",
      message: "",
      showLoader: false
    };

	}

	handleSubmit(e) {
		var user = LoggedInUser.getLoggedInUser();
    this._showLoader = true;
		var postData = new FormData();
		postData.append("old_password", this.refs.currentPassword.value);
		postData.append("password", this.refs.newPassword.value);
		postData.append("confirm_password", this.refs.confirmPassword.value);
		postData.append("agent", user.id);

		var request = new RequestHelper();
		var that = this;
		this.setState({
			messageColor: "#00B5B8",
      message: "Processing...",
      showLoader: true
		});

		request.APIPostRequestWithFormData('api/web/agent/changepassword', postData, function (response) {
			if (response && response.status == 200 && response.data && response.data.Response == 2000 && response.data.Result) {
				that.setState({
					messageColor: "green",
          message: "Updated Successfully",
				});
				that.refs.currentPassword.value = "";
				that.refs.newPassword.value = "";
        that.refs.confirmPassword.value = "";
     
			}
			else {
				that.setState({
					messageColor: "red",
          message: "Updation Unsuccessful",
        });

			}

			setTimeout(() => {
				that.setState({
					messageColor: "green",
					message: ""
				});
			}, 3000);
		});

		e.preventDefault();
	}

	render() {
		return (
			<div className="app-content content">
				<div className="content-wrapper">
					<div className="content-body">
						<section id="horizontal-form-layouts">
							<div className="row">
								<div className="col-md-12">
									<div className="card">
										<div className="card-content collpase show">
											<div className="card-body">
												<form className="form form-horizontal" onSubmit={this.handleSubmit.bind(this)}>
													<div className="form-body">
														<h4 className="form-section">
															<i className="ft-user" /> Change Password
														</h4>
														<div style={{display:this.state.showLoader ? "flex" : "none" }} className="form-group row">
															<label className="col-md-3 label-control">
																&nbsp;
															</label>
															<div className="col-md-9">
																<p style={{ color: this.state.messageColor, height: "20px", fontWeight: "600" }} >{this.state.message}</p>
															</div>
														</div>
														<div className="form-group row">
															<label className="col-md-3 label-control">
																Current Password
															</label>
															<div className="col-md-9">
																<input
																	type="password"
																	className="form-control"
																	placeholder="******"
																	name="fname"
																	ref="currentPassword"
																	required
																/>
															</div>
														</div>
														<div className="form-group row">
															<label className="col-md-3 label-control">
																New Password
                             		 				</label>
															<div className="col-md-9">
																<input
																	type="password"
																	className="form-control"
																	placeholder="******"
																	name="fname"
																	ref="newPassword"
																	required
																/>
															</div>
														</div>
														<div className="form-group row">
															<label className="col-md-3 label-control">
																Confirm Password
                              </label>
															<div className="col-md-9">
																<input
																	type="password"
																	className="form-control"
																	placeholder="******"
																	name="fname"
																	ref="confirmPassword"
																	required
																/>
															</div>
														</div>
													</div>
													<div className="form-actions">
														{/* <button
                              type="button"
                              className="btn btn-warning mr-1"
                            >
                              <i className="ft-x" /> Cancel
                            </button> */}
														<button type="submit" className="btn btn-primary">
															<i className="fa fa-check-square-o" /> Save
                            </button>
													</div>
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