// src/list/BoxSceneMessagesText
import React, {Component} from "react";
import "moment/locale/fa";
import {connect} from "react-redux";
import {mobileCheck, decodeEmoji, clearHtml, emailify, mentionify, urlify} from "../utils/helpers";
import copyToClipBoard from "copy-to-clipboard";

//strings
import strings from "../constants/localization";

//actions
import {messageCancel, messageEditing, messageSend} from "../actions/messageActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {ContextItem} from "../../../pod-chat-ui-kit/src/menu/Context";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {MdEdit, MdContentCopy} from "react-icons/md";
import MainMessagesMessageBox from "./MainMessagesMessageBox";
import MainMessagesMessageBoxHighLighter from "./MainMessagesMessageBoxHighLighter";
import MainMessagesMessageBoxControl from "./MainMessagesMessageBoxControl";
import MainMessagesMessageBoxSeen from "./MainMessagesMessageBoxSeen";
import MainMessagesMessageBoxEdit from "./MainMessagesMessageBoxEdit";
import MainMessagesMessageBoxFooter from "./MainMessagesMessageBoxFooter";

//styling
import style from "../../styles/app/MainMessagesText.scss";
import styleVar from "../../styles/variables.scss";


@connect()
export default class MainMessagesMessageText extends Component {

  constructor(props) {
    super(props);
    window.onUserNameClick = this.onUserNameClick = this.onUserNameClick.bind(this);
  }

  onRetry(message) {
    const {dispatch} = this.props;
    dispatch(messageCancel(message.uniqueId));
    dispatch(messageSend(message.message, message.threadId));
  }

  onCancel(message) {
    this.props.dispatch(messageCancel(message.uniqueId));
  }

  onEdit(message) {
    const {onMessageControlHide, dispatch} = this.props;
    this.props.dispatch(messageEditing(message));
    onMessageControlHide();
  }

  onCopy(message) {
    copyToClipBoard(message.message)
  }

  onUserNameClick(e) {
  }

  render() {
    const {
      onDelete,
      onForward,
      onReply, isMessageByMe,
      isFirstMessage,
      thread,
      messageControlShow,
      messageTriggerShow,
      message,
      highLightMessage,
      onMessageControlShow,
      onRepliedMessageClicked,
      onMessageSeenListClick,
      onMessageControlHide,
      onPin,
      onShare,
      isParticipantBlocked,
      contextRef,
      forceSeen,
      isChannel,
      isOwner,
      isGroup
    } = this.props;
    return (
      <Container className={style.MainMessagesText}>
        <MainMessagesMessageBox message={message} onRepliedMessageClicked={onRepliedMessageClicked}
                       isChannel={isChannel} isGroup={isGroup}
                       isFirstMessage={isFirstMessage} isMessageByMe={isMessageByMe}>
          <MainMessagesMessageBoxHighLighter message={message} highLightMessage={highLightMessage}/>
          <MainMessagesMessageBoxControl isMessageByMe={isMessageByMe}
                           isOwner={isOwner}
                           contextRef={contextRef}
                           onPin={onPin}
                           isParticipantBlocked={isParticipantBlocked}
                           messageControlShow={messageControlShow}
                           isChannel={isChannel}
                           isGroup={isGroup}
                           message={message}
                           onMessageSeenListClick={onMessageSeenListClick}
                           onMessageControlHide={onMessageControlHide}
                           onShare={onShare}
                           onDelete={onDelete} onForward={onForward} onReply={onReply}
                           isText={true}>
            {
              message.editable &&
              <ContextItem onClick={this.onEdit.bind(this, message)}>
                {mobileCheck() ? <MdEdit size={styleVar.iconSizeMd} color={styleVar.colorAccent}/> : strings.edit}
              </ContextItem>
            }
            {
              <ContextItem onClick={this.onCopy.bind(this, message)}>
                {mobileCheck() ?
                  <MdContentCopy size={styleVar.iconSizeMd} color={styleVar.colorAccent}/> : strings.copyText}
              </ContextItem>
            }

          </MainMessagesMessageBoxControl>
          <Container userSelect={mobileCheck() ? "none" : "text"} onDoubleClick={e=>e.stopPropagation()}>
            <Text isHTML wordWrap="breakWord" whiteSpace="preWrap" color="text" dark>
              {mentionify(emailify(decodeEmoji(urlify(clearHtml(message.message))), this.onUserNameClick))}
            </Text>
          </Container>
          <MainMessagesMessageBoxFooter message={message}
                               onMessageControlShow={onMessageControlShow}
                               onMessageControlHide={onMessageControlHide}
                               isMessageByMe={isMessageByMe}
                               messageControlShow={messageControlShow} messageTriggerShow={messageTriggerShow}>
            <MainMessagesMessageBoxSeen isMessageByMe={isMessageByMe} message={message} thread={thread} forceSeen={forceSeen}
                          onMessageSeenListClick={onMessageSeenListClick} onRetry={this.onRetry.bind(this, message)}
                          onCancel={this.onCancel.bind(this, message)}/>
            <MainMessagesMessageBoxEdit message={message}/>
          </MainMessagesMessageBoxFooter>
        </MainMessagesMessageBox>
      </Container>
    );
  }
}