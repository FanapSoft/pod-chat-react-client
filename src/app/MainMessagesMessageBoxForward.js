import strings from "../constants/localization";
import React from "react";

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
