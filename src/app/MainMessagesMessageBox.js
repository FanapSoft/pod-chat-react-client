import React from "react";

import Paper from "../../../pod-chat-ui-kit/src/paper";

import MainMessagesMessageBoxPersonName from "./MainMessagesMessageBoxPersonName";
import MainMessagesMessageBoxReply from "./MainMessagesMessageBoxReply";
import MainMessagesMessageBoxForward from "./MainMessagesMessageBoxForward";

export default function ({scope, message, onRepliedMessageClicked, isFirstMessage, isMessageByMe, isGroup, maxReplyFragmentWidth, children}) {

  const style = {
    borderRadius: "5px"
  };
  if (isMessageByMe) {
    style.backgroundColor = "#effdde";
  }
  return (
    <Paper style={style} hasShadow colorBackgroundLight={!isMessageByMe} relative>
      {
        isGroup &&
        <MainMessagesMessageBoxPersonName message={message}
                                               isFirstMessage={isFirstMessage}
                                               isMessageByMe={isMessageByMe}/>
      }
      <MainMessagesMessageBoxReply isMessageByMe={isMessageByMe}
                                        message={message}
                                        onRepliedMessageClicked={onRepliedMessageClicked}
                                        maxReplyFragmentWidth={maxReplyFragmentWidth}

                                        scope={scope}/>
      <MainMessagesMessageBoxForward message={message} isMessageByMe={isMessageByMe}/>
      {children}
    </Paper>
  )
}