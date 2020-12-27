import React from "react";
import {mobileCheck, decodeEmoji, clearHtml} from "../utils/helpers";
import {emailify, mentionify, urlify} from "./MainMessagesMessage";

import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";


export default function ({message}) {
  return <Container userSelect={mobileCheck() ? "none" : "text"} onDoubleClick={e => e.stopPropagation()}>
    <Text isHTML wordWrap="breakWord" whiteSpace="preWrap" color="text" dark>
      {mentionify(emailify(decodeEmoji(urlify(clearHtml(message)))))}
    </Text>
  </Container>
}