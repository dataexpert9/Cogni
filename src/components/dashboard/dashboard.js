import React from 'react'
import { Route } from 'react-router-dom'
import TopNav from '../top-nav/top-nav'
import Sidebar from '../sidebar/sidebar'
import ChatList from '../chat-list/chat-list'
import MarketPlace from '../market-place/market-place'
import Settings from '../settings/settings'
import socketIOClient from 'socket.io-client'
import { jsonResponse } from '../../helpers/config';
import { PropsRoute, PublicRoute, PrivateRoute } from 'react-router-with-props';
import { RequestHelper } from "../../helpers/RequestHelper"
import { LoggedInUser } from '../../Shared/classes/LoggedInUser';
import 'react-image-lightbox/style.css';
import 'emoji-mart/css/emoji-mart.css';

class Dashboard extends React.Component {

  _RequestHelper;
  _socket;
  _LoggedInUser;
  channelmid = ":" + jsonResponse.APPNAME + "agent:";
  channelprefix = jsonResponse.APPNAME + ":";
  acceptchannel;
  requestChanel = this.channelprefix + "Admin:Request:Subscribe:Channel";
  pushChannel = "Push:" + jsonResponse.APPNAME
  HeartBeatChannel = "HeartBeat:" + jsonResponse.APPNAME
  aliveclients = [];
  isActiveChat = false;
  isLive = jsonResponse.SERVER.IsLive;
  isCancelled = false;

