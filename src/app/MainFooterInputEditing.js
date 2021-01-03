// src/list/BoxScene.js
import React, {Component} from "react";
import {connect} from "react-redux";

//strings
import strings from "../constants/localization";

//actions
import {messageEditing} from "../actions/messageActions";
import {threadIsSendingMessage} from "../actions/threadActions";

//components
import Paper from "../../../pod-chat-ui-kit/src/paper";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";

//styling
import {MdClose, MdEdit, MdReply} from "react-icons/md";
import {TiArrowForward} from "react-icons/ti";
import style from "../../styles/app/MainFooterInputEditing.scss";
import styleVar from "../../styles/variables.scss";
import utilsStlye from "../../styles/utils/utils.scss";
import {decodeEmoji} from "./_component/EmojiIcons.js";
import {getMessageMetaData} from "../utils/helpers";

const constants = {
  replying: "REPLYING",
  forwarding: "FORWARDING"
};

export function messageEditingCondition(messageEditing) {
  if (messageEditing) {
    if (messageEditing.message) {
      return true;
    }
  }
}

function getImage(metaData) {

  let imageLink = metaData.link;
  let width = metaData.width;
  let height = metaData.height;

  const ratio = height / width;
  const maxWidth = 30;
  if (width <= maxWidth) {
    return {imageLink};
  }
  height = Math.ceil(maxWidth * ratio);
  return `${imageLink}&width=${maxWidth}&height=${height}`;
}

export function getMessageEditingText(message) {
  const editObject = {text: null};
  if (message) {
    if (message instanceof Array) {
      editObject.text = strings.messagesCount(message.length);
    } else {
      if (message.metadata) {
        const file = getMessageMetaData(message).file;
        if (file) {
          const isVideo = file.mimeType.match(/mp4|ogg|3gp|ogv/);
          let width = file.width;
          editObject.text = file.originalName;
          editObject.isVideo = isVideo;
          if (width) {
            editObject.image = getImage(file);
          }
        } else {
          editObject.text = message.message;
        }
      } else {
        editObject.text = message.message;
      }
    }
    return editObject;
  }
}

@connect(store => {
  return {
    messageEditing: store.messageEditing
  };
})
export default class MainFooterInputEditing extends Component {

  constructor(props) {
    super(props);
    this.onCancelEditing = this.onCancelEditing.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {messageEditing, setInputText, dispatch} = this.props;
    if (messageEditing) {
      if (messageEditing.type !== constants.replying) {
        if (prevProps.messageEditing !== messageEditing) {
          if (messageEditing.type !== constants.replying && messageEditing.type !== constants.forwarding) {
            if (!messageEditing.message.draftMode) {
              setInputText(decodeEmoji(messageEditing.message.message));
            }
          } else {
            dispatch(threadIsSendingMessage(true));
          }
        }
      }
    }
  }

  onCancelEditing() {
    const {messageEditing: msgEditing, dispatch} = this.props;
    if (msgEditing.type === constants.forwarding) {
      dispatch(threadIsSendingMessage(false));
    }
    dispatch(messageEditing());
  }

  render() {
    const {messageEditing} = this.props;
    const isEditing = messageEditingCondition(messageEditing);
    let editObject;
    if (isEditing) {
      editObject = getMessageEditingText(messageEditing.message);
      return (

        <Paper colorBackgroundLight style={{borderRadius: "20px 20px 0 0"}}>
          <Container inline className={style.MainFooterInputEditing}>
            <Container>
              {messageEditing.type === constants.forwarding ?
                <TiArrowForward style={{margin: "0 5px"}} size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
                :
                messageEditing.type === constants.replying ?
                  <MdReply style={{margin: "0 5px"}} size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
                  :
                  <MdEdit style={{margin: "0 5px"}} size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
              }
            </Container>

            <Container className={style.MainFooterInputEditing__Content} userSelect="none">
              {editObject.image ?
                <Container className={style.MainFooterInputEditing__ImageContainer} inline>
                  <Container className={style.MainFooterInputEditing__Image}
                             style={{backgroundImage: `url(${editObject.image})`}}/>
                </Container>
                : ""}
              <Container inline>
                <Text size="sm" isHTML>{decodeEmoji(editObject.text)}</Text>
              </Container>
            </Container>

            <Container>
              <MdClose size={styleVar.iconSizeSm} color={styleVar.colorTextLight} style={{margin: "0 4px"}}
                       className={`${utilsStlye["u-clickable"]} ${utilsStlye["u-hoverColorAccent"]}`}
                       onClick={this.onCancelEditing}/>
            </Container>
          </Container>
        </Paper>
      );
    }
    return false;
  }
}