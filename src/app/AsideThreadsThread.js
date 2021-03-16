import React, {Fragment, useState} from "react";
import {avatarNameGenerator, avatarUrlGenerator, getMessageMetaData} from "../utils/helpers";
import AsideThreadsLastSeenMessage from "./AsideThreadsLastSeenMessage";

import Avatar, {AvatarImage, AvatarName, AvatarText} from "../../../pod-chat-ui-kit/src/avatar";
import {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";
import Container from "../../../pod-chat-ui-kit/src/container";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {ContextTrigger} from "../../../pod-chat-ui-kit/src/menu/Context";
import {
  MdGroup,
  MdRecordVoiceOver,
  MdNotificationsOff,
  MdCheck
} from "react-icons/md";
import {
  AiFillPushpin
} from "react-icons/ai";

import style from "../../styles/app/AsideThreadsThread.scss";
import styleVar from "../../styles/variables.scss";


function AsideThreadsThread({
                              isMenuShow,
                              activeThread,
                              user,
                              thread,
                              onThreadClick,
                              $this
                            }) {
  const {MEDIUM} = avatarUrlGenerator.SIZES;
  let [avatar, setAvatar] = useState(null);
  let touchPosition, showMenuTimeOutId, trigger;
  const onThreadTouchStart = (thread, e) => {
    e.stopPropagation();
    const nowTouchPosition = touchPosition;
    clearTimeout(showMenuTimeOutId);
    showMenuTimeOutId = setTimeout(() => {
      clearTimeout(showMenuTimeOutId);
      showMenuTimeOutId = null;
      if (nowTouchPosition === touchPosition) {
        trigger.handleContextClick(e);
      }
    }, 700);
  };

  const onThreadTouchEnd = (thread, e) => {
    if (showMenuTimeOutId) {
      clearTimeout(showMenuTimeOutId);
    } else {
      e.preventDefault();
    }
  };

  const onThreadTouchMove = (thread, e) => {
    touchPosition = `${e.touches[0].pageX}${e.touches[0].pageY}`;
  };
  return <Fragment>
    <ContextTrigger id="aside-threads-context-menu" holdToDisplay={-1}
                    collect={() => thread}
                    contextTriggerRef={e => trigger = e}>
      <Container relative userSelect="none">
        {thread.pin && <Container className={style.AsideThreadsThread__PinOverlay}/>}
        <ListItem key={thread.id} onSelect={onThreadClick.bind(null, thread)} selection
                  active={activeThread === thread.id}>

          <Container relative
                     onTouchStart={onThreadTouchStart.bind(null, thread)}
                     onTouchMove={onThreadTouchMove.bind(null, thread)}
                     onTouchEnd={onThreadTouchEnd.bind(null, thread)}>
            <Avatar cssClassNames={style.AsideThreadsThread__AvatarContainer}>
              <AvatarImage
                src={avatarUrlGenerator.apply($this, [thread.image, MEDIUM, getMessageMetaData(thread), setAvatar])}
                customSize="55px"
                text={avatarNameGenerator(thread.title).letter}
                textBg={avatarNameGenerator(thread.title).color}/>
              <Container className={style.AsideThreadsThread__ThreadCheck} bottomRight
                         style={{zIndex: 1, opacity: +isMenuShow === thread.id ? 1 : 0}}>
                <Shape color="accent">
                  <ShapeCircle>
                    <MdCheck size={styleVar.iconSizeSm} color={styleVar.colorWhite}
                             style={{marginTop: "3px"}}/>
                  </ShapeCircle>
                </Shape>
              </Container>
              <AvatarName invert>
                {thread.group &&
                <Container inline>
                  {thread.type === 8 ?
                    <MdRecordVoiceOver size={styleVar.iconSizeSm}
                                       color={styleVar.colorGray}/>
                    :
                    <MdGroup size={styleVar.iconSizeSm} color={styleVar.colorGray}/>
                  }
                  <Gap x={2}/>
                </Container>
                }
                {thread.title}
                <AvatarText>
                  <AsideThreadsLastSeenMessage thread={thread} user={user}/>
                </AvatarText>
              </AvatarName>
            </Avatar>
            {thread.unreadCount || thread.pin || thread.mute ?
              <Container absolute centerLeft>
                <Gap y={10} block/>
                {thread.mentioned ?
                  <Fragment>
                    <Shape color="accent">
                      <ShapeCircle>@</ShapeCircle>
                    </Shape>
                    <Gap x={1}/>
                  </Fragment> :
                  thread.mute ?
                    <MdNotificationsOff size={styleVar.iconSizeSm}
                                        color={styleVar.colorAccent}
                                        style={{verticalAlign: "middle"}}/> : ""
                }
                {thread.unreadCount ?
                  <Shape color="accent">
                    <ShapeCircle>{thread.unreadCount}</ShapeCircle>
                  </Shape> :
                  thread.pin ?
                    <AiFillPushpin size={styleVar.iconSizeSm}
                                   color={styleVar.colorAccent}
                                   style={{
                                     marginRight: "3px",
                                     verticalAlign: "middle"
                                   }}/> : ""
                }
              </Container> : ""}
          </Container>
        </ListItem>
      </Container>
    </ContextTrigger>
  </Fragment>
}

export default React.memo(AsideThreadsThread/*, (props, nextProps) => {
    const {activeThread, isMenuShow, thread} = props;
    const {activeThread: nextActiveThread, thread: nextThread, isMenuShow: nextIsMenuShow} = nextProps;
    if (thread.time === nextThread.time) {
      if (thread.mute === nextThread.mute) {
        if (thread.unreadCount === nextThread.unreadCount) {
          if (thread.image === nextThread.image) {
            if (thread.isTyping === nextThread.isTyping) {
              if (thread.title === nextThread.title) {
                if (thread.lastMessageVO.id === nextThread.lastMessageVO.id) {
                  if (thread.lastMessageVO.seen === nextThread.lastMessageVO.seen) {
                    if (thread.lastMessageVO.message === nextThread.lastMessageVO.message) {
                      if (isMenuShow === nextIsMenuShow) {
                        if (activeThread === nextActiveThread) {
                          return true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }*/
);