import React from "react";

import strings from "../constants/localization";

import Paper from "../../../pod-chat-ui-kit/src/paper";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";

export default function({message, isMessageByMe}) {
  const forwardInfo = message.forwardInfo;
  if (forwardInfo) {
    const participant = forwardInfo.participant;
    const inlineStyle = {
      borderRadius: "5px"
    };
    if (isMessageByMe) {
      inlineStyle.backgroundColor = "#dee8d2";
    }
    const name = !participant ? forwardInfo.conversation.title : participant && (participant.contactName || participant.name);
    return (
      <Container onDoubleClick={e => e.stopPropagation()}>
        <Paper colorBackground style={inlineStyle}>
          <Text italic size="xs">{strings.forwardFrom}</Text>
          <Text bold>{name}:</Text>
        </Paper>
        <Gap block y={5}/>
      </Container>
    )
  }
  return null;
}
