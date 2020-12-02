// src/list/Avatar.scss.js
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {avatarNameGenerator, avatarUrlGenerator, getNow, isIosAndSafari, mobileCheck} from "../utils/helpers";
import {withRouter} from "react-router-dom";
import {isFile} from "./MainMessagesMessage";
import {isMessageByMe} from "./MainMessages";
import {codeEmoji, decodeEmoji} from "./_component/EmojiIcons.js";
import {isGroup, isChannel} from "./Main";

//strings
import strings from "../constants/localization";
import {ROUTE_THREAD} from "../constants/routes";

//actions
import {
  threadCreateWithExistThread, threadCreateWithUser,
  threadGetList,
  threadLeave,
  threadModalThreadInfoShowing, threadNotification, threadPinToTop, threadUnpinFromTop
} from "../actions/threadActions";

//UI components
import {TypingFragment} from "./MainHeadThreadInfo";
import {
  MdGroup,
  MdRecordVoiceOver,
  MdDoneAll,
  MdDone,
  MdSchedule,
  MdNotificationsOff,
  MdDelete,
  MdNotificationsActive,
  MdArrowBack,
  MdCheck
} from "react-icons/md";
import {
  AiFillPushpin
} from "react-icons/ai";
import Avatar, {AvatarImage, AvatarName, AvatarText} from "../../../pod-chat-ui-kit/src/avatar";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Scroller from "../../../pod-chat-ui-kit/src/scroller";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";
import Container from "../../../pod-chat-ui-kit/src/container";
import LoadingBlinkDots from "../../../pod-chat-ui-kit/src/loading/LoadingBlinkDots";
import Loading from "../../../pod-chat-ui-kit/src/loading";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import date from "../utils/date";

//styling
import style from "../../styles/app/AsideThreads.scss";
import Message from "../../../pod-chat-ui-kit/src/message";
import classnames from "classnames";
import styleVar from "../../styles/variables.scss";
import Context, {ContextItem, ContextTrigger} from "../../../pod-chat-ui-kit/src/menu/Context";
import {chatModalPrompt, chatSearchResult} from "../actions/chatActions";
import {contactChatting} from "../actions/contactActions";
import {clearHtml} from "./_component/Input";
import {messageSeen} from "../actions/messageActions";

function sliceMessage(message) {
  return decodeEmoji(message);
}

function prettifyMessageDate(passedTime) {
  const diff = getNow() - passedTime;
  const isToday = date.isToday(passedTime);
  const isYesterday = date.isYesterday(passedTime);
  const isWithinAWeek = date.isWithinAWeek(passedTime);
  if (isToday) {
    return date.format(passedTime, "HH:mm", "en")
  } else if (isYesterday) {
    return strings.yesterday;
  } else if(isWithinAWeek){
    return date.format(passedTime, "dddd");
  }
  return date.format(passedTime, "YYYY-MM-DD");
}

function getTitle(title) {
  /*  if (!title) {
      return "";
    }
    if (title.length >= 30) {
      return `${title.slice(0, 30)}...`;
    }*/
  return title;
}


function LastMessageTextFragment({isGroup, isChannel, lastMessageVO, lastMessage, draftMessage, inviter, isTyping}) {
  const isFileReal = isFile(lastMessageVO);
  const hasLastMessage = lastMessage || lastMessageVO;
  const isTypingReal = isTyping && isTyping.isTyping;
  const isTypingUserName = isTyping && isTyping.user.user;

  const draftFragment = <Fragment><Text size="sm" inline color="red" light>{strings.draft}:</Text><Text size="sm" inline
                                                                                                        color="gray"
                                                                                                        dark
                                                                                                        isHTML>{clearHtml(draftMessage, true)}</Text></Fragment>;
  const sentAFileFragment = <Text size="sm" inline color="gray" dark>{strings.sentAFile}</Text>;
  const lastMessageFragment = <Text isHTML size="sm" inline color="gray"
                                    sanitizeRule={sanitizeRule}
                                    dark>{sliceMessage(lastMessage, 30)}</Text>;
  const createdAThreadFragment = <Text size="sm" inline
                                       color="accent">{sliceMessage(strings.createdAThread(inviter && (inviter.contactName || inviter.name), isGroup, isChannel), 30)}</Text>;
  return (
    <Container> {
      isTypingReal ? <TypingFragment isGroup={isGroup || isChannel} typing={isTyping}
                                     textProps={{size: "sm", color: "yellow", dark: true}}/> :
        draftMessage ? draftFragment :
          (
            isGroup && !isChannel ?
              hasLastMessage ?
                <Container display="inline-flex">

                  <Container>
                    <Text size="sm" inline
                          color="accent">{isTypingReal ? isTypingUserName : draftMessage ? "Draft:" : lastMessageVO.participant && (lastMessageVO.participant.contactName || lastMessageVO.participant.name)}:</Text>
                  </Container>

                  <Container>
                    {isFileReal ? sentAFileFragment : lastMessageFragment}
                  </Container>

                </Container>
                :
                createdAThreadFragment
              :
              hasLastMessage ? isFileReal ? sentAFileFragment : lastMessageFragment : createdAThreadFragment
          )
    }
    </Container>
  )
}

