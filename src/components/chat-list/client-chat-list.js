import React, { Component } from 'react'
export default class ClientChatList extends Component {
  constructor() {
    super()
    this.state = { selectedClientChatIndex: 0 }
  }

  handleSelectedClientChat = (clickedIndex, chats) => () => {
    // console.log('yes its click ' + clickedIndex)
    this.setState({ selectedClientChatIndex: clickedIndex }, () => {
      console.log(this.state)
    })
    console.log(chats)
    this.props.onSelectChat(chats)
  }

  render() {
    // console.log(this.props)
    let allChats = this.props.allChats
    let chatList = allChats.map((ele, index) => {
      return (
        <a
          className={
            index === this.state.selectedClientChatIndex
              ? 'media bg-blue-grey bg-lighten-5 border-right-primary border-right-2'
              : 'media border-0'
          }
          key={index}
          onClick={this.handleSelectedClientChat(index, ele)}
        >
          <div className="media-left pr-1">
            <span className="avatar avatar-md avatar-online">
              <img
                className="media-object rounded-circle"
                src="../../../app-assets/images/portrait/small/avatar-s-3.png"
                alt="Generic placeholder"
              />
              <i />
            </span>
          </div>
          <div className="media-body w-100">
            <h6 className="list-group-item-heading">
              {/* Elizabeth Elliott */}
              {ele.ClientName}
              <span className="font-small-3 float-right primary">
                {/* 4:14 AM */}
                {ele.LastDateTime}
              </span>
            </h6>
            <p className="list-group-item-text text-muted mb-0">
              <i className="ft-check primary font-small-2" />
              {/* Okay */}
              {ele.Chats[ele.Chats.length - 1].Chat.Msg.length > 20
                ? ele.Chats[ele.Chats.length - 1].Chat.Msg.substring(0, 22) +
                  '...'
                : ele.Chats[ele.Chats.length - 1].Chat.Msg}
              <span className="float-right primary">
                <span className="badge badge-pill badge-primary">
                  {ele.Chats.length}
                </span>
              </span>
            </p>
          </div>
        </a>
      )
    })
    return chatList
  }
}
