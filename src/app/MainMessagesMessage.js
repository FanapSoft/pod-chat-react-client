// src/MainMessagesMessage
import React, {Component} from "react";
import {connect} from "react-redux";
import "moment/locale/fa";
import {showBlock} from "./MainFooterSpam";
import {MessageDeletePrompt, PinMessagePrompt} from "./_component/prompts";
import checkForPrivilege from "../utils/privilege";
import {
  findLastSeenMessage,
  isGroup,
  isMessageByMe,
  isMessageIsFile,
  isMessageIsNewFile,
  mobileCheck,
  showMessageNameOrAvatar,
  messageDatePetrification
} from "../utils/helpers";

//strings
import {THREAD_LEFT_ASIDE_SEEN_LIST} from "../constants/actionTypes";
import {THREAD_ADMIN} from "../constants/privilege";

//actions
import {
  threadLeftAsideShowing, threadModalListShowing
} from "../actions/threadActions";
import {messageEditing} from "../actions/messageActions";
import {chatModalPrompt} from "../actions/chatActions";

//components
import {ContextTrigger} from "../../../pod-chat-ui-kit/src/menu/Context";
import Container from "../../../pod-chat-ui-kit/src/container";

import MainMessagesMessageFile from "./MainMessagesMessageFile";
import MainMessagesMessageFileFallback from "./MainMessagesMessageFileFallback";
import MainMessagesMessageText from "./MainMessagesMessageText";
import MainMessagesMessageShare from "./MainMessagesMessageShare";

//styling
import style from "../../styles/app/MainMessagesMessage.scss";

@connect(store => {
  return {
    participants: store.threadParticipantList.participants,
    participantsFetching: store.threadParticipantList.fetching,
    threadLeftAsideShowing: store.threadLeftAsideShowing,
    chatFileHashCodeMap: store.chatFileHashCodeUpdate.hashCodeMap
  };
})
export default class MainMessagesMessage extends Component {

  constructor(props) {
    super(props);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMessageControlHide = this.onMessageControlHide.bind(this);
    this.onMessageControlShow = this.onMessageControlShow.bind(this);
    this.onMessageSeenListClick = this.onMessageSeenListClick.bind(this);
    this.onReply = this.onReply.bind(this);
    this.setInstance = this.setInstance.bind(this);
    this.containerRef = React.createRef();
    this.contextTriggerRef = React.createRef();
    this.state = {
      messageControlShow: false,
      messageTriggerShow: false
    };
  }

  onMessageSeenListClick(e) {
    const {message, dispatch} = this.props;
    e.stopPropagation();
    dispatch(threadLeftAsideShowing(true, THREAD_LEFT_ASIDE_SEEN_LIST, message.id));
  }

  onReply() {
    const {dispatch, message} = this.props;
    dispatch(messageEditing(message, "REPLYING"));
  }

  onMouseOver() {
    if (mobileCheck()) {
      return;
    }
    if (this.state.messageTriggerShow) {
      return;
    }
    this.setState({
      messageTriggerShow: true
    });
  }

  onMouseLeave() {
    if (!this.state.messageTriggerShow) {
      return;
    }
    this.setState({
      messageTriggerShow: false
    });
  }

  onMessageControlHide(e) {
    if (!this.state.messageControlShow) {
      return;
    }
    if (e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
    }
    this.setState({
      messageControlShow: false
    });
  }

  onMessageControlShow(e) {
    if (!this.state.messageControlShow) {
      this.setState({
        messageControlShow: true
      });
      return true;
    }
  }

  onThreadTouchStart(message, e) {
    e.stopPropagation();
    const touchPosition = this.touchPosition;
    clearTimeout(this.showMenuTimeOutId);
    this.showMenuTimeOutId = setTimeout(() => {
      clearTimeout(this.showMenuTimeOutId);
      this.showMenuTimeOutId = null;
      if (this.touchPosition === touchPosition) {
        this.contextTriggerRef.current.handleContextClick(e);
      }
    }, 700);
  }

  onThreadTouchMove(message, e) {
    this.touchPosition = `${e.touches[0].pageX}${e.touches[0].pageY}`;
  }

  onThreadTouchEnd(message, e) {
    if (this.showMenuTimeOutId) {
      clearTimeout(this.showMenuTimeOutId);
    } else {
      e.preventDefault();
    }
  }

  setInstance(instance) {
    this.instance = instance
    return this;
  }

  render() {
    const {
      message,
      messages,
      user,
      thread,
      highLightMessage,
      onRepliedMessageClicked,
      participantsFetching,
      participants,
      threadLeftAsideShowing,
      chatFileHashCodeMap
    } = this.props;
    const lastSeenMessageTime = findLastSeenMessage(messages);
    const {messageControlShow, messageTriggerShow} = this.state;
    const isGroupReal = isGroup(thread);
    const isMessageByMeReal = isMessageByMe(message, user, thread);
    const args = {
      onMessageControlShow: this.onMessageControlShow,
      onMessageSeenListClick: this.onMessageSeenListClick,
      onMessageControlHide: this.onMessageControlHide,
      onRepliedMessageClicked: onRepliedMessageClicked,
      setInstance: this.setInstance,
      isFirstMessage: showMessageNameOrAvatar(message, messages),
      datePetrification: messageDatePetrification.bind(null, message.time),
      messageControlShow,
      messageTriggerShow,
      forceSeen: message.time <= lastSeenMessageTime,
      isChannel: thread.group && thread.type === 8,
      isMessageByMe: isMessageByMeReal,
      isParticipantBlocked: showBlock({user, thread, participantsFetching, participants}),
      isOwner: checkForPrivilege(thread, THREAD_ADMIN),
      chatFileHashCodeMap: chatFileHashCodeMap,
      isGroup: isGroupReal,
      user,
      thread,
      message,
      messages,
      highLightMessage
    };

    return (
      <Container id={message.uuid}
                 userSelect="none"
                 inline
                 relative
                 className={style.MainMessagesMessage__Container}
                 style={{
                   maxWidth: mobileCheck() ? "70%" : threadLeftAsideShowing && window.innerWidth < 1100 ? "60%" : "50%",
                   marginRight: isGroup ? null : isMessageByMeReal ? "5px" : null,
                   marginLeft: isGroup ? null : isMessageByMeReal ? null : "5px"
                 }}
                 ref={this.containerRef}
                 onDoubleClick={message.id && this.onReply}
                 onClick={this.onMessageControlShow.bind(this, true)}
                 onTouchStart={this.onThreadTouchStart.bind(this, message)}
                 onTouchMove={this.onThreadTouchMove.bind(this, message)}
                 onTouchEnd={this.onThreadTouchEnd.bind(this, message)}
                 onMouseOver={this.onMouseOver}
                 onMouseLeave={this.onMouseLeave}>

        <ContextTrigger id={message.id ? "messages-context-menu" : Math.random()} holdToDisplay={-1}
                        contextTriggerRef={this.contextTriggerRef} collect={() => this}>
          {isMessageIsFile(message) ?
            isMessageIsNewFile(message) || !message.id ?
              <MainMessagesMessageFile {...args}/>
              :
              <MainMessagesMessageFileFallback {...args}/>
            :
            <MainMessagesMessageText {...args}/>
          }
        </ContextTrigger>
      </Container>
    )
  }
}