function LastMessageInfoFragment({isGroup, isChannel, time, lastMessageVO, draftMessage, isMessageByMe}) {
  return (
    <Container>
      <Container topLeft>
        {
          lastMessageVO && !isGroup && !isChannel && isMessageByMe &&
          <Container inline>
            {draftMessage ? "" : (
              lastMessageVO.seen ?
                <MdDoneAll size={style.iconSizeSm} color={style.colorAccent}/> :
                <MdDone size={style.iconSizeSm} color={style.colorAccent}/>
            )}
            <Gap x={3}/>
          </Container>
        }
        <Container inline>
          <Text size="xs"
                color="gray">{prettifyMessageDate(time || lastMessageVO.time)}</Text>
        </Container>

      </Container>

    </Container>)

}

export function LastMessageFragment({thread, user}) {
  const {group, type, lastMessageVO, lastMessage, inviter, time, isTyping, draftMessage} = thread;
  const args = {
    isGroup: group && type !== 8,
    isChannel: group && type === 8,
    lastMessageVO,
    lastMessage,
    draftMessage,
    inviter,
    time,
    isTyping,
    isMessageByMe: isMessageByMe(lastMessageVO, user)
  };
  return (
    <Container>
      <LastMessageTextFragment {...args}/>
      <LastMessageInfoFragment {...args}/>
    </Container>
  )
}

function PartialLoadingFragment() {
  return (
    <Container bottomCenter centerTextAlign style={{zIndex: 1}}>
      <Loading><LoadingBlinkDots size="sm" invert/></Loading>
    </Container>
  )
}


const sanitizeRule = {
  allowedTags: ["img"],
  allowedAttributes: {
    img: ["src", "style", "class"]
  }
};

export const statics = {
  count: 50
};

@connect(store => {
  return {
    threads: store.threads.threads,
    threadsFetching: store.threads.fetching,
    threadsHasNext: store.threads.hasNext,
    threadsNextOffset: store.threads.nextOffset,
    threadsPartialFetching: store.threadsPartial.fetching,
    threadId: store.thread.thread.id,
    chatInstance: store.chatInstance.chatSDK,
    chatRouterLess: store.chatRouterLess,
    chatSearchResult: store.chatSearchResult,
    chatFileHashCodeMap: store.chatFileHashCodeUpdate.hashCodeMap,
    user: store.user.user
  };
})
class AsideThreads extends Component {

  constructor(props) {
    super(props);
    this.onThreadClick = this.onThreadClick.bind(this);
    this.onStartChat = this.onStartChat.bind(this);
    this.onScrollBottomThreshold = this.onScrollBottomThreshold.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onLeaveClick = this.onLeaveClick.bind(this);
    this.onPinClick = this.onPinClick.bind(this);
    this.onMuteClick = this.onMuteClick.bind(this);
    this.onMenuShow = this.onMenuShow.bind(this);
    this.onMenuHide = this.onMenuHide.bind(this);
    this.contextMenuRefs = {};
    this.contextTriggerRef = React.createRef();
    this.state = {activeThread: null};
  }

  componentDidUpdate(oldProps) {
    const {chatInstance, dispatch} = this.props;
    if (oldProps.chatInstance !== chatInstance) {
      dispatch(threadGetList(0, statics.count));
    }
    if (oldProps.threadId !== this.props.threadId) {
      this.setState({
        activeThread: this.props.threadId
      });
    }
  }

  onLeaveClick(thread) {
    const {dispatch} = this.props;
    const isP2P = !isChannel(thread) && !isGroup(thread);
    dispatch(chatModalPrompt(true, `${isP2P ? strings.areYouSureRemovingThread : strings.areYouSureAboutLeavingGroup(thread.title, isChannel(thread))}؟`, () => {
      dispatch(threadLeave(thread.id));
      dispatch(threadModalThreadInfoShowing());
      dispatch(chatModalPrompt());
    }, null, isP2P ? strings.remove : strings.leave));
  }