  constructor(props) {
    super(props)
    this._RequestHelper = new RequestHelper();
    this._LoggedInUser = LoggedInUser.getLoggedInUser();
    if (!this._LoggedInUser) {
      this.props.history.push('/');
      return;
    }
    this.UnsetCount = this.UnsetCount.bind(this);
    this.state = {
      socket: "",
      UserRequest: [],
      AcceptedRequest: [],
      MessageCount: 0,
      AliveClients: [],
      UserDevices: []
    };
  }
  componentWillMount() {
    this._socket = this.isLive ? socketIOClient(jsonResponse.SERVER.NODESERVERHOSTSOCKET, { path: '/node/socket.io' }) : socketIOClient(jsonResponse.SERVER.NODESERVERHOST)
    this.acceptchannel = this.channelprefix + "Admin:Accept:Subscribe:Channel:Agent:" + this._LoggedInUser.id;
    this.subscribeRequests(this.requestChanel, 'all');
    this.subscribeAcceptRequests(this.acceptchannel, "all");
    this.HearBeatListner();
    this.subscribeHeartbeat();
    this.loadRequests();
    //this.loadPushToken();
    !this.isCancelled && this.setState({
      socket: this._socket
    });
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  loadPushToken() {
    var that = this;
    this._RequestHelper.NodeGetRequest('/api/LoadChannel/' + this.pushChannel, function (response) {
      that.errorHandler(response);
      response.data.RequestList.forEach((reqitem) => {
        that.state.UserDevices.push(JSON.parse(reqitem));
      });
      !that.isCancelled && that.setState({
        UserDevices: that.state.UserDevices,
      });
    }, this._LoggedInUser.token);

    this._socket.on(this.pushChannel, function (reciver) {
      this.loadPushToken();
    });
  }

  loadRequests() {
    try {
      var that = this;
      this._RequestHelper.NodeGetRequest('/api/LoadChannel/' + that.requestChanel, function (response) {
        that.errorHandler(response);
        if (response && response.data.statusCode == 200) {
          that._RequestHelper.NodeGetRequest('/api/LoadChannel/' + that.acceptchannel, function (acceptresponse) {
            that.errorHandler(response);
            if (acceptresponse) {
              var requestobj = [];
              var acceptobj = [];
              if (acceptresponse.data && acceptresponse.data.RequestList && acceptresponse.data.RequestList.length > 0) {
                response.data.RequestList.forEach((reqitem) => {
                  var reqobj = JSON.parse(reqitem);
                  var item = acceptresponse.data.RequestList.find((el) => reqobj.sender_id == JSON.parse(el.request).sender_id);
                  if (reqobj.sender_id != that._LoggedInUser.id && !item) {
                    requestobj.push(reqobj);
                  }
                });
                acceptresponse.data.RequestList.forEach((acceptitem) => {
                  var acpt = JSON.parse(acceptitem.request);
                  acceptobj.push(acpt)
                });
                !that.isCancelled && that.setState({
                  UserRequest: requestobj,
                  AcceptedRequest: acceptobj
                });
              }
              else {
                response.data.RequestList.forEach((item) => {
                  var reqobj = JSON.parse(item);
                  if (reqobj.sender_id != that._LoggedInUser.id) {
                    requestobj.push(reqobj);
                  }
                });
                !that.isCancelled && that.setState({
                  UserRequest: requestobj
                });
              }
            }
            else {
              var requestobj = [];
              response.data.RequestList.forEach((item) => {
                var reqobj = JSON.parse(item);
                if (reqobj.sender_id != that._LoggedInUser.id) {
                  requestobj.push(reqobj);
                }
              });
              !that.isCancelled && that.setState({
                UserRequest: requestobj
              });
            }

          }, that._LoggedInUser.token);
        }
      }, this._LoggedInUser.token)
    } catch (ex) {
      console.log(ex);
    }
  }
  errorHandler(error) {
    if (error) {
      if (error.data.statusCode == 401) {
        LoggedInUser.logoutUser();
      }
    }
  }
  subscribeHeartbeat() {
    // var that = this;
    // this.HeartBeatStarter();
    // setInterval(() => {
    //   this.HeartBeatStarter();
    // },(5000));

    // setInterval(() => {
    //   that.aliveclients = that.aliveclients.map(function(item){
    //       item.isAlive = false;
    //       return item;
    //     });
    //     !that.isCancelled && that.setState({
    //       AliveClients: that.aliveclients
    //     });
    // },9950);
  }

  HeartBeatStarter() {
    var acceptedRequests = this.state.AcceptedRequest;
    if (acceptedRequests && acceptedRequests.length > 0) {
      var that = this;
      acceptedRequests.forEach(function (item) {
        var userExist = that.aliveclients.find(x => x.sender_id == item.sender_id);
        if (!userExist) {
          item.isAlive = false;
          that.aliveclients.push(item);
          that.state.AliveClients = that.aliveclients;
        }
        // that._socket.emit("heartbeatListener",item);
      });
    }
  }
  HearBeatListner() {
    var channel = "HeartBeat:" + this.channelprefix + this._LoggedInUser.id;
    this._socket.emit("subscribe:channel", channel);
    var that = this;
    this._socket.on(channel, (item) => {
      // console.log(channel + "alive" + item);
      var item = JSON.parse(item);
      that.aliveclients.map(function (x) {
        if (x.sender_id === item.sender_id) {
          x.isAlive = item.isAlive;
          return x;
        }
      });
      !that.isCancelled && that.setState({
        AliveClients: that.aliveclients
      });

    });

    this._socket.on(this.HeartBeatChannel, (aliveUsers) => {
      var acceptedRequests = this.state.AcceptedRequest;
      var that = this;
      if (acceptedRequests && acceptedRequests.length > 0) {
        acceptedRequests.forEach(function (item) {
          var userExist = that.aliveclients.find(x => x.sender_id == item.sender_id);
          item.isAlive = false;
          if (!userExist) {
            that.aliveclients.push(item);
          }
          that.state.AliveClients = that.aliveclients;
          // that._socket.emit("heartbeatListener",item);
        });
      }
      that.aliveclients.map(function (x) {
        let onlineUser = aliveUsers.find(z => parseInt(z.userId) == x.sender_id);
        if (onlineUser) {
          x.isAlive = onlineUser.onlineStatus;
          return x;
        }
      });
      !that.isCancelled && that.setState({
        AliveClients: that.aliveclients
      });
    });

    setTimeout(() => {
      that._socket.emit("userstatus", "");
    }, 5000);
    
    this._socket.emit("userstatus", "");
  }

  subscribeRequests(reqchannel, unsubscribe) {
    if (reqchannel) {
      var that = this;
      this._socket.emit("unsubscribe:channel", unsubscribe);
      this._socket.emit("subscribe:channel", reqchannel);
      this._socket.on(reqchannel, (req) => {
        try {
          var reqobj = JSON.parse(req);
          var isExist = false;
          var item = that.state.AcceptedRequest.find((el) => reqobj.sender_id == el.sender_id);

          if (reqobj.sender_id != that._LoggedInUser.id && item) {
            isExist = true;
          }
          else if (that.state.UserRequest && that.state.UserRequest.length > 0) {
            isExist = that.state.UserRequest.find((el) => reqobj.sender_id == el.sender_id) != undefined;
          }


          if (!isExist) {
            if (reqobj.sender_id != that._LoggedInUser.id) {
              that.state.UserRequest.push(reqobj);
            }
            !that.isCancelled && that.setState({
              UserRequest: that.state.UserRequest
            });
          }
        }
        catch (ex) {
          console.log(ex);
        }
      });
    }
  }

  subscribeAcceptRequests(acptchannel, unsubscribe) {
    if (acptchannel) {
      var that = this;
      this._socket.emit("unsubscribe:channel", unsubscribe)
      this._socket.emit("subscribe:channel", acptchannel)
      this._socket.on(acptchannel, (req) => {
        try {
          that._socket.emit("heartbeatListener","");
          var reqobj = JSON.parse(req);
          var objchan = '';
          if (reqobj.receiver_id > reqobj.sender_id) {
            objchan = reqobj.receiver_id + that.channelmid + reqobj.sender_id;
          }
          else {
            objchan = reqobj.sender_id + that.channelmid + reqobj.receiver_id;
          }

          if (reqobj.sender_id != that._LoggedInUser.id) {
            that.state.AcceptedRequest.push(reqobj);
          }
          !that.isCancelled && that.setState({
            UserRequest: that.state.UserRequest.filter((el) => reqobj.sender_id !== el.sender_id),
            AcceptedRequest: that.state.AcceptedRequest
          });
          // that.subscribeChannel(objchan, 'all')
          //Subscribe Channel functionality because above one isn't working
        }
        catch (ex) {
          console.log(ex);
        }
      }, this);
    }
  }

  subscribeChannel(channel, unsubscribe) {
    this._socket.emit("unsubscribe:channel", unsubscribe);
    this._socket.emit("subscribe:channel", channel);
  }

  UnsetCount() {
    var count = 0;
    !this.isCancelled && this.setState({
      MessageCount: count
    })
  }

  render() {

    return (
      <div>
        <TopNav />
        <Sidebar userrequests={this.state.UserRequest} acceptedrequest={this.state.AcceptedRequest} />
        <PropsRoute exact path="/dashboard/market-place" component={MarketPlace} socket={this.state.socket} userrequests={this.state.UserRequest} />
        <PropsRoute exact path="/dashboard/chat-list" component={ChatList} socket={this.state.socket} unsetcounthandler={this.UnsetCount} aliveclientlist={this.state.AliveClients} userdevices={this.state.UserDevices} />
        <PropsRoute exact path="/dashboard/settings" component={Settings} socket={this.state.socket} />
      </div>
    )
  }
}

export default Dashboard
