import React, { Component } from 'react'
import ChatArea from '../chat-area/chat-area'
import { RequestHelper } from "../../helpers/RequestHelper"
import { LoggedInUser } from '../../Shared/classes/LoggedInUser';
import { jsonResponse } from '../../helpers/config.js';
import openSocket from 'socket.io-client';
import ReactDOM from 'react-dom';
import { debug } from 'util';
import { MessageSendingType } from '../../helpers/constents';
import TimeAgo from 'react-timeago';

export class ChatList extends Component {
  _RequestHelper;
  _LoggedInUser;
  allChats;

  channelprefix = jsonResponse.APPNAME + ":";
  channelmid = ":" + this.channelprefix + "agent";
  acceptchannel;
  dynamicchat;
  _selectedIndex;
  _messageSendingType;
  _totalRecord = jsonResponse.TotalRecords;
  _searchTextValue;
  constructor(props) {
    super(props)
    this._RequestHelper = new RequestHelper();
    this._LoggedInUser = LoggedInUser.getLoggedInUser();
    this._socket = this.props.socket;
    this.handleSelectedClientChat = this.handleSelectedClientChat.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.chatArea = React.createRef();
    this._messageSendingType = MessageSendingType;
    this._searchTextValue = "";
    this.state = {
      allChats: [],
      filteredChats: [],
      selectedClientChatIndex: 0,
      selectedChats: null,
      senderid: null,
      socket: this._socket,
      messagestatus: MessageSendingType,
      pageNo: 0,
      Timer: null,
      hasPreviousMessages: true
    }
    this.acceptchannel = this.channelprefix + "Admin:Accept:Subscribe:Channel:Agent:" + this._LoggedInUser.id;
    this.props.unsetcounthandler();
  }

  componentDidMount() {
    var userdata = { userId: this._LoggedInUser.id }
    var that = this;
    this._RequestHelper.NodeGetRequest('/api/LoadChannel/' + this.acceptchannel, function (response) {
      try {
        if (response && response.data.RequestList && response.data.RequestList.length > 0) {
          var channelList = [];
          var data = Array.from(response.data.RequestList);
          data.forEach((items) => {
            var objChat;
            var item = JSON.parse(items.request);
            var chatobj = [];
            var lastMessageDate;
            if (items.message) {
              var msgitem = JSON.parse(items.message);
              var newMessage = that.createMessageObj(msgitem);
              chatobj.push(newMessage);
              lastMessageDate = msgitem.date;
            }

            var channel = that.getChannelName(item.sender_id);
            if (item.Chats) {
              objChat = {
                Id: item.id,
                ClientName: item.sender_username,
                MessageDeliveryStatus: item.messageDeliveryStatus,
                LastDateTime: lastMessageDate,
                Chats: item.Chats,
                sender_id: item.sender_id,
                channel: channel,
                UnreadCount: 0
              }
            }
            else {
              objChat = {
                Id: item.id,
                ClientName: item.sender_username,
                MessageDeliveryStatus: item.messageDeliveryStatus,
                LastDateTime: lastMessageDate,
                sender_id: item.sender_id,
                channel: channel,
                Chats: chatobj,
                UnreadCount: 0
              }
            }
            channelList.push(objChat);

          });

          channelList = that.sortChannelsByChatDate(channelList);

          that.setState({
            allChats: channelList,
            filteredChats: channelList
          });
          that.subscribeChatChannels();
          that._selectedIndex = 0;
          that.handleSelectedClientChat(0, channelList[0], 0);
          that.ScrollBottom();
        }
      }
      catch (ex) {
        console.log(ex);
      }
    },this._LoggedInUser.token);
  }

  subscribeChatChannels() {
    var channel = "";
    var that = this;
    this.state.allChats.forEach((item) => {
      // if (this._LoggedInUser.id > item.sender_id)
      //   channel = this._LoggedInUser.id + this.channelmid + item.sender_id;
      // else
      //   channel = item.sender_id + this.channelmid + this._LoggedInUser.id;
      channel = that.getChannelName(item.sender_id);
      this.subscribeChannel(channel);
    });
  }