  onMuteClick(thread) {
    const {dispatch} = this.props;
    dispatch(threadNotification(thread.id, !thread.mute));
  }

  onPinClick(thread) {
    const {dispatch} = this.props;
    dispatch(thread.pin ? threadUnpinFromTop(thread.id) : threadPinToTop(thread.id));
  }

  onScrollBottomThreshold() {
    const {threadsNextOffset, dispatch} = this.props;
    dispatch(threadGetList(threadsNextOffset, statics.count));
  }

  onScroll(e) {
    this.currentScroll = e.currentTarget.scrollTop;
  }


  onLastMessageSeen(thread) {
    const {dispatch} = this.props;
    dispatch(messageSeen(thread.lastMessageVO));
  }

  onThreadTouchStart(thread, e) {
    e.stopPropagation();
    const touchPosition = this.touchPosition;
    clearTimeout(this.showMenuTimeOutId);
    this.showMenuTimeOutId = setTimeout(() => {
      clearTimeout(this.showMenuTimeOutId);
      this.showMenuTimeOutId = null;
      if (this.touchPosition === touchPosition) {
        this.setState({
          isMenuShow: thread.id
        });
        const trigger = this.contextMenuRefs[thread.id];
        trigger.handleContextClick(e);
      }
    }, 700);
  }

  onThreadTouchEnd(thread, e) {
    if (this.showMenuTimeOutId) {
      clearTimeout(this.showMenuTimeOutId);
    } else {
      e.preventDefault();
    }
  }

  onThreadTouchMove(thread, e) {
    this.touchPosition = `${e.touches[0].pageX}${e.touches[0].pageY}`;
  }

  onMenuShow(e) {
    this.setState({
      isMenuShow: e.detail.id
    });
  }

  onMenuHide() {
    setTimeout(() => {
      this.setState({
        isMenuShow: false
      });
    }, 200)
  }

  onThreadClick(thread, e) {
    const {chatRouterLess, history, threadId, dispatch} = this.props;
    if (e.nativeEvent.which === 3) {
      e.preventDefault();
      return true;
    }
    if (thread.id === threadId) {
      return true;
    }
    if (!chatRouterLess) {
      history.push(ROUTE_THREAD);
    }
    dispatch(threadCreateWithExistThread(thread));
  }

  onStartChat(contact) {
    const {history, chatRouterLess, dispatch} = this.props;
    dispatch(contactChatting(contact));
    dispatch(threadCreateWithUser(contact.id));
    if (!chatRouterLess) {
      history.push(ROUTE_THREAD);
    }
    dispatch(chatSearchResult());
  }

