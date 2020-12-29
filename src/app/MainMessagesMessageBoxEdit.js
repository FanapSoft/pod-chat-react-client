import React from "react";

import strings from "../constants/localization";

import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";

export default function ({message}) {
  if (!message.edited) {
    return null;
  }
  return (
    <Gap x={2}>
      <Text italic size="xs" inline>{strings.edited}</Text>
    </Gap>
  )
}
