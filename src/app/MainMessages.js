// src/list/BoxSceneMessages
import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import "moment/locale/fa";
import checkForPrivilege from "./../utils/privilege";
import {
  OnWindowFocusInOut,
  mobileCheck,
  isIosAndSafari,
  isGroup,
  isMessageByMe,
  messageSelectedCondition,
  showMessageNameOrAvatar,
  isChannel,
  findLastSeenMessage
} from "../utils/helpers";
import isElementVisible from "../utils/dom";

//strings
import {THREAD_HISTORY_LIMIT_PER_REQUEST, THREAD_HISTORY_UNSEEN_MENTIONED} from "../constants/historyFetchLimits";

//actions
import {messageSeen} from "../actions/messageActions";
import {
  threadMessageGetListByMessageId,
  threadMessageGetListPartial,
  threadMessageGetList,
  threadUnreadMentionedMessageGetList,
  threadNewMessage,
  threadFilesToUpload,
  threadUnreadMentionedMessageRemove,
  threadGoToMessageId,
  threadTrimDownHistory
} from "../actions/threadActions";

//components
import {ButtonFloating} from "../../../pod-chat-ui-kit/src/button";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import Container from "../../../pod-chat-ui-kit/src/container";
import Scroller from "../../../pod-chat-ui-kit/src/scroller";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";
import MainMessagesMessage from "./MainMessagesMessage";
import MainMessagesUnreadBar from "./MainMessagesUnreadBar";
import MainMessagesLoading from "./MainMessagesLoading";
import MainMessagesNoMessages from "./MainMessagesNoMessages";
import MainMessagesAvatar from "./MainMessagesAvatar";
import MainMessagesTick from "./MainMessagesTick";
import MainMessagesContextMenu from "./MainMessagesContextMenu";

//styling
import {
  MdExpandMore,
} from "react-icons/md";
import style from "../../styles/app/MainMessages.scss";

export const statics = {
  historyUnseenMentionedFetchCount: 100,
};

function PartialLoadingFragment() {
  return (
    <Container topCenter centerTextAlign style={{zIndex: 1}}>
      <Loading><LoadingBlinkDots size="sm"/></Loading>
    </Container>
  )
}

@connect(store => {
  return {
    threadMessages: store.threadMessages,
    threadUnreadMentionedMessages: store.threadUnreadMentionedMessages.messages,
    threadMessagesPartialFetching: store.threadMessagesPartial.fetching,
    threadGetMessageListByMessageIdFetching: store.threadGetMessageListByMessageId.fetching,
    threadSelectMessageShowing: store.threadSelectMessageShowing,
    threadCheckedMessageList: store.threadCheckedMessageList,
    threadGoToMessageId: store.threadGoToMessageId,
    messageNew: store.messageNew,
    user: store.user.user,
  };
}, null, null, {forwardRef: true})
export default class MainMessages extends Component {

  constructor(props) {
    super(props);
    this.state = {
      bottomButtonShowing: false,
      highLightMessage: null,
      unreadBar: null,
      newMessageUnreadCount: 0,
      canPaste: true
    };
    this.scroller = React.createRef();
    this.onScrollBottomEnd = this.onScrollBottomEnd.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onScrollBottomThreshold = this.onScrollBottomThreshold.bind(this);
    this.onRepliedMessageClicked = this.onRepliedMessageClicked.bind(this);
    this.onScrollTopThreshold = this.onScrollTopThreshold.bind(this);
    this.onScrollTop = this.onScrollTop.bind(this);
    this.onGotoBottomClicked = this.onGotoBottomClicked.bind(this);
    this.onMentionedClicked = this.onMentionedClicked.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onFileDrop = this.onFileDrop.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.goToSpecificMessage = this.goToSpecificMessage.bind(this);
    const modalMedia = modalMediaRef.getJqueryScope()(document);
    modalMedia.on('afterClose.fb', () => {
      this.setState({canPaste: true})
    });
    modalMedia.on('afterShow.fb', () => {
      this.setState({canPaste: false})
    });
    document.body.addEventListener("paste", e => this.state.canPaste && this.onPaste(e));

    //Controller fields
    this.gotoBottom = false;
    this.hasPendingMessageToGo = null;
    this.lastSeenMessage = null;
    this.lastSeenMessageTime = null;
    this.windowFocused = true;
    this.checkForSnapping = false;
    this.highLightMentionStack = [];

    if (!mobileCheck()) {
      OnWindowFocusInOut(() => this.windowFocused = false, () => {
        this.windowFocused = true;
        if (this.lastSeenMessage) {
          this.props.dispatch(messageSeen(this.lastSeenMessage));
          this.lastSeenMessage = null;
        }
      });
    }
  }

