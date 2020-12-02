// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";
import {constants as messageEditingTypes} from "./MainFooterInput";

//strings

//actions
import {
  messageEditing,
  messageFileReply,
  messageSendFile, messageSendFileOnTheFly
} from "../actions/messageActions";


//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {MdAttachFile, MdChevronRight} from "react-icons/md";

//styling
import style from "../../styles/app/MainFooterAttachment.scss";
import styleVar from "../../styles/variables.scss";
import {chatModalPrompt, stopTyping} from "../actions/chatActions";
import MainFooterAttachmentAttach from "./MainFooterAttachmentAttach";

@connect(store => {
  return {
    messageEditing: store.messageEditing,
    threadFilesToUpload: store.threadFilesToUpload,
    threadId: store.thread.thread.id,
    thread: store.thread.thread,
    isSendingText: store.threadIsSendingMessage
  };
})
export default class MainFooterAttachment extends Component {

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {threadFilesToUpload} = this.props;
    if (threadFilesToUpload) {
      if (prevProps.threadFilesToUpload !== threadFilesToUpload) {
        this.sendFiles(threadFilesToUpload);
      }
    }
  }

  sendFiles(filesObject) {
    const {dispatch, messageEditing: msgEditing, thread} = this.props;
    const files = filesObject.files;
    const caption = filesObject.caption;
    let isReply = false;
    if (msgEditing) {
      if (msgEditing.type === messageEditingTypes.replying) {
        isReply = msgEditing.message;
        dispatch(messageEditing());
      }
    }
    for (const file of files) {
      if (isReply) {
        dispatch(messageFileReply(file, thread, isReply.id, caption, isReply));
        continue;
      }
      if (thread.onTheFly) {
        dispatch(messageSendFileOnTheFly(file, caption));
      } else {
        dispatch(messageSendFile(file, thread, caption));
      }
    }
  }

  onClick() {
    const {thread, isSendingText, sendMessage, dispatch} = this.props;
    if (isSendingText) {
      sendMessage();
      dispatch(stopTyping());
    } else {
      dispatch(chatModalPrompt(true,
        null, null, null, null,
        <MainFooterAttachmentAttach dispatch={dispatch} thread={thread}/>));
    }
  }

  render() {
    const {isSendingText} = this.props;
    return (
      <Container className={style.MainFooterAttachment} inline relative onClick={this.onClick.bind(this)}>
        {
          isSendingText ?
            <Container>
              <MdChevronRight size={styleVar.iconSizeMd} color={styleVar.colorAccentDark} style={{margin: "5px 6px"}}/>
            </Container>
            :
            <Container>
              <MdAttachFile size={styleVar.iconSizeMd} color={styleVar.colorAccentDark} style={{margin: "5px 6px"}}/>
            </Container>
        }
      </Container>
    );
  }
}