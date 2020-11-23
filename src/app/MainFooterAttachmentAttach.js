// src/list/MainFooterAttachmentAttach.jss
import React, {Component} from "react";
import {connect} from "react-redux";

//strings

//actions
import {threadFilesToUpload} from "../actions/threadActions";

//components
import Container from "../../../uikit/src/container";
import List, {ListItem} from "../../../uikit/src/list";
import {Text} from "../../../uikit/src/typography";

//styling
import style from "../../styles/app/MainFooterAttachmentAttach.scss";
import {chatModalPrompt, stopTyping} from "../actions/chatActions";
import strings from "../constants/localization";
import MainFooterAttachmentAttachMap from "./MainFooterAttachmentAttachMap";

@connect()
export default class MainFooterAttachmentAttach extends Component {

  constructor(props) {
    super(props);
    this.onAttachmentChange = this.onAttachmentChange.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
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

          <ListItem key="for-me"
                    selection={true}
                    invert={true}
                    onSelect={e => dispatch(chatModalPrompt())}>
            <Text bold color="accent">
              {strings.sendFile}
              <input className={style.MainFooterAttachmentAttach__Input} type="file" onChange={this.onAttachmentChange}
                     onClick={this.onAttachmentClick}
                     multiple ref={this.fileInput}/>
            </Text>

          </ListItem>

          <ListItem key="for-others-also"
                    color="accent"
                    selection={true}
                    invert={true}
                    onSelect={this.onMapClick}>
            <Text bold color="accent">{strings.sendLocation}</Text>

          </ListItem>
        </List>

      </Container>
    );
  }
}