  createMessageObj(message, index = 0, isRead = true) {
    try{ 
      return {
        id: message.id,
        UserId: message.senderUserId,
        channel: message.channel,
        MessageDeliveryStatus: message.messageDeliveryStatus,
        MessageStatusType: message.messageStatusType,
        Date: message.date,
        Chat: {
          Id: message.id,
          message:   eval("'" + message.message + "'"), 
          MessageDeliveryStatus: message.messageDeliveryStatus
        },
        IsRead: isRead,
        Index: index,
        Files: message.mediaURL
      };
    } catch(ex){
      return {
        id: message.id,
        UserId: message.senderUserId,
        channel: message.channel,
        MessageDeliveryStatus: message.messageDeliveryStatus,
        MessageStatusType: message.messageStatusType,
        Date: message.date,
        Chat: {
          Id: message.id,
          message:   message.message,
          MessageDeliveryStatus: message.messageDeliveryStatus
        },
        IsRead: isRead,
        Index: index,
        Files: message.mediaURL
      };
    }
    
  }

  subscribeChannel(channel) {
    this._socket.emit("subscribe:channel", channel)
    var that = this;
    this._socket.on(channel, (message) => {
      try {

        message = JSON.parse(message);
        let allChatsLocal = this.state.allChats;

        if (message.messageType == MessageSendingType.TEXT) {
          var newMessage = this.createMessageObj(message);

          var existingChat = allChatsLocal.find(function (element) {
            return element.channel == newMessage.channel;
          });
          var unreadCount = existingChat.Chats.filter(x => x.MessageDeliveryStatus == 1 && x.UserId != this._LoggedInUser.id).length;
         
          if (message.messageDeliveryStatus == 1) { // IsDelivered
            if (that.state.selectedChannel == message.channel) { //   IsCurrentChannel
              var existingMessageIndex = that.findWithAttr(existingChat.Chats, 'id', message.id);
              switch (message.messageStatusType) {
                case 0:  // IsNotDeleted OR IsNotUpdated
                  //this.renderChatDialogComponent(existingChat.ClientName, existingChat.LastDateTime, newMessage, "");
                  if (existingChat != undefined) {
                    existingChat.Chats.push(newMessage);
                    existingChat.LastDateTime = message.date;

                    that.setState({
                      messagestatus: message.messageType,
                      allChats: allChatsLocal,
                    });
                    this.SortChatTab();
                    that.ScrollBottom();
                    //mark message as delivered
                    if (that._LoggedInUser.id != message.senderUserId) {

                      message.messageDeliveryStatus = 2;
                      message.redisIndex = existingMessageIndex;
                      that.markMessageAsRead(message);
                    }
                  }
                  break;
                case 1://IsUpdated
                case 2: //IsDeleted 
                  //var existingChatIndex = allChatsLocal.findIndex((element) => element.channel == newMessage.channel);

                  existingChat.Chats[existingMessageIndex].MessageStatusType = message.messageStatusType;
                  existingChat.Chats[existingMessageIndex].Chat.message = message.message;

                  that.setState({
                    messagestatus: message.messageType,
                    allChats: allChatsLocal
                  });
                  break;
              }
            }
            else {   // for inactive chats
              // Update rendered element
              if (existingChat.Chats.length == 1) {
                existingChat.Chats.map(function (x) {
                  x.MessageDeliveryStatus = 2
                  return x;
                });
              }
              existingChat.Chats.push(newMessage);
              existingChat.LastDateTime = message.date;
              var unreadCountUnselected = existingChat.Chats.filter(x => x.MessageDeliveryStatus == 1 && x.UserId != this._LoggedInUser.id).length;
              existingChat.UnreadCount = unreadCountUnselected;
              that.setState({
                messagestatus: message.messageType,
                allChats: allChatsLocal
              });
              //this.renderChatDialogComponent(existingChat.ClientName, existingChat.LastDateTime, newMessage, unreadCountUnselected);
              this.SortChatTab();
            }
          }
          else if (message.messageDeliveryStatus == 2) {  // IsSeen
            if (this.state.selectedChannel != message.channel) {
              //this.renderChatDialogComponent(existingChat.ClientName, existingChat.LastDateTime, newMessage, unreadCount);
              existingChat.UnreadCount = unreadCount;
            }
            else {
              //this.renderChatDialogComponent(existingChat.ClientName, existingChat.LastDateTime, newMessage, "");
              existingChat.UnreadCount = 0;
            }
          }
        }
        else if (message.messageType == MessageSendingType.TYPING && that.state.selectedChannel == message.channel) {
          that.ScrollBottom();
          if (that._LoggedInUser.id == message.senderUserId && that.chatArea.current != null) {
            that.chatArea.current.tick();
          }
          else {
            that.setState({
              messagestatus: message.messageType
            });
          }
        }
        else if (message.messageType == MessageSendingType.STOP_TYPING && that.state.selectedChannel == message.channel) {
          that.setState({
            messagestatus: message.messageType,
            allChats: allChatsLocal
          });
        }

      } catch (ex) {
        console.log(message);
      }
    });
  }

