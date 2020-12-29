import React, {Fragment} from "react";
import {mobileCheck} from "../utils/helpers";

import Context, {ContextItem} from "../../../pod-chat-ui-kit/src/menu/Context";
import Container from "../../../pod-chat-ui-kit/src/container";
import {
  MdShare,
  MdReply,
  MdArrowBack,
  MdDelete,
  MdInfoOutline
} from "react-icons/md";
import {
  TiArrowForward
} from "react-icons/ti";
import {
  AiFillPushpin
} from "react-icons/ai";

import style from "../../styles/app/MainMessagesMessageBoxControl.scss";
import styleVar from "../../styles/variables.scss";

import strings from "../constants/localization";

export default function({isMessageByMe, isParticipantBlocked, message, onDelete, onForward, onReply, onShare, onMessageSeenListClick, children, isChannel, isGroup, onPin, isOwner}) {
  const isMobile = mobileCheck();
  const deleteCondition = (!isChannel || (isChannel && isMessageByMe));
  const replyCondition = ((!isChannel && !isParticipantBlocked) || (isChannel && isMessageByMe));
  const pinToTopCondition = isOwner && (isGroup || isChannel);
  const messageInfoCondition = isMessageByMe && (isGroup || isChannel);
  const MobileContextMenu = () => {
    return <Fragment>
      <Container className={style.MainMessagesMessageBoxControl__MenuActionContainer}>
        {
          deleteCondition &&
          <ContextItem onClick={onDelete}>
            <MdDelete size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
          </ContextItem>
        }

        <ContextItem onClick={onForward}>
          <TiArrowForward size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
        </ContextItem>

        {
          replyCondition &&
          <ContextItem onClick={onReply}>
            <MdReply size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
          </ContextItem>
        }

        {
          pinToTopCondition &&
          <ContextItem onClick={onPin}>
            <AiFillPushpin size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
          </ContextItem>
        }

        {
          messageInfoCondition &&
          <ContextItem onClick={onMessageSeenListClick}>
            <MdInfoOutline size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
          </ContextItem>
        }

        {
          children
        }

        {
          <ContextItem onClick={onShare}>
            <MdShare size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
          </ContextItem>
        }
      </Container>

      <ContextItem className={style.MainMessagesMessageBoxControl__MobileMenuBack}>
        <MdArrowBack size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
      </ContextItem>
    </Fragment>
  };
  return <Context id={message.id} preventHideOnScroll={false} rtl stickyHeader={mobileCheck()}
                  style={mobileCheck() ? {height: "59px"} : null}>
    {isMobile ? <MobileContextMenu/> :
      <Fragment>
        {
          deleteCondition &&
          <ContextItem onClick={onDelete}>
            {strings.remove}
          </ContextItem>
        }

        <ContextItem onClick={onForward}>
          {strings.forward}
        </ContextItem>

        {
          replyCondition &&
          <ContextItem onClick={onReply}>
            {strings.reply}
          </ContextItem>
        }

        {
          pinToTopCondition &&
          <ContextItem onClick={onPin}>
            {strings.pinToTop}
          </ContextItem>
        }

        {
          messageInfoCondition &&
          <ContextItem onClick={onMessageSeenListClick}>
            {strings.messageInfo}
          </ContextItem>
        }

        {
          children
        }

        {
          <ContextItem onClick={onShare}>
            {strings.share}
          </ContextItem>
        }
      </Fragment>
    }
  </Context>
}