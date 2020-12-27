import React from "react";
import {prettifyMessageDate} from "../utils/helpers";

import Container from "../../../pod-chat-ui-kit/src/container";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {
  MdDoneAll,
  MdDone
} from "react-icons/md";

import styleVar from "../../styles/variables.scss";

export default function (props) {
  const {isGroup, isChannel, time, lastMessageVO, draftMessage, isMessageByMe} = props;
  return <Container>
    <Container topLeft>
      {
        lastMessageVO && !isGroup && !isChannel && isMessageByMe &&
        <Container inline>
          {draftMessage ? "" : (
            lastMessageVO.seen ?
              <MdDoneAll size={styleVar.iconSizeSm} color={styleVar.colorAccent}/> :
              <MdDone size={styleVar.iconSizeSm} color={styleVar.colorAccent}/>
          )}
          <Gap x={3}/>
        </Container>
      }
      <Container inline>
        <Text size="xs"
              color="gray">{prettifyMessageDate(time || lastMessageVO.time)}</Text>
      </Container>

    </Container>

  </Container>
}