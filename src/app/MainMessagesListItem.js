// src/list/BoxSceneMessages
import React from "react";
import classnames from "classnames";
import "moment/locale/fa";
import {
  isGroup,
  isMessageByMe,
  messageSelectedCondition
} from "../utils/helpers";

//strings

//actions

//components
import {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Container from "../../../pod-chat-ui-kit/src/container";
import MainMessagesMessage from "./MainMessagesMessage";
import MainMessagesUnreadBar from "./MainMessagesUnreadBar";
import MainMessagesAvatar from "./MainMessagesAvatar";
import MainMessagesTick from "./MainMessagesTick";

//styling
import {
  MdExpandMore,
} from "react-icons/md";
import style from "../../styles/app/MainMessagesListItem.scss";


export default function MainMessagesListItem({threadSelectMessageShowing, threadCheckedMessageList, message, messages, user, thread, highLightMessage, onRepliedMessageClicked, unreadBar}) {
  const MainMessagesMessageContainerClassNames = message => classnames({
    [style.MainMessagesListItem__MessageContainer]: true,
    [style["MainMessagesListItem__MessageContainer--left"]]: !isMessageByMe(message, user, thread)
  });
  return <ListItem key={message.time}
                   active={threadSelectMessageShowing && messageSelectedCondition(message, threadCheckedMessageList)}
                   activeColor="gray"
                   noPadding>
    <Container className={MainMessagesMessageContainerClassNames(message)}
               id={`message-${message.time}`}
               relative>
      {
        (isGroup(thread) && !isMessageByMe(message, user, thread)) &&
        <MainMessagesAvatar message={message}
                            messages={messages}
                            thread={thread}
                            user={user}/>
      }

      <MainMessagesMessage thread={thread}
                           messages={messages}
                           user={user}
                           highLightMessage={highLightMessage}
                           onRepliedMessageClicked={onRepliedMessageClicked}
                           message={message}/>

      {
        threadSelectMessageShowing &&
        <MainMessagesTick message={message} threadCheckedMessageList={threadCheckedMessageList}/>
      }

    </Container>
    {
      unreadBar === message.time && <MainMessagesUnreadBar thread={thread}/>
    }
  </ListItem>
}