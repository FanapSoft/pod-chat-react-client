import React, {Fragment} from "react";
import {
  decodeEmoji,
  clearHtml,
  isMessageIsFile
} from "../utils/helpers";
import strings from "../constants/localization";
import Typing from "./_component/Typing";
import {sanitizeRule} from "./AsideThreads";

//UI components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";

export default function (props) {
  const {isGroup, isChannel, lastMessageVO, lastMessage, draftMessage, inviter, isTyping} = props;
  const isFileReal = isMessageIsFile(lastMessageVO);
  const hasLastMessage = lastMessage || lastMessageVO;
  const isTypingReal = isTyping && isTyping.isTyping;
  const isTypingUserName = isTyping && isTyping.user.user;

  return (
    <Container> {
      isTypingReal ?
        <Typing isGroup={isGroup || isChannel} typing={isTyping}
                        textProps={{size: "sm", color: "yellow", dark: true}}/>
        :
        draftMessage ?
          <Fragment>
            <Text size="sm" inline color="red" light>{strings.draft}:</Text>
            <Text size="sm"
                  inline
                  color="gray"
                  dark
                  isHTML>{clearHtml(draftMessage, true)}</Text></Fragment>
          :
          (
            isGroup && !isChannel ?
              hasLastMessage ?
                <Container display="inline-flex">

                  <Container>
                    <Text size="sm" inline
                          color="accent">{isTypingReal ? isTypingUserName : draftMessage ? "Draft:" : lastMessageVO.participant && (lastMessageVO.participant.contactName || lastMessageVO.participant.name)}:</Text>
                  </Container>

                  <Container>
                    {isFileReal ?
                      <Text size="sm" inline color="gray" dark>{strings.sentAFile}</Text>
                      :
                      <Text isHTML size="sm" inline color="gray"
                            sanitizeRule={sanitizeRule}
                            dark>{decodeEmoji(lastMessage, 30)}</Text>
                    }
                  </Container>

                </Container>
                :
                <Text size="sm" inline
                      color="accent">{decodeEmoji(strings.createdAThread(inviter && (inviter.contactName || inviter.name), isGroup, isChannel), 30)}</Text>
              :
              hasLastMessage ? isFileReal ?
                <Text size="sm" inline color="gray" dark>{strings.sentAFile}</Text>
                :
                <Text isHTML size="sm" inline color="gray"
                      sanitizeRule={sanitizeRule}
                      dark>{decodeEmoji(lastMessage, 30)}</Text>
                :
                <Text size="sm" inline
                      color="accent">{decodeEmoji(strings.createdAThread(inviter && (inviter.contactName || inviter.name), isGroup, isChannel), 30)}</Text>
          )
    }
    </Container>
  )
}