// src/list/MainFooterAttachmentAttach.jss
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
import List, {ListItem} from "../../../uikit/src/list";
import {Text} from "../../../uikit/src/typography";

//styling
import style from "../../styles/app/MainFooterAttachmentAttach.scss";
import styleVar from "../../styles/variables.scss";
import {chatModalPrompt, stopTyping} from "../actions/chatActions";
import strings from "../constants/localization";

@connect()
export default class MainFooterAttachmentAttach extends Component {

  constructor(props) {
    super(props);
    this.onAttachmentChange = this.onAttachmentChange.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
  }

  onAttachmentChange(evt) {
    this.props.dispatch(threadFilesToUpload(evt.target.files, false, this.fileInput.current));
  }

  onMapClick() {

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
                    onSelect={false}>
            <Text bold color="accent">
              {strings.forMeOnly}
{/*              <input className={style.MainFooterAttachmentAttach__Button} type="file" onChange={this.onAttachmentChange}
                     onClick={this.onAttachmentClick}
                     multiple ref={this.fileInput}/>*/}
            </Text>

          </ListItem>


          <ListItem key="for-others-also"
                    color="accent"
                    selection={true}
                    invert={true}
                    onSelect={false}>
            <Text bold color="accent">{strings.forMeAndOthers}</Text>

          </ListItem>
        </List>

      </Container>
    );
  }
}