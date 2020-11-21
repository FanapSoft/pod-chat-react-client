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
import {threadFilesToUpload} from "../actions/threadActions";


//components
import Container from "../../../uikit/src/container";
import {MdAttachFile, MdChevronRight} from "react-icons/md";

//styling
import style from "../../styles/app/MainFooterAttachment.scss";
import styleVar from "../../styles/variables.scss";
import {chatModalPrompt, stopTyping} from "../actions/chatActions";
import {MessageDeletePrompt} from "./_component/prompts";
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
    this.onAttachmentChange = this.onAttachmentChange.bind(this);
    this.onAttachmentClick = this.onAttachmentClick.bind(this);
    this.onClick = this.onClick.bind(this);
    this.fileInput = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const {threadFilesToUpload} = this.props;
    if (threadFilesToUpload) {
      if (prevProps.threadFilesToUpload !== threadFilesToUpload) {
        this.sendFiles(threadFilesToUpload);
      }
    }
  }

  onAttachmentChange(evt) {
    this.props.dispatch(threadFilesToUpload(evt.target.files, false, this.fileInput.current));
  }

  onAttachmentClick(evt) {
    evt.target.value = null
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
    const {isSendingText, sendMessage, dispatch} = this.props;
    if (isSendingText) {
      sendMessage();
      dispatch(stopTyping());
    } else {
      dispatch(chatModalPrompt(true,
        null, null, null, null,
        <MainFooterAttachmentAttach dispatch={dispatch}/>));
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