  getChannelName(userId) {
    // if (userId > this._LoggedInUser.id)
    return userId + this.channelmid;// + this._LoggedInUser.id
    // else
    //   return this._LoggedInUser.id + this.channelmid + userId
  }

  handleSelectedClientChat(clickedIndex, chats, type = 1) {
    var that = this;
    var channel = "";
    that._selectedIndex = clickedIndex;
    // if (chats.sender_id > that._LoggedInUser.id)
    //   channel = chats.sender_id + this.channelmid + that._LoggedInUser.id
    // else
    //   channel = that._LoggedInUser.id + this.channelmid + chats.sender_id
    channel = that.getChannelName(chats.sender_id);

    this.loadMessages(channel).then(function (responseObj) {
      if (responseObj && responseObj.MessageList.length > 0) {
        if (that.state.pageNo == 0) {
          chats.Chats = responseObj.MessageList;
        }
        else {
          chats.Chats = responseObj.MessageList.concat(chats.Chats);
        }

        that.setState({
          selectedClientChatIndex: clickedIndex,
          selectedChats: chats.Chats,
          sender_id: chats.sender_id,
          selectedChannel: channel,
        })
        if (chats.Chats && chats.Chats.length > 0 && type == 1) {
          var LastMessage = chats.Chats[chats.Chats.length - 1];
          //that.renderChatDialogComponent(chats.ClientName, chats.LastDateTime, LastMessage, "");
          chats.UnreadCount = 0;
        }
      }
      else {
        that.setState({
          selectedClientChatIndex: clickedIndex,
          selectedChats: chats.Chats,
          userInput: '',
          sender_id: chats.sender_id,
          selectedChannel: channel,
        });

      }
      that.setState({
        hasPreviousMessages: responseObj.hasPreviousMessages
      });
      that._socket.emit("heartbeatListener","");
      //that.ScrollBottom();
    });
  }

  loadMessages(channel) {
    var that = this;
    var requestobj = [];
    var requestapi = '/api/LoadMessage/' + channel + '/' + this.state.pageNo + '/' + this._totalRecord;
    return new Promise(function (resolve, reject) {
      that._RequestHelper.NodeGetRequest(requestapi, (response) => {
        try {
          that.errorHandler(response);
          if (response && response.data.MessageList.length > 0) {
            response.data.MessageList.forEach((element, index) => {
              var message = JSON.parse(element);
              var oldMessage = that.createMessageObj(message, index);
              requestobj.push(oldMessage);
            });

            response.data.MessageList = requestobj;
          }


          resolve(response.data);

        } catch (ex) {
          reject(ex);
        }
      },that._LoggedInUser.token);
    })

  }

  errorHandler(error){
    if(error){
      if(error.data.statusCode == 401){
        LoggedInUser.logoutUser();
      }
    }
  }

  onChangeSearchUserHandler = event => {

    this._searchTextValue = event.target.value.toLowerCase();
    this.setState({
      userInput: this._searchTextValue
    });
    this.SortChatTab();
  }

  SortChatTab() {
    var updatedList = this.state.allChats;
    var that = this;
    if (this._searchTextValue) {
      updatedList = updatedList.filter(function (item) {
        if (item.ClientName) {
          return item.ClientName.toLowerCase().search(that._searchTextValue) !== -1;
        }
      });
    }
    updatedList = this.sortChannelsByChatDate(updatedList);
    this.setState({
      filteredChats: updatedList,
    });
  }

