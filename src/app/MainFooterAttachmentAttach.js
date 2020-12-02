// src/list/MainFooterAttachmentAttach.jss
import React, {Component} from "react";
import {connect} from "react-redux";

//strings

//actions
import {threadFilesToUpload} from "../actions/threadActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {MdMap, MdInsertDriveFile, MdClose} from "react-icons/md";

//styling
import style from "../../styles/app/MainFooterAttachmentAttach.scss";
import {chatModalPrompt, stopTyping} from "../actions/chatActions";
import strings from "../constants/localization";
import MainFooterAttachmentAttachMap from "./MainFooterAttachmentAttachMap";
import styleVar from "../../styles/variables.scss";

@connect()
export default class MainFooterAttachmentAttach extends Component {

  constructor(props) {
    super(props);
    this.onAttachmentChange = this.onAttachmentChange.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.fileInput = React.createRef();
  }

  onAttachmentChange(evt) {
    const {dispatch} = this.props;
    dispatch(chatModalPrompt());
    dispatch(threadFilesToUpload(evt.target.files, false, this.fileInput.current));
  }

  onMapClick() {
    const {thread, dispatch} = this.props;
    dispatch(chatModalPrompt());
    dispatch(chatModalPrompt(true,
      null, null, null, null,
      <MainFooterAttachmentAttachMap dispatch={dispatch} thread={thread}/>));
  }

  onCancel() {
    const {dispatch} = this.props;
    dispatch(chatModalPrompt());
  }

  onAttachmentClick(evt) {
    evt.target.value = null
  }

  onClick() {
    const {isSendingText, sendMessage, dispatch} = this.props;
    if (isSendingText) {
      sendMessage();
      dispatch(stopTyping());
    }
  }

  render() {
    return (
      <Container className={style.MainFooterAttachmentAttach} inline relative onClick={this.onClick.bind(this)}>
        <List>

          <ListItem key="send-file"
                    selection={true}
                    invert={true}>
            <Container display="flex">
              <MdInsertDriveFile size={styleVar.iconSizeMd} color={styleVar.colorAccent} style={{margin: "2px 0 0 6px"}}/>
              <Text bold color="accent">
                {strings.sendFile}
                <input className={style.MainFooterAttachmentAttach__Input} type="file" onChange={this.onAttachmentChange}
                       onClick={this.onAttachmentClick}
                       multiple ref={this.fileInput}/>
              </Text>
            </Container>


          </ListItem>

          <ListItem key="send-location"
                    color="accent"
                    selection={true}
                    invert={true}
                    onSelect={this.onMapClick}>
            <Container display="flex">
              <MdMap size={styleVar.iconSizeMd} color={styleVar.colorAccent} style={{margin: "2px 0 0 6px"}}/>
              <Text bold color="accent">{strings.sendLocation}</Text>
            </Container>

          </ListItem>

          <ListItem key="cancel"
                    color="accent"
                    selection={true}
                    invert={true}
                    onSelect={this.onCancel}>
            <Container display="flex">
              <MdClose size={styleVar.iconSizeMd} color={styleVar.colorAccent} style={{margin: "2px 0 0 6px"}}/>
              <Text bold color="accent">{strings.cancel}</Text>
            </Container>

          </ListItem>
        </List>

      </Container>
    );
  }
}