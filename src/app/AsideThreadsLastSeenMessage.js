import React from "react";
import {isChannel, isGroup, isMessageByMe} from "../utils/helpers";
import AsideThreadsLastSeenMessageText from "./AsideThreadsLastSeenMessageText";
import AsideThreadsLastSeenMessageInfo from "./AsideThreadsLastSeenMessageInfo";

//UI components
import Container from "../../../pod-chat-ui-kit/src/container";

export default function(props) {
  const {thread, user} = props;
  const {lastMessageVO, lastMessage, inviter, time, isTyping, draftMessage} = thread;
  const args = {
    isGroup: isGroup(thread),
    isChannel: isChannel(thread),
    isMessageByMe: isMessageByMe(lastMessageVO, user),
    lastMessageVO,
    lastMessage,
    draftMessage,
    inviter,
    time,
    isTyping
  };
  return (
    <Container>
      <AsideThreadsLastSeenMessageText {...args}/>
      <AsideThreadsLastSeenMessageInfo {...args}/>
    </Container>
  )
}