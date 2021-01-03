import strings from "../../constants/localization";
import React from "react";

import Container from "../../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../../pod-chat-ui-kit/src/typography";
import Loading from "../../../../pod-chat-ui-kit/src/loading";
import LoadingBlinkDots from "../../../../pod-chat-ui-kit/src/loading/LoadingBlinkDots";

export default function({isGroup, typing, textProps}) {
  return (
    <Container style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
      <Text inline bold {...textProps}>{strings.typing(isGroup ? typing.user.user : null)}</Text>
      <Loading><LoadingBlinkDots size="sm" invert/></Loading>
    </Container>
  )
}