  componentDidMount() {
    const {threadUnreadMentionedMessages, thread} = this.props;
    if (thread) {
      if (thread.onTheFly) {
        return;
      }
      if (thread.id) {
        if (thread.mentioned) {
          this.fetchUnreadMentionedMessages();
        } else if (threadUnreadMentionedMessages.length) {
          this.fetchUnreadMentionedMessages(true);
        }
        this._fetchInitHistory();
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    const {messageNew: oldNewMessage, threadGoToMessageId: oldThreadGoToMessageId, threadMessages, dispatch, user} = this.props;
    const {messageNew, thread, threadGoToMessageId} = nextProps;
    const {hasNext} = threadMessages;

    if (threadGoToMessageId !== oldThreadGoToMessageId) {
      if (threadGoToMessageId) {
        this.goToSpecificMessage(threadGoToMessageId);
      }
      return false;
    }

    //Check for allow rendering
    if (!oldNewMessage && !messageNew) {
      return true;
    }
    if (oldNewMessage && messageNew) {
      if (oldNewMessage.uniqueId === messageNew.uniqueId) {
        if (!oldNewMessage.id && messageNew.id) {
          dispatch(threadNewMessage(messageNew));
        }
        return true;
      }
    }
    if (messageNew.threadId !== thread.id) {
      return true;
    }

    //functionality after allowing newMessage to come for calculation

    if (isMessageByMe(messageNew, user)) {
      messageNew.isByMe = true;
      this.setState({unreadBar: null, newMessageUnreadCount: 0});
      if (hasNext) {
        dispatch(threadMessageGetList(thread.id, THREAD_HISTORY_LIMIT_PER_REQUEST));
        this.gotoBottom = true;
        return false;
      } else {
        dispatch(threadNewMessage(messageNew));
        this.gotoBottom = true;
        return false;
      }
    } else {
      if (!this.windowFocused) {
        const {unreadBar} = this.state;
        if (thread.lastSeenMessageTime !== unreadBar) {
          this.setState({unreadBar: thread.lastSeenMessageTime});
        }
      }
      if (this.scroller.current) {
        const scrollPositionInfo = this.scroller.current.getInfo();
        const {newMessageUnreadCount} = this.state;
        if (!hasNext) {
          const isInBottom = scrollPositionInfo.isInBottomEnd;
          if (isInBottom) {
            messageNew.followUp = true;
          }
          dispatch(threadNewMessage(messageNew));
          if (isInBottom) {
            this.gotoBottom = true;
            this.lastSeenMessage = messageNew;
            if (newMessageUnreadCount !== 0) {
              this.setState({
                newMessageUnreadCount: 0
              });
            }
          } else {
            this.setState({
              newMessageUnreadCount: newMessageUnreadCount + 1
            });
          }
          return false;
        } else if (hasNext) {
          this.setState({
            newMessageUnreadCount: newMessageUnreadCount + 1
          });
          return false;
        }
      } else {
        dispatch(threadNewMessage(messageNew));
        this.lastSeenMessage = messageNew;
        return false;
      }
    }

    return true;
  }

  componentDidUpdate(oldProps) {
    const {thread, threadMessages, threadGetMessageListByMessageIdFetching, threadMessagesPartialFetching, threadUnreadMentionedMessages, dispatch} = this.props;
    const {thread: oldThread} = oldProps;
    const {fetching} = threadMessages;
    const threadId = thread.id;

    if (!threadId) {
      return;
    }

    //If this thread is on the fly no need for history fetching
    if (thread.onTheFly) {
      return;
    }

    //If old thread was on the fly and we created an actual thread for that there is no need for history fetching or something else
    if (oldThread.onTheFly) {
      if (thread.participants) {
        if (thread.participants.filter(e => e.id === thread.partner)[0].coreUserId === oldThread.partner.coreUserId) {
          return;
        }
      }
    }

    //fetch message if thread change
    if (!oldThread || oldThread.id !== threadId) {
      if (thread.mentioned) {
        this.fetchUnreadMentionedMessages();
      } else if (threadUnreadMentionedMessages.length) {
        this.fetchUnreadMentionedMessages(true);
      }
      if (thread.gotoMessage) {
        return this.goToSpecificMessage(thread.gotoMessage);
      }
      return this._fetchInitHistory();
    }

    //scroll to message if have pending message to go
    if (fetching || threadGetMessageListByMessageIdFetching) {
      return;
    }

    if (this.lastSeenMessage) {
      if (this.windowFocused) {
        dispatch(messageSeen(this.lastSeenMessage));
        this.lastSeenMessage = null;
      }
    }

    if (this.hasPendingMessageToGo) {
      return this.goToSpecificMessage(this.hasPendingMessageToGo);
    }

    if (this.gotoBottom && this.scroller.current) {
      this.scroller.current.gotoBottom();
      return this.gotoBottom = false;
    }

    if (this.checkForSnapping) {
      if (!threadMessagesPartialFetching && !threadGetMessageListByMessageIdFetching) {
        this.scroller.current.checkForSnapping();
        this.checkForSnapping = false;
        dispatch(threadTrimDownHistory());
      }
    }
  }

  _fetchInitHistory(fetchLastHistoryWithoutAnyCondition) {
    this.lastSeenMessage = null;
    this.gotoBottom = false;
    this.hasPendingMessageToGo = null;
    const {thread, dispatch} = this.props;
    const {unreadBar, newMessageUnreadCount} = this.state;
    dispatch(threadMessageGetListPartial(null, null, null, null, true));
    dispatch(threadMessageGetListByMessageId(null, null, null, true));
    if (fetchLastHistoryWithoutAnyCondition) {
      this.gotoBottom = true;
      if (unreadBar !== null || newMessageUnreadCount !== 0) {
        this.setState({unreadBar: null, newMessageUnreadCount: 0});
      }
      return dispatch(threadMessageGetList(thread.id, THREAD_HISTORY_LIMIT_PER_REQUEST));
    }
    if (thread.unreadCount > THREAD_HISTORY_LIMIT_PER_REQUEST) {
      this.hasPendingMessageToGo = thread.lastSeenMessageTime;
      this._fetchHistoryFromMiddle(thread.id, thread.lastSeenMessageTime);
      this.setState({unreadBar: thread.lastSeenMessageTime});
      this.lastSeenMessage = thread.lastMessageVO;
    } else {
      let unreadBar = null;
      if (thread.unreadCount) {
        if (thread.lastSeenMessageTime && thread.lastMessageVO) {
          if (thread.lastSeenMessageTime >= thread.lastMessageVO.time) {
            this.gotoBottom = true;
          } else if (thread.lastMessageVO.previousId === thread.lastSeenMessageId) {
            this.gotoBottom = true;
            unreadBar = this.hasPendingMessageToGo = thread.lastSeenMessageTime;
            this.lastSeenMessage = thread.lastMessageVO;
          } else {
            unreadBar = this.hasPendingMessageToGo = thread.lastSeenMessageTime;
            this.lastSeenMessage = thread.lastMessageVO;
          }
        } else {
          if (thread.lastMessageVO) {
            this.lastSeenMessage = thread.lastMessageVO;
          }
        }
      } else {
        this.gotoBottom = true;
      }
      if (unreadBar !== this.state.unreadBar || newMessageUnreadCount !== 0) {
        this.setState({unreadBar, newMessageUnreadCount: 0});
      }
      dispatch(threadMessageGetList(thread.id, THREAD_HISTORY_LIMIT_PER_REQUEST));
    }
  }

  fetchUnreadMentionedMessages(canceled) {
    const {dispatch, thread} = this.props;
    if (canceled) {
      return dispatch(threadUnreadMentionedMessageGetList());
    }
    dispatch(threadUnreadMentionedMessageGetList(thread.id, THREAD_HISTORY_UNSEEN_MENTIONED));
  }

  _fetchHistoryFromMiddle(threadId, messageTime) {
    this.props.dispatch(threadMessageGetListByMessageId(threadId, messageTime, THREAD_HISTORY_LIMIT_PER_REQUEST));
  }

  onGotoBottomClicked() {
    const {threadMessages, messageNew, thread} = this.props;
    const {hasNext} = threadMessages;
    if (hasNext) {
      this._fetchInitHistory();
    } else {
      if (thread.unreadCount) {
        this.lastSeenMessage = messageNew;
      }
      this.scroller.current.gotoBottom();
    }
    this.setState({
      newMessageUnreadCount: 0,
      bottomButtonShowing: false
    });
  }

  onMentionedClicked() {
    const {threadUnreadMentionedMessages} = this.props;
    const firstUnreadMessage = threadUnreadMentionedMessages[0];
    this.goToSpecificMessage(firstUnreadMessage.time);
  }

  onScrollTopThreshold() {
    const {thread, threadMessages, dispatch} = this.props;
    const {messages} = threadMessages;
    dispatch(threadMessageGetListPartial(thread.id, messages[0].time - 200, false, THREAD_HISTORY_LIMIT_PER_REQUEST));
    this.checkForSnapping = true;
  }

  onScrollBottomThreshold() {
    const {thread, threadMessages, dispatch} = this.props;
    const {messages} = threadMessages;
    dispatch(threadMessageGetListPartial(thread.id, messages[messages.length - 1].time + 200, true, THREAD_HISTORY_LIMIT_PER_REQUEST, false));
  }

  onScroll() {
    const {threadUnreadMentionedMessages, dispatch} = this.props;
    if (threadUnreadMentionedMessages.length) {
      for (const msg of threadUnreadMentionedMessages) {
        const id = `message-${msg.time}`;
        const elem = document.getElementById(id);
        elem && isElementVisible(elem, () => {
          const {threadUnreadMentionedMessages, dispatch} = this.props;
          if (!threadUnreadMentionedMessages.length) {
            return;
          }
          if (!threadUnreadMentionedMessages.find(e => e.id === msg.id)) {
            return;
          }
          dispatch(threadUnreadMentionedMessageRemove(msg.id));
          if (this.highLightMentionStack.indexOf(msg.time) < 0) {
            this.highLightMentionStack.push(msg.time);
          }
          if (this.highLightMentionStack.length) {
            clearInterval(this.highLightInterval);
            this.highlightMessage(this.highLightMentionStack.shift());
            if (!this.highLightMentionStack.length) {
              return;
            }
            this.highLightInterval = setInterval(() => {
              this.highlightMessage(this.highLightMentionStack.shift());
            }, 2000);
          }
        });
      }
    }
  }

  onScrollBottomEnd() {
    const {thread, threadMessages} = this.props;
    const {bottomButtonShowing} = this.state;
    if (thread.unreadCount > 0) {
      this.lastSeenMessage = thread.lastMessageVO;
    }
    /*
        if (messageNew) {
          if (thread.id === messageNew.threadId) {
            if (thread.unreadCount > 0) {
              this.lastSeenMessage = messageNew;
            }
          }
        }
        }*/

    if (bottomButtonShowing && !threadMessages.hasNext) {
      this.setState({
        newMessageUnreadCount: 0,
        bottomButtonShowing: false
      });
    }

  }

  onScrollTop() {
    if (!this.state.bottomButtonShowing && !this.props.threadMessages.fetching) {
      const {scrollPosition, scrollHeight} = this.scroller.current.getInfo();
      if (scrollHeight - scrollPosition > 70) {
        this.setState({
          bottomButtonShowing: true
        });
      }
    }
  }

  highlightMessage(messageTime) {
    clearTimeout(this.highLighterTimeOut);
    this.setState({
      highLightMessage: messageTime
    });
    this.highLighterTimeOut = setTimeout(() => {
      this.setState({
        highLightMessage: false
      });
      const {threadGoToMessageId: threadGoToMessageTime, dispatch} = this.props;
      if (threadGoToMessageTime) {
        dispatch(threadGoToMessageId(null));
      }
    }, 2500);
  }

  goToSpecificMessage(messageTime, force) {
    const {thread, threadMessages} = this.props;
    const {bottomButtonShowing, unreadBar} = this.state;
    if (!this.scroller) {
      return;
    }

    let result;
    if (this.scroller.current) {
      result = this.scroller.current.gotoElement(`message-${messageTime}`);
    }

    if (!result) {
      //If last request was the same message and if this message is not exists in history fetch from init
      if (messageTime === this.hasPendingMessageToGo) {
        return this._fetchInitHistory(true);
      }

      this.hasPendingMessageToGo = messageTime;
      this._fetchHistoryFromMiddle(thread.id, messageTime);
      return this.setState({unreadBar: null});
    }

    if (unreadBar !== messageTime || force) {
      this.highlightMessage(messageTime)
    }

    if (threadMessages.hasNext) {
      if (!bottomButtonShowing) {
        this.setState({
          bottomButtonShowing: true
        });
      }
    }
    this.hasPendingMessageToGo = null;
  }

  onRepliedMessageClicked(time, isDeleted, e) {
    e.stopPropagation();
    if (isDeleted) {
      return;
    }
    this.goToSpecificMessage(time, true);
  }

  onDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  onDragEnter(e) {
    e.stopPropagation();
  }

  onFileDrop(e, notPrevent) {
    e.stopPropagation();
    if (!notPrevent) {
      e.preventDefault();
    }
    const dt = e.dataTransfer;
    if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') !== -1 : dt.types.contains('Files'))) {
      this.props.dispatch(threadFilesToUpload(dt.files));
    }
    return false;
  }

  onPaste(e) {
    const {thread} = this.props;
    const isChannelBool = isChannel(thread);
    if (!isChannelBool || (isChannelBool && checkForPrivilege(thread, "ownership"))) {
      if (e.clipboardData) {
        e.dataTransfer = e.clipboardData;
        this.onFileDrop(e, true);
      }
    }
  }

  render() {
    const {
      threadMessages,
      threadMessagesPartialFetching,
      threadGetMessageListByMessageIdFetching,
      user,
      thread,
      threadCheckedMessageList,
      threadUnreadMentionedMessages,
      threadSelectMessageShowing
    } = this.props;
    const {highLightMessage, bottomButtonShowing, unreadBar, newMessageUnreadCount} = this.state;
    const {messages, fetching, hasPrevious, hasNext} = threadMessages;
    const MainMessagesMessageContainerClassNames = isMessageByMe => classnames({
      [style.MainMessages__MessageContainer]: true,
      [style["MainMessages__MessageContainer--left"]]: !isMessageByMe
    });

    if (!thread.id || fetching || threadGetMessageListByMessageIdFetching) {
      return <MainMessagesLoading className={style.MainMessages}/>;
    }

    if (!messages.length) {
      return <MainMessagesNoMessages className={style.MainMessages}
                                     onDragEnter={this.onDragEnter}
                                     onDragOver={this.onDragOver}
                                     onDrop={this.onFileDrop}/>
    }
    const isGroupResult = isGroup(thread);
    const isChannelResult = isChannel(thread);
    return (
      <Container className={style.MainMessages}
                 style={isIosAndSafari() ? {zIndex: "auto"} : null}
                 onDragEnter={this.onDragEnter}
                 onDragOver={this.onDragOver}
                 onDrop={this.onFileDrop}>
        {threadMessagesPartialFetching && <PartialLoadingFragment/>}
        <MainMessagesContextMenu thread={thread} user={user}/>
        <Scroller ref={this.scroller}
                  checkForSnapping
                  className={style.MainMessages__Messages}
                  threshold={5}
                  onScrollBottomEnd={this.onScrollBottomEnd}
                  onScrollBottomThreshold={this.onScrollBottomThreshold}
                  onScrollBottomThresholdCondition={hasNext && !threadMessagesPartialFetching && !threadGetMessageListByMessageIdFetching}
                  onScroll={this.onScroll}
                  onScrollTop={this.onScrollTop}
                  onScrollTopThreshold={this.onScrollTopThreshold}
                  onScrollTopThresholdCondition={hasPrevious && !threadMessagesPartialFetching && !threadGetMessageListByMessageIdFetching}>
          <List>
            {
              messages.map(message => {
                  const isMessageByMeResult = isMessageByMe(message, user, thread);
                  const showMessageNameOrAvatarResult = showMessageNameOrAvatar(message, messages);

                  return <ListItem key={message.time}
                                   active={threadSelectMessageShowing && messageSelectedCondition(message, threadCheckedMessageList)}
                                   activeColor="gray"
                                   noPadding>
                    <Container className={MainMessagesMessageContainerClassNames(isMessageByMeResult)}
                               id={`message-${message.time}`}
                               relative>
                      {
                        (isGroupResult && !isMessageByMeResult) &&
                        <MainMessagesAvatar message={message}
                                            isChannel={isChannelResult}
                                            isGroup={isGroupResult}
                                            showAvatar={showMessageNameOrAvatarResult}/>
                      }

                      <MainMessagesMessage thread={thread}
                                           messages={messages}
                                           lastSeenMessageTime={!isChannelResult && !isGroupResult ? findLastSeenMessage(messages) : null}
                                           showName={showMessageNameOrAvatarResult}
                                           user={user}
                                           isChannel={isChannelResult}
                                           isGroup={isGroupResult}
                                           isMessageByMe={isMessageByMeResult}
                                           highLightMessage={highLightMessage}
                                           onRepliedMessageClicked={this.onRepliedMessageClicked} message={message}/>

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
              )}

          </List>

        </Scroller>
        {(bottomButtonShowing || newMessageUnreadCount !== 0) && !this.gotoBottom &&
        <ButtonFloating onClick={this.onGotoBottomClicked} size="sm" position={{right: 0, bottom: 0}}>
          <MdExpandMore size={style.iconSizeMd}/>

          {newMessageUnreadCount !== 0 &&
          <Container className={style.MainMessages__MentionedButtonContainer}>
            <Shape color="accent">
              <ShapeCircle>{newMessageUnreadCount}</ShapeCircle>
            </Shape>
          </Container>
          }

        </ButtonFloating>}
        {threadUnreadMentionedMessages.length > 0 &&
        <ButtonFloating onClick={this.onMentionedClicked} size="sm"
                        position={{right: 0, bottom: bottomButtonShowing && !this.gotoBottom ? 45 : 0}}>
          <Container className={style.MainMessages__MentionedButtonContainer}>
            <Shape color="accent">
              <ShapeCircle>{threadUnreadMentionedMessages.length}</ShapeCircle>
            </Shape>
          </Container>
          @
        </ButtonFloating>}
      </Container>
    )
  }
}