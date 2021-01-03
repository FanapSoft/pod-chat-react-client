// src/list/BoxSceneMessages
import React, {Component} from "react";
import "moment/locale/fa";
import {
  avatarNameGenerator,
  avatarUrlGenerator,
  isGroup,
  isChannel,
  isMessageByMe, showMessageNameOrAvatar
} from "../utils/helpers";

//strings

//actions

//components
import Avatar, {AvatarImage} from "../../../pod-chat-ui-kit/src/avatar";
import Container from "../../../pod-chat-ui-kit/src/container";
import {connect} from "react-redux";
import {threadCreateOnTheFly} from "../actions/threadActions";

//styling
@connect()
export default class extends Component {

  constructor(props) {
    super(props);
  }

  onAvatarClick(participant) {
    this.props.dispatch(threadCreateOnTheFly(participant.coreUserId, participant));
  }


  render() {
    const {message, messages, thread, user} = this.props;
    const showAvatar = showMessageNameOrAvatar(message, messages);
    const enableClickCondition = !isMessageByMe(message, user, thread) && (isGroup(thread) || isChannel(thread));
    const fragment =
      showAvatar ?
        <Avatar onClick={enableClickCondition ? this.onAvatarClick.bind(this, message.participant) : null}
                cursor={enableClickCondition ? "pointer" : null}>
          <AvatarImage src={avatarUrlGenerator(message.participant.image, avatarUrlGenerator.SIZES.SMALL)}
                       text={avatarNameGenerator(message.participant.name).letter}
                       textBg={avatarNameGenerator(message.participant.name).color}/>
        </Avatar>
        :
        <Container style={{width: "50px", display: "inline-block"}}/>;
    return showAvatar ?
      <Container inline inSpace style={{maxWidth: "50px", verticalAlign: "top"}}>
        {fragment}
      </Container>
      :
      fragment;
  }

}