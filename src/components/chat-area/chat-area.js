import React, { Component } from 'react'
import { LoggedInUser } from '../../Shared/classes/LoggedInUser';
import { jsonResponse } from '../../helpers/config';
import { RequestHelper } from '../../helpers/RequestHelper';
import { IMessageViewModel } from '../../Shared/models/Message';
import { MessageSendingType } from '../../helpers/constents';
import { isMoment } from '../../../node_modules/moment';
import * as moment from 'moment';
import ChatList from './../chat-list/chat-list';
import { Picker } from 'emoji-mart';
import $ from 'jquery';
import Lightbox from 'react-image-lightbox';


class ChatArea extends Component {
  _socket;
  _LoggedInUser;
  _messageStatus;
  _pageNo;
  _messageSendingType
  channelprefix = jsonResponse.APPNAME + ":";
  channelmid = ":" + this.channelprefix + "agent";
  apiBaseUrl = "http://10.100.20.21:5200";
  isCancelled = false;

  constructor(props) {
    super(props)

    this._RequestHelper = new RequestHelper();
    this._LoggedInUser = LoggedInUser.getLoggedInUser();
    this._socket = this.props.socket;
    this.newMessageClick = this.newMessageClick.bind(this);
    this._messageStatus = this.props.onchatstatus;
    this._pageNo = this.props.pageno;
    this._messageSendingType = MessageSendingType;
    var channel = "";
    // if (this._LoggedInUser.id > this.props.senderid)
    //   channel = this._LoggedInUser.id + this.channelmid + this.props.senderid;
    // else
    //   channel = this.props.senderid + this.channelmid + this._LoggedInUser.id;
    channel = this.getChannelName(this.props.senderid);

    this.keyPress = this.keyPress.bind(this);
    this.KeyPressEvent = this.KeyPressEvent.bind(this);

    this.state = {
      messageStatus: undefined,
      showEmojiPicker: false,
      uploadedFiles: [],
      isLightboxOpen: false,
      lightboxImageIndex: 0,
      lightboxAllImages: []
    };
  }

  keyPress(e) {
    if (e.keyCode == 13) {
      this.newMessageClick(this._messageSendingType.TEXT);
    }
  }


  KeyPressEvent(e) {
    if (e.keyCode != 13) {
      this.newMessageClick(this._messageSendingType.TYPING);
    }
  }


  componentDidMount() {
    //this.scrollToBottom();
    var that = this;
    $("body").click(function (event) {
      var clickedOutsideEmojiContainer = $(event.target).closest('.emoji-mart').length == 0;
      var clickedOnEmojiPickerBtn = $(event.target).closest('.emojiPickerBtn').length > 0;
      if (clickedOutsideEmojiContainer && (!clickedOnEmojiPickerBtn || !that.state.showEmojiPicker)) {
        !that.isCancelled && that.setState({
          showEmojiPicker: false
        });
      }
    })
  }

  unSubscribeChannel(channel) {
    this._socket.emit("unsubscribe:channel", channel);
  };

  componentDidUpdate(prevProps) {
    //this.scrollToBottom();
  }

  componentWillMount() {
    window.$('body').addClass('chat-application chat-height')
  }

  componentWillUnmount() {
    window.$('body').removeClass('chat-application')
  }

  newMessageClick(type) {
    var messageText = this.refs.iconLeft4.value;

    if ((messageText == undefined || messageText.length == 0) && this.state.uploadedFiles.length == 0)
      return;

    var channel = "";
    channel = this.getChannelName(this.props.senderid);


    var data = {
      message: messageText,
      cuser: this._LoggedInUser,
      channel: channel,
      messageDeliveryStatus: 1,
      Images: this.state.uploadedFiles,
      type: type,
      sender_id: this.props.senderid
    }

    let messageObject = new IMessageViewModel()

    messageObject.message = messageText;
    messageObject.senderUserName = this._LoggedInUser.name;
    messageObject.senderUserId = this._LoggedInUser.id;
    messageObject.senderUserImage = this._LoggedInUser.image;
    messageObject.receiverUserId = this.props.senderid;
    messageObject.isMedia = false;
    messageObject.mediaURL = this.state.uploadedFiles;
    messageObject.channel = channel;
    messageObject.messageType = type;
    messageObject.messageDeliveryStatus = 1;
    messageObject.messageStatusType = 0;

    this.props.sendMessage(messageObject);
    

    if (type === this._messageSendingType.TEXT) {
      this.newMessageClick(this._messageSendingType.STOP_TYPING)
      this.refs.iconLeft4.value = "";

      //reseting images array
      !this.isCancelled && this.setState({
        uploadedFiles: []
      });
    }

    !this.isCancelled &&  this.setState({
      showEmojiPicker: false
    });

  }

  tick() {
    try {
      var that = this;
      setTimeout(function () {
        that.newMessageClick(that._messageSendingType.STOP_TYPING)
      }, 1000);
    }
    catch (e) {
      console.log(e);
    }
  }

  StopTyping() {
    try {
      !this.isCancelled &&  this.setState({
        messagestatus: "STOP_TYPING"
      });
    }
    catch (e) {

    }
    clearInterval(this._Timer);
  }

