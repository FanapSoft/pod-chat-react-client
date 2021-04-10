import React from "react";
import classnames from "classnames";
import {messageDatePetrification, mobileCheck} from "../utils/helpers";

import {ContextTrigger} from "../../../pod-chat-ui-kit/src/menu/Context";
import {PaperFooter} from "../../../pod-chat-ui-kit/src/paper";
import Container from "../../../pod-chat-ui-kit/src/container";
import {
  MdExpandLess
} from "react-icons/md";

import styleVar from "../../styles/variables.scss";
import style from "../../styles/app/MainMessagesMessageBoxFooter.scss";


export default function ({message, messageTriggerShow, isMessageByMe, mainMessagesMessageRef, children}) {
  const classNames = classnames({
    [style.MainMessagesMessageBoxFooter__OpenTriggerIconContainer]: true,
    [style["MainMessagesMessageBoxFooter__OpenTriggerIconContainer--show"]]: message.id && messageTriggerShow,
  });
  const inlineStyle = {};
  if (isMessageByMe) {
    inlineStyle.color = "#8e9881"
  }
  return (
    <PaperFooter style={inlineStyle}>
      {children}
      {messageDatePetrification(message.time)}
      <Container bottomLeft className={classNames}>
        <ContextTrigger id={"messages-context-menu"} holdToDisplay={mobileCheck() ? 1000 : -1} mouseButton={0}
                        collect={() => mainMessagesMessageRef}>

          <MdExpandLess size={styleVar.iconSizeMd}
                        style={{marginLeft: "10px"}}
                        id={message.id}
                        className={style.MainMessagesMessageBoxFooter__TriggerIcon}/>

        </ContextTrigger>
      </Container>
    </PaperFooter>
  );
}