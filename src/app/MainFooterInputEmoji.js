// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";

//strings

//actions
import {
  threadEmojiShowing
} from "../actions/threadActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";

//styling
import {MdSentimentVerySatisfied, MdClose} from "react-icons/md";
import style from "../../styles/app/MainFooterInputEmoji.scss";
import styleVar from "../../styles/variables.scss";

@connect(store => {
  return {
    emojiShowing: store.threadEmojiShowing,
    threadFilesToUpload: store.threadFilesToUpload,
    threadId: store.thread.thread.id,
    isSendingText: store.threadIsSendingMessage
  };
})
export default class MainFooterAttachment extends Component {

  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const {dispatch, emojiShowing} = this.props;
    const showing = !emojiShowing;
    dispatch(threadEmojiShowing(showing));
  }

  render() {
    const {emojiShowing} = this.props;
    return (
      <Container inline className={style.MainFooterInputEmoji} relative onClick={this.onClick}>
        {emojiShowing ?
          <MdClose size={styleVar.iconSizeMd}
                                    color={styleVar.colorAccentDark}
                                    style={{margin: "3px 4px"}}/>
          :
          <MdSentimentVerySatisfied size={styleVar.iconSizeMd}
                                color={styleVar.colorAccentDark}
                                style={{margin: "3px 4px"}}/>
        }
      </Container>
    );
  }
}