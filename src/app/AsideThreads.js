// src/list/Avatar.scss.js
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import classnames from "classnames";
import AsideThreadsLastSeenMessage from "./AsideThreadsLastSeenMessage";
import AsideThreadsContextMenu from "./AsideThreadsContextMenu";
import {
  avatarNameGenerator,
  avatarUrlGenerator,
  isIosAndSafari,
  mobileCheck
} from "../utils/helpers";

//strings
import strings from "../constants/localization";
import {ROUTE_THREAD} from "../constants/routes";

//actions
import {
  threadCreateWithExistThread,
  threadCreateWithUser,
  threadGetList
} from "../actions/threadActions";
import {chatSearchResult} from "../actions/chatActions";
import {contactChatting} from "../actions/contactActions";

//UI components
import Avatar, {AvatarImage, AvatarName, AvatarText} from "../../../pod-chat-ui-kit/src/avatar";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Scroller from "../../../pod-chat-ui-kit/src/scroller";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";
import Container from "../../../pod-chat-ui-kit/src/container";
import LoadingBlinkDots from "../../../pod-chat-ui-kit/src/loading/LoadingBlinkDots";
import Loading from "../../../pod-chat-ui-kit/src/loading";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import Message from "../../../pod-chat-ui-kit/src/message";
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

//styling
import style from "../../styles/app/AsideThreads.scss";
import styleVar from "../../styles/variables.scss";


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

const statics = {
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
    this.onMenuShow = this.onMenuShow.bind(this);
    this.onMenuHide = this.onMenuHide.bind(this);
    this.contextMenuRefs = {};
    this.contextTriggerRef = React.createRef();
    this.state = {activeThread: null};
  }

  componentDidUpdate(oldProps) {
    const {chatInstance, threadId, dispatch} = this.props;
    if (oldProps.chatInstance !== chatInstance) {
      dispatch(threadGetList(0, statics.count));
    }
    if (oldProps.threadId !== threadId) {
      this.setState({
        activeThread: threadId
      });
    }
  }

  onScrollBottomThreshold() {
    const {threadsNextOffset, dispatch} = this.props;
    dispatch(threadGetList(threadsNextOffset, statics.count));
  }

  onScroll(e) {
    this.currentScroll = e.currentTarget.scrollTop;
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

  onMenuShow(id) {
    this.setState({
      isMenuShow: id
    });
  }

  onMenuHide() {
    this.setState({
      isMenuShow: false
    });
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
    const {threads, threadsFetching, threadsHasNext, threadShowing, chatInstance, chatSearchResult, user, threadsPartialFetching} = this.props;
    const {activeThread, isMenuShow} = this.state;
    const isMobile = mobileCheck();
    const {MEDIUM} = avatarUrlGenerator.SIZES;
    const classNames = classnames({
      [style.AsideThreads]: true,
      [style["AsideThreads--autoZIndex"]]: isIosAndSafari(),
      [style["AsideThreads--hiddenOverflow"]]: isMobile ? false : isMenuShow && true,
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
    if (!user.id || !chatInstance || threadsFetching) {
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
                        <AsideThreadsContextMenu onThreadClick={this.onThreadClick} thread={el}
                                                 onMenuShow={this.onMenuShow} onMenuHide={this.onMenuHide}
                                                 pinedThread={pinedThread}/>
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
                                  <AvatarImage src={avatarUrlGenerator.apply(this, [el.image, MEDIUM, el.metadata])}
                                               customSize="50px"
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
                                    {el.title}
                                    <AvatarText>
                                      <AsideThreadsLastSeenMessage thread={el} user={user}/>
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
export {sanitizeRule, exportDefault as default};