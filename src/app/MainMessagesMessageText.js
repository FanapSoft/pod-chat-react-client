// src/list/BoxSceneMessagesText
import React, {Component, Fragment} from "react";
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
    this.mainMessagesMessageRef = props.setInstance(this);
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

  createContextMenuChildren() {
    const {message} = this.props;
    return (
      <Fragment>
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
      </Fragment>
    )
  }

  render() {
    const {
      isMessageByMe,
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
      forceSeen,
      isChannel,
      isGroup,
      ref
    } = this.props;
    return (
      <Container className={style.MainMessagesText} ref={ref}>
        <MainMessagesMessageBox message={message} onRepliedMessageClicked={onRepliedMessageClicked}
                                isChannel={isChannel} isGroup={isGroup}
                                isFirstMessage={isFirstMessage} isMessageByMe={isMessageByMe}>
          <MainMessagesMessageBoxHighLighter message={message} highLightMessage={highLightMessage}/>
          <Container userSelect={mobileCheck() ? "none" : "text"} onDoubleClick={e => e.stopPropagation()}>
            <Text isHTML wordWrap="breakWord" whiteSpace="preWrap" color="text" dark>
              {mentionify(emailify(decodeEmoji(urlify(clearHtml(message.message))), this.onUserNameClick))}
            </Text>
          </Container>
          <MainMessagesMessageBoxFooter message={message}
                                        mainMessagesMessageRef={this.mainMessagesMessageRef}
                                        onMessageControlShow={onMessageControlShow}
                                        onMessageControlHide={onMessageControlHide}
                                        isMessageByMe={isMessageByMe}
                                        messageControlShow={messageControlShow} messageTriggerShow={messageTriggerShow}>
            <MainMessagesMessageBoxSeen isMessageByMe={isMessageByMe} message={message} thread={thread}
                                        forceSeen={forceSeen}
                                        onMessageSeenListClick={onMessageSeenListClick}
                                        onRetry={this.onRetry.bind(this, message)}
                                        onCancel={this.onCancel.bind(this, message)}/>
            <MainMessagesMessageBoxEdit message={message}/>
          </MainMessagesMessageBoxFooter>
        </MainMessagesMessageBox>
      </Container>
    );
  }
}