  loadItems() {
    this.props.onloadmoremessages();
  }

  getChannelName(userId) {
    // if (userId > this._LoggedInUser.id)
    return userId + this.channelmid;// + this._LoggedInUser.id
    // else
    //   return this._LoggedInUser.id + this.channelmid + userId
  }

  filterEmojis(emoji) {
    var name = emoji.name.toLowerCase();
    return emoji.has_img_apple && emoji.has_img_emojione && emoji.has_img_facebook && emoji.has_img_google && emoji.has_img_messenger &&
      emoji.has_img_twitter && (emoji.search.indexOf("kiss") == -1) && (name.indexOf(" woman ") == -1) &&
      (name.indexOf(" man ") == -1) && (name.indexOf(" boy ") == -1) && (name.indexOf(" girl ") == -1) &&
      (name.indexOf(" heart ") == -1);
  }

  showLightbox(files, index) {
    var filePath = files[index].filePath;
    var newList = files.filter(x => x.fileType.indexOf("image") > -1);
    var newIndex = newList.findIndex(x => x.filePath === filePath);
    this.setState({
      isLightboxOpen: true,
      lightboxAllImages: newList,
      lightboxImageIndex: newIndex
    });
  }

  render() {
    const { lightboxImageIndex, isLightboxOpen, lightboxAllImages } = this.state;
    return (
      <div className="content-right">
        <div className="content-wrapper">
          <div className="content-header row" />
          <div className="content-body">
            <section className="chat-app-window">

              <div className="emptyChat" style={{ display: (this.props.selectedChat && this.props.selectedChat.length > 0 ? 'none' : '') }}>
                <i className="ft-message-square"></i>
                <p>No Messages, yet</p>
              </div>
              <div className="chats" style={{ display: (this.props.selectedChat.length > 0 ? '' : 'none') }}>
                <div className="chats">
                  {/* Agent chat start */}
                  <a style={{ display: (this.props.hasPreviousMessages ? '' : 'none') }} onClick={this.loadItems.bind(this)} className="previousTag">load previous messages</a>

                  {this.props.selectedChat.map((ele, index) => {
                    var date = ChatList.getDateByString(ele.Date);
                    var messageDate = moment(date).format("MMM DD, YYYY hh:mma");
                    return (

                      <div
                        key={index}
                        className={
                          'chat ' + (ele.UserId === this._LoggedInUser.id ? 'chat-left' : '')
                        }
                      >
                        <div className="chat-avatar">
                          <a
                            className="avatar"
                            data-toggle="tooltip"
                            data-placement="right"
                            title=""
                            data-original-title=""
                          >
                            <img
                              src="../../../app-assets/images/portrait/small/avatar-s-1.png"
                              alt="avatar"
                            />
                          </a>
                        </div>
                        <div className="chat-body">
                          <div className="chat-content">
                            <p>{ele.Chat.message}</p>
                            <div className="messageFiles">
                              {
                                ele.Files.map((file, index) => {//
                                  var isImage = file.fileType.indexOf("image") > -1;
                                  var conditionalAttributes = {};
                                  if (!isImage) conditionalAttributes = {
                                    href: this.apiBaseUrl + file.filePath,
                                    target: "_blank",
                                    download: true
                                  }
                                  else {
                                    conditionalAttributes = {
                                      onClick: () => this.showLightbox(ele.Files, index)
                                    }
                                  }
                                  return <a {...conditionalAttributes} key={'uploaded' + ele.id + index} style={{ marginRight: '4px' }} >
                                    <img src={this.apiBaseUrl + file.fileThumbnailPath} className="file_img img-thumbnail" />
                                  </a>
                                })
                              }
                            </div>
                            <span>{messageDate}</span>
                          </div>
                        </div>
                      </div>


                    )

                  }, this)}

                  {this.props.onchatstatus == this._messageSendingType.TYPING ? <div className="chat ">
                    <div className="chat-avatar">
                      <a className="avatar" data-toggle="tooltip" data-placement="right" title="" data-original-title="">
                        <img src="../../../app-assets/images/portrait/small/avatar-s-1.png" alt="avatar" />
                      </a>
                    </div>
                    <div className="chat-body">
                      <div className="chat-content">
                        <img src="../../../app-assets/images/msg_loader.gif" style={{ height: 7 + 'px', filter: "brightness(200%)" }} alt="avatar" />
                      </div>
                    </div>
                  </div> : ""}
                  <div style={{ float: "left", clear: "both" }}
                    ref={(el) => { this.messagesEnd = el; }}>
                  </div>
                </div>
              </div>
            </section>
            <section className="chat-app-form">

              <div className="uploadedFiles">
                {
                  this.state.uploadedFiles.map((fileObj, index) => {
                    return (
                      <div key={'uploading' + index}>
                        <i className="fa fa-times" onClick={event => this.removeAttachment(event, index)} />
                        <a href={this.apiBaseUrl + fileObj.filePath} download target="_blank">
                          <img src={this.apiBaseUrl + fileObj.fileThumbnailPath} alt="" className="file_img img-thumbnail" />
                        </a>
                      </div>
                    )
                  })
                }
              </div>

              <Picker
                set='emojione'
                native='true'
                className='emojiContainer noselect'
                emojiTooltip='true'
                perLine="8"
                style={{
                  position: 'absolute',
                  top: '-344px',
                  right: '105px',
                  display: this.state.showEmojiPicker ? '' : 'none'
                }}
                onSelect={(emoji) => {
                  this.refs.iconLeft4.value += emoji.native;
                  $(".iconLeft5").focus();
                }}
                emojisToShowFilter={(emoji) => this.filterEmojis(emoji)}
              />
              <form onSubmit={e => { e.preventDefault(); }} className="chat-app-input d-flex">

                <fieldset className="form-group position-relative has-icon-left col-11 m-0">
                  <div className="form-control-position">
                    <i className="ft-message-square" />
                  </div>

                  <input onKeyDown={this.keyPress}
                    onChange={this.KeyPressEvent}
                    type="text"
                    className="form-control iconLeft5"
                    id="iconLeft4"
                    ref="iconLeft4"
                    placeholder="Type your message"
                    autoComplete="off"
                  />
                  <div className="form-control-position fileSelectBtn hover" style={{display:'none'}}>
                    <i className="fa fa-paperclip"></i>
                    <input id="fileUploadInput" type="file" accept="image/*,audio/*,application/pdf,video/*" multiple onChange={event => this.addAttachment(event)} />
                  </div>
                  <button type="button" className="form-control-position emojiPickerBtn hover" onClick={() => { this.setState({ showEmojiPicker: !this.state.showEmojiPicker }) }}>
                    <i className="fa fa-smile-o"></i>
                  </button>
                </fieldset>
                <fieldset className="form-group position-relative has-icon-left col-1 m-0" style={{padding:'0px'}}>
                  <button type="button" onClick={() => this.newMessageClick(this._messageSendingType.TEXT)} className="btn btn-primary">
                    <i className="fa fa-paper-plane-o d-lg-none" />
                    <span className="d-none d-lg-block">Send</span>
                  </button>
                </fieldset>
              </form>
            </section>
          </div>
        </div>

        {isLightboxOpen && (
          <Lightbox
            mainSrc={this.apiBaseUrl + lightboxAllImages[lightboxImageIndex].filePath}
            nextSrc={this.apiBaseUrl + lightboxAllImages[(lightboxImageIndex + 1) % lightboxAllImages.length].filePath}
            prevSrc={this.apiBaseUrl + lightboxAllImages[(lightboxImageIndex + lightboxAllImages.length - 1) % lightboxAllImages.length].filePath}
            imagePadding={60}
            onCloseRequest={() => this.setState({ isLightboxOpen: false })}
            onMovePrevRequest={() =>
              this.setState({
                lightboxImageIndex: (lightboxImageIndex + lightboxAllImages.length - 1) % lightboxAllImages.length,
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                lightboxImageIndex: (lightboxImageIndex + 1) % lightboxAllImages.length,
              })
            }
          />
        )}

      </div>



    )
  }