  findWithAttr(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
      if (array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  }

  onLazyLoading() {
    var that = this;
    var existingChat = this.state.allChats.find(function (element) {
      return element.channel == that.chatArea.current.props.selectedChannel;
    });
    this.state.pageNo = this.state.pageNo + 1;
    this.handleSelectedClientChat(this.state.selectedClientChatIndex, existingChat);
  }

  ScrollBottom() {
    var that = this;
    setTimeout(function () {
      if (that.chatArea && that.chatArea.current) {
        that.chatArea.current.scrollToBottom();
      }
      else {
        that.ScrollBottom();
      }
    }, 200)
  }

  sortChannelsByChatDate(channelList) {
    var that = this;
    return channelList.sort(function (a, b) {
      if (a && b && a.LastDateTime && a.LastDateTime) {
        var dateA = ChatList.getDateByString(a.LastDateTime);
        var dateB = ChatList.getDateByString(b.LastDateTime);

        return ((dateB < dateA) ? -1 : ((dateB > dateA) ? 1 : 0));
      }
      else {
        return 0;
      }
    });
  }

  static getDateByString(dateString) {
    if (dateString) {
      try {
        dateString = dateString.replace("at", "");
        dateString = dateString.replace("st ", " ");
        dateString = dateString.replace("nd ", " ");
        dateString = dateString.replace("rd ", " ");
        dateString = dateString.replace("th ", " ");
        return new Date(dateString);
      }
      catch (ex) {
        console.log(ex);
      }
    }
    return new Date();
  }

  renderChatDialogComponent(clientName, lastDateTime, messageObj, unreadCount) {
    var lastDateTimeObj1 = this.getDateByString(lastDateTime);
    // var chatDialog = (
    //   <div>
    //     <h6 className="list-group-item-heading">
    //       {clientName}
    //       <span className="font-small-3 float-right primary">
    //         <TimeAgo date={lastDateTimeObj1.toString()} />
    //       </span>
    //     </h6>
    //     <p className="list-group-item-text text-muted mb-0">
    //       <i className="ft-check primary font-small-2" />

    //       {messageObj.Chat.message.length >
    //         18
    //         ? (this._LoggedInUser.id == messageObj.UserId ? 'You: ' : '') + messageObj.Chat.message.substring(0, 18) + '...'
    //         : (this._LoggedInUser.id == messageObj.UserId ? 'You: ' : '') + messageObj.Chat.message}


    //       <span className="float-right primary">
    //         {unreadCount > 0 ?
    //           <span className="badge badge-pill badge-primary">
    //             {unreadCount}
    //           </span> : ''}
    //       </span>
    //     </p>
    //   </div>);

    // ReactDOM.render(chatDialog, document.getElementById('dialog' + messageObj.channel));
  }

  renderChatSingleElement(clientName, lastDateTime, item) {
    var lastDateTimeObj = ChatList.getDateByString(lastDateTime);
    if (item && item.Chats && item.Chats.length > 0) {
      var obj = item.Chats[item.Chats.length - 1];
      if (obj) {
        var chat = obj.Chat;
        var userId = chat.UserId;
        var message = chat.message;
      }
    }
    return (
      <div id={'dialog' + item.channel}>
        <div>
          <h6 className="list-group-item-heading">
            <span className="username" title={clientName}>{clientName}</span>
            <span className="font-small-3 float-right primary">
              <TimeAgo style={lastDateTime ? {} : { display: "none" }} date={lastDateTimeObj.toString()} />
            </span>
          </h6>
          <p className="list-group-item-text text-muted mb-0">
            <i className="ft-check primary font-small-2" style={message ? {} : { display: "none" }} />
            <span className="messageString" title={message}>
              {this._LoggedInUser.id == userId ? 'You: ' : ''}
              {message}
            </span>
            {/* {item.Chats[item.Chats.length - 1].Chat.message.length >
                18
                ? item.Chats[item.Chats.length - 1].Chat.message.substring(0, 18) + '...'
                : (this._LoggedInUser.id == item.Chats[item.Chats.length - 1].UserId ? 'You: ' : '') + item.Chats[item.Chats.length - 1].Chat.message} */}

            <span className="float-right primary">
              {item.UnreadCount > 0 ?
                <span className="badge badge-pill badge-primary">
                  {item.UnreadCount}
                </span> : ''}
            </span>
          </p>

        </div>
      </div>
    );
  }

  markMessageAsRead(message) {
    this._socket.emit("markAsDelivered", message);
  }

  clearPageNo() {
    this.state.pageNo = 0;
  }

  sendMessage(Message) {
    if (Message.messageType == this._messageSendingType.TEXT) {
      if (this.props.aliveclientlist && this.props.aliveclientlist.length > 0) {
        var activeClient = this.props.aliveclientlist.find(x => x.sender_id == Message.senderUserId);
        if (!activeClient || (activeClient && !activeClient.isActive)) {
          var userDevices = this.props.userdevices;
          if (userDevices) {
            var device = userDevices.find(x => x.Id == Message.senderUserId);
            if (device) {
              Message.Token = device.Devices;
            }
          }
        }
      }
      else {
        var userDevices = this.props.userdevices;
        if (userDevices) {
          var device = userDevices.find(x => x.Id == Message.senderUserId);
          if (device) {
            Message.Token = device.Devices;
          }
        }
      }
    }
    this._socket.emit("io:sendmessageagent",Message);
  }

  render() {
    var dynamicchat = this.state.filteredChats.map(function (item, index) {
      if (item.sender_id == undefined)
        return;
      var unreadCount = item.Chats.filter(x => x.MessageDeliveryStatus == 1 && x.UserId != this._LoggedInUser.id).length;
      var activeClient = this.props.aliveclientlist.find(x => x.sender_id == item.sender_id);
      item.isAlive = activeClient ? activeClient.isAlive : false;
      return (
        <a
          className={
            item.sender_id === this.state.sender_id
              ? 'media bg-blue-grey bg-lighten-5 border-left-primary border-left-5'
              : 'media border-0'
          }
          key={index}
          onClick={(event) => { this.clearPageNo(); this.handleSelectedClientChat(index, item); }}
        >
          <div className="media-left pr-1">
            <span className={item.isAlive ? "avatar avatar-md avatar-online" : "avatar avatar-md avatar-off"}>
              <img
                className="media-object rounded-circle"
                src="../../../app-assets/images/portrait/small/avatar-s-3.png"
                alt="Generic placeholder"
              />
              <i />
            </span>
          </div>
          <div className="media-body w-100">
            {this.renderChatSingleElement(item.ClientName, item.LastDateTime, item, unreadCount)}
          </div>
        </a>
      );
    }, this);

    return (
      <div className="app-content content">
        <div className="sidebar-left sidebar-fixed">
          <div className="sidebar">
            <div className="sidebar-content card d-none d-lg-block">
              <div className="card-body chat-fixed-search">
                <fieldset className="form-group position-relative has-icon-left m-0">
                  <input
                    type="text"
                    className="form-control"
                    id="iconLeft4"
                    placeholder="Search user"
                    value={this.state.userInput || ''}
                    onChange={this.onChangeSearchUserHandler}
                  />
                  <div className="form-control-position">
                    <i className="ft-search" />
                  </div>
                </fieldset>
              </div>
              <div id="users-list" className="list-group position-relative">
                <div className="users-list-padding media-list">
                  {dynamicchat}
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.state.selectedChats ? (
          <ChatArea
            onloadmoremessages={this.onLazyLoading.bind(this)}
            ref={this.chatArea} socket={this.state.socket}
            selectedChannel={this.state.selectedChannel}
            senderid={this.state.sender_id}
            selectedChat={this.state.selectedChats}
            onchatstatus={this.state.messagestatus}
            pageno={this.state.pageNo}
            sendMessage={this.sendMessage}
            hasPreviousMessages={this.state.hasPreviousMessages}
          />
        ) : (
            <div className="content-right">
              <div className="content-wrapper">
                <div className="content-header row" />
                <div className="content-body">
                  <section className="emptyChat">
                    <i className="ft-message-square"></i>
                    <p>No Messages, yet</p>
                  </section>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }

}


export default ChatList


