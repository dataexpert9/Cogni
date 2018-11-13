import React from 'react'
import { RequestHelper } from "../../helpers/RequestHelper"
import { jsonResponse } from '../../helpers/config.js';
import { setTimeout } from 'timers';
import { LoggedInUser } from '../../Shared/classes/LoggedInUser';

export default class MarketPlace extends React.Component {

  _RequestHelper;
  _socket;
  _LoggedInUser;
  _userRequest = [];
  constructor(props) {
    super(props);
    this.state = {
      UserRequest: [],
      AcceptedRequest: []
    }

    this._LoggedInUser = LoggedInUser.getLoggedInUser();
    if (!this._LoggedInUser) {
      this.props.history.push('/');
      return;
    }
    this._socket = this.props.socket;
    this.onAcceptClick = this.onAcceptClick.bind(this);
  }

  componentDidMount() {

  }

  onAcceptClick(obj) {
    var requestindex = -1;
    if (this.props.userrequests) {
      this.props.userrequests.findIndex(function (element, index, array) {
        if (element.sender_id == obj.sender_id) {
          requestindex = index;
          return requestindex;
        }
      });
    }
    obj.receiver_id = this._LoggedInUser.id;
    obj.reciever_username = this._LoggedInUser.name;
    obj.index = requestindex;
    this._socket.emit("agentrequestaccepted:channel", obj);
  }

  getDynamicChat() {
    return this.props.userrequests.map(function (req, index) {
      return (
        <tr className={req.sender_id} key={req.sender_id}>
          <td className="text-truncate">{index + 1}</td>
          <td className="text-truncate">{req.sender_username}</td>
          <td className="text-truncate">
            <span className="badge badge-default badge-warning">
              Pending
                </span>
          </td>
          <td className="text-truncate">
            2018-08-13 10:12 PM
              </td>
          <td>
            <div className="form-group">
              <button onClick={() => this.onAcceptClick(req)}
                type="button"
                className="btn btn-success btn-min-width mr-1 btn-md"
              >
                <i className="fa fa-check" /> Accept
                </button>
              {/* <button
                type="button"
                className="btn btn-danger btn-min-width mr-1 btn-md"
              >
                <i className="fa fa-times" /> Cancel
                </button> */}
            </div>
          </td>
        </tr>
      );
    }, this);
  }

  render() {
    var dynamicchat = this.getDynamicChat();
    var hasRequests = dynamicchat && dynamicchat.length > 0;

    return (

      <div className="app-content content">
        <div className="content-wrapper">
          <div className="content-body">
            <div className="row">
              <div className="col-12">
                <div className="card" style={{ minHeight: "500px" }}>
                  <div className="card-header" style={{ display: (hasRequests ? '' : 'none') }}>
                    <h4 className="card-title">User Requests</h4>
                    <a className="heading-elements-toggle">
                      <i className="fa fa-ellipsis-v font-medium-3" />
                    </a>
                    <div className="heading-elements">
                      <ul className="list-inline mb-0">
                        <li>
                          {/* <a data-action="reload">
                            <i className="ft-rotate-cw" />
                          </a> */}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="card-content">
                    <div style={{ paddingTop: "100px", display: (hasRequests ? 'none' : '') }}>
                      <i className="ft-users ft-users-enlarged" ></i>
                      <p className="noReqText">No Requests</p>
                    </div>
                    <div className="table-responsive" style={{ display: (hasRequests ? '' : 'none') }}>
                      <table id="recent-orders" className="table table-hover mb-0 ps-container ps-theme-default">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Client Name</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dynamicchat}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
