import React from "react";

import {Text} from "../../../pod-chat-ui-kit/src/typography";

import {avatarNameGenerator} from "../utils/helpers";


export default function({message, isFirstMessage, isMessageByMe}) {
  const messageParticipant = message.participant;
  const color = avatarNameGenerator(messageParticipant.name).color;
  return isFirstMessage &&
    <Text size="sm" bold
          style={{color: color}}>{isMessageByMe ? messageParticipant.name : messageParticipant.contactName || messageParticipant.name}</Text>
}