  scrollToBottom = () => {
    if (this.messagesEnd != undefined)
      this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  addAttachment(event) {
    var files = event.target.files;
    var that = this;
    if (files && files.length > 0) {
      //$(".imageplacement").html("");
      var fromData = new FormData();
      var fileAllowed = true;
      $.each(files, (index, file) => {
        if (!file) {
          return;
        }
        var allowed = ["jpeg", "png", "gif", "pdf"];

        if (file.type.indexOf('image/') > -1 || file.type.indexOf('audio/') > -1 || file.type.indexOf('video/') > -1 || file.type.match('application/pdf')) {
          fromData.append("FileList", file);
        }
      });
      if (fileAllowed) {
        RequestHelper.SendPostMultipart(this.apiBaseUrl + '/attachment/save', fromData, function (data) {
          if (data.statusCode == 200) {
            var files = that.state.uploadedFiles;
            data.result.forEach((item) => {
              files.push(item);
            });
            !that.isCancelled && that.setState({
              uploadedFiles: files
            });
            // $.each(data.result, function (index, data) {
            //   that._uploadingImages.push(data);
            //   //$(".upload_wrap ul").append('<li><img src="' + apiBaseUrl + data.imageThumbnailPath + '" alt="" width="40" height="40" class="file_img"></li>');
            //   // $(".uploadedFiles").append(`<a href="` + apiBaseUrl + data.filePath + `" download target="_blank">
            //   //   <img src="` + apiBaseUrl + data.fileThumbnailPath + `" alt="" width="40" height="40" class="file_img img-thumbnail" />
            //   // </a>`);
            // });
            //$(".upload_wrap").show();
          }

        });
      }
      else {
        alert("We allowed only jpeg, png, gif ,pdf extensions.");
      }
      $("#fileUploadInput").val('');
    }
  }

  removeAttachment(event, index) {
    this.state.uploadedFiles.splice(index, 1);
    this.setState({
      uploadedFiles: this.state.uploadedFiles
    });
  }
}

export default ChatArea