  render() {
    const {threads, threadsFetching, threadShowing, chatInstance, chatSearchResult, user, threadsHasNext, threadsPartialFetching, chatFileHashCodeMap} = this.props;
    const {activeThread, isMenuShow} = this.state;
    const isMobile = mobileCheck();
    const {MEDIUM} = avatarUrlGenerator.SIZES;
    const classNames = classnames({
      [style.AsideThreads]: true,
      [style["AsideThreads--autoZIndex"]]: isIosAndSafari(),
      [style["AsideThreads--hiddenOverflow"]]: !isMobile ? isMenuShow && true : false,
      [style["AsideThreads--isThreadShow"]]: threadShowing
    });
    let filteredThreads = threads;
    let filteredContacts;
    let isSearchResult;
    if (chatSearchResult) {
      isSearchResult = true;
      filteredThreads = chatSearchResult.filteredThreads;
      filteredContacts = chatSearchResult.filteredContacts;
      if (filteredContacts) {
        filteredContacts = filteredContacts.filter(e => e.linkedUser);
      }
    }
    let pinedThread = threads.filter(e => e.pin);
    if (threadsFetching || !chatInstance || !user.id) {
      return (
        <Container className={classNames} centerTextAlign>
          <Loading hasSpace><LoadingBlinkDots invert rtl/></Loading>
        </Container>
      )
    } else {
      if (!chatSearchResult && !filteredThreads.length) {
        return (
          <section className={classNames}>
            <Container center centerTextAlign>
              <Message invert size="lg">{strings.thereIsNoChat}</Message>
            </Container>
          </section>
        )
      }


      const threadsContainerClassNames = classnames({
        [style.AsideThreads__Threads]: true,
        [style["AsideThreads__ThreadsFullHeight"]]: !isSearchResult
      });

      const MobileContextMenu = ({thread}) => {
        return <Fragment>
          <Container className={style.AsideThreads__MenuActionContainer}>
            <ContextItem onClick={this.onLeaveClick.bind(null, thread)}>
              <MdDelete size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
            </ContextItem>

            <ContextItem onClick={this.onMuteClick.bind(null, thread)}>
              {
                thread.mute ? <MdNotificationsActive size={styleVar.iconSizeMd} color={styleVar.colorAccent}/> :
                  <MdNotificationsOff size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
              }
            </ContextItem>
            {
              ((thread.pin && pinedThread.length >= 5) || pinedThread.length < 5) &&
              <ContextItem onClick={this.onPinClick.bind(null, thread)}>
                {
                  thread.pin || pinedThread.length >= 5 ?
                    <Container relative><Container className={style.AsideThreads__UnpinLine}/><AiFillPushpin
                      size={styleVar.iconSizeMd} color={styleVar.colorAccent}/></Container> :
                    <AiFillPushpin size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
                }
              </ContextItem>

            }
          </Container>

          <ContextItem className={style.AsideThreads__MobileMenuBack}>
            <MdArrowBack size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
          </ContextItem>

        </Fragment>
      };
      return (
        <Scroller className={classNames}
                  threshold={5}
                  onScroll={this.onScroll}
                  onScrollBottomThresholdCondition={threadsHasNext && !threadsPartialFetching && !isSearchResult}
                  onScrollBottomThreshold={this.onScrollBottomThreshold}>
          {isMenuShow && <Container className={style.AsideThreads__Overlay} onContextMenu={e => {
            e.stopPropagation();
            e.preventDefault();
          }}/>}
          <Fragment>
            <Fragment>
              {isSearchResult &&
              <Gap y={8} x={5}>
                <Text bold color="accent">{strings.conversations}</Text>
              </Gap>
              }
              <Scroller className={threadsContainerClassNames}>
                <List>
                  {filteredThreads && filteredThreads.length ?
                    filteredThreads.map(el => (
                      <Fragment>
                        <Context id={el.id} stickyHeader={isMobile} style={isMobile ? {height: "59px"} : null}
                                 onShow={this.onMenuShow} onHide={this.onMenuHide}>
                          {isMobile ?
                            <MobileContextMenu thread={el}/> :

                            <Fragment>

                              <ContextItem onClick={this.onThreadClick.bind(null, el)}>
                                {strings.openThread}
                              </ContextItem>

                              <ContextItem onClick={this.onLeaveClick.bind(null, el)}>
                                {
                                  (isGroup(el) || isChannel(el)) ? strings.leave : strings.remove
                                }
                              </ContextItem>

                              <ContextItem onClick={this.onMuteClick.bind(null, el)}>
                                {el.mute ? strings.unmute : strings.mute}
                              </ContextItem>

                              {
                                ((el.pin && pinedThread.length >= 5) || pinedThread.length < 5) &&
                                <ContextItem onClick={this.onPinClick.bind(null, el)}>
                                  {
                                    (el.pin || pinedThread.length >= 5 ? strings.unpinFromTop : strings.pinToTop)
                                  }
                                </ContextItem>

                              }

                              {
                                el.unreadCount > 0 &&
                                <ContextItem onClick={this.onLastMessageSeen.bind(this, el)}>
                                  {strings.seenLastMessage}
                                </ContextItem>

                              }
                            </Fragment>
                          }
                        </Context>
                        <ContextTrigger id={el.id} holdToDisplay={-1}
                                        contextTriggerRef={e => this.contextMenuRefs[el.id] = e}>
                          <Container relative userSelect="none">
                            {el.pin && <Container className={style.AsideThreads__PinOverlay}/>}
                            <ListItem key={el.id} onSelect={this.onThreadClick.bind(this, el)} selection
                                      active={activeThread === el.id}>

                              <Container relative
                                         onTouchStart={this.onThreadTouchStart.bind(this, el)}
                                         onTouchMove={this.onThreadTouchMove.bind(this, el)}
                                         onTouchEnd={this.onThreadTouchEnd.bind(this, el)}>
                                <Avatar cssClassNames={style.AsideThreads__AvatarContainer}>
                                  <AvatarImage src={avatarUrlGenerator.apply(this, [el.image, MEDIUM, el.metadata])} customSize="50px"
                                               text={avatarNameGenerator(el.title).letter}
                                               textBg={avatarNameGenerator(el.title).color}/>
                                  <Container className={style.AsideThreads__ThreadCheck} bottomRight
                                             style={{zIndex: 1, opacity: +isMenuShow === el.id ? 1 : 0}}>
                                    <Shape color="accent">
                                      <ShapeCircle>
                                        <MdCheck size={styleVar.iconSizeSm} color={styleVar.colorWhite}
                                                 style={{marginTop: "3px"}}/>
                                      </ShapeCircle>
                                    </Shape>
                                  </Container>
                                  <AvatarName invert>
                                    {el.group &&
                                    <Container inline>
                                      {el.type === 8 ?
                                        <MdRecordVoiceOver size={styleVar.iconSizeSm} color={styleVar.colorGray}/>
                                        :
                                        <MdGroup size={styleVar.iconSizeSm} color={styleVar.colorGray}/>
                                      }
                                      <Gap x={2}/>
                                    </Container>
                                    }
                                    {getTitle(el.title)}
                                    <AvatarText>
                                      <LastMessageFragment thread={el} user={user}/>
                                    </AvatarText>
                                  </AvatarName>
                                </Avatar>
                                {el.unreadCount || el.pin || el.mute ?
                                  <Container absolute centerLeft>
                                    <Gap y={10} block/>
                                    {el.mentioned ?
                                      <Fragment>
                                        <Shape color="accent">
                                          <ShapeCircle>@</ShapeCircle>
                                        </Shape>
                                        <Gap x={1}/>
                                      </Fragment> :
                                      el.mute ?
                                        <MdNotificationsOff size={styleVar.iconSizeSm} color={styleVar.colorAccent}
                                                            style={{verticalAlign: "middle"}}/> : ""
                                    }
                                    {el.unreadCount ?
                                      <Shape color="accent">
                                        <ShapeCircle>{el.unreadCount}</ShapeCircle>
                                      </Shape> :
                                      el.pin ?
                                        <AiFillPushpin size={styleVar.iconSizeSm} color={styleVar.colorAccent}
                                                       style={{marginRight: "3px", verticalAlign: "middle"}}/> : ""
                                    }
                                  </Container> : ""}
                              </Container>
                            </ListItem>
                          </Container>
                        </ContextTrigger>
                      </Fragment>
                    )) :
                    <Container relative centerTextAlign>
                      <Gap y={8} x={5}>
                        <Text size="sm" color="gray">{strings.noResult}</Text>
                      </Gap>
                    </Container>}
                </List>
                {threadsPartialFetching && <PartialLoadingFragment/>}
              </Scroller>
            </Fragment>
            {isSearchResult &&
            <Fragment>
              <Gap y="8" x="5">
                <Text bold color="accent">{strings.contacts}</Text>
              </Gap>
              <Scroller>

                {filteredContacts && filteredContacts.length ?
                  <Container>

                    <List>
                      {filteredContacts.map(el => (
                        <ListItem key={el.id} selection>
                          <Container relative onClick={this.onStartChat.bind(this, el)}>

                            <Container maxWidth="calc(100% - 75px)">
                              <Avatar>
                                <AvatarImage src={avatarUrlGenerator(el.linkedUser.image, MEDIUM)}
                                             text={avatarNameGenerator(`${el.firstName} ${el.lastName}`).letter}
                                             textBg={avatarNameGenerator(`${el.firstName} ${el.lastName}`).color}/>
                                <AvatarName invert>
                                  {el.firstName} {el.lastName}
                                  {
                                    el.blocked
                                    &&
                                    <AvatarText>
                                      <Text size="xs" inline
                                            color="red">{strings.blocked}</Text>
                                    </AvatarText>
                                  }

                                </AvatarName>
                              </Avatar>
                            </Container>
                          </Container>
                        </ListItem>
                      ))}
                    </List>
                  </Container> :
                  <Container relative centerTextAlign>
                    <Gap y="8" x="5">
                      <Text size="sm" color="gray">{strings.noResult}</Text>
                    </Gap>
                  </Container>
                }
              </Scroller>
            </Fragment>
            }
          </Fragment>
        </Scroller>
      );
    }
  }
}

const exportDefault = withRouter(AsideThreads);
export {getTitle, sliceMessage, isFile, sanitizeRule, prettifyMessageDate, exportDefault as default};