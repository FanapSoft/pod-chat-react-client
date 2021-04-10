// src/list/Avatar.scss.js
import React, {Component, memo, Fragment} from "react";
import * as ReactDOM from 'react-dom'
import {Virtuoso, GroupedVirtuoso} from 'react-virtuoso'
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import classnames from "classnames";
import AsideThreadsContextMenu from "./AsideThreadsContextMenu";
import {
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
import List from "../../../pod-chat-ui-kit/src/list";
import Container from "../../../pod-chat-ui-kit/src/container";
import LoadingBlinkDots from "../../../pod-chat-ui-kit/src/loading/LoadingBlinkDots";
import Loading from "../../../pod-chat-ui-kit/src/loading";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import Message from "../../../pod-chat-ui-kit/src/message";
import AsideThreadsThread from "./AsideThreadsThread";
import AsideThreadsContact from "./AsideThreadsContact";

//styling
import style from "../../styles/app/AsideThreads.scss";



function PartialLoadingFragment() {
  return (
    <Container bottomCenter centerTextAlign style={{zIndex: 1}}>
      <Loading><LoadingBlinkDots size="sm" invert/></Loading>
    </Container>
  )
}

function NoResult() {
  return <Container relative centerTextAlign>
    <Gap y="8" x="5">
      <Text size="sm" color="gray">{strings.noResult}</Text>
    </Gap>
  </Container>
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
    user: store.user.user
  };
})
class AsideThreads extends Component {

  constructor(props) {
    super(props);
    this.onThreadClick = this.onThreadClick.bind(this);
    this.onStartChat = this.onStartChat.bind(this);
    this.onScrollBottomThreshold = this.onScrollBottomThreshold.bind(this);
    this.onMenuShow = this.onMenuShow.bind(this);
    this.onMenuHide = this.onMenuHide.bind(this);
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
    const classNames = classnames({
      [style.AsideThreads]: true,
      [style["AsideThreads--autoZIndex"]]: isIosAndSafari(),
      [style["AsideThreads--hiddenOverflow"]]: isMobile ? false : isMenuShow && true,
      [style["AsideThreads--isThreadShow"]]: threadShowing
    });
    let scrollerClassNames = classnames({
      [style.AsideThreads__Scroller]: true,
      [style["AsideThreads__Scroller--mobileVersion"]]: isMobile,
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

      return <Container className={classNames}>
        <AsideThreadsContextMenu onThreadClick={this.onThreadClick}
                                 onMenuShow={this.onMenuShow}
                                 onMenuHide={this.onMenuHide}
                                 pinedThread={pinedThread}/>
        {isMenuShow && <Container className={style.AsideThreads__Overlay} onContextMenu={e => {
          e.stopPropagation();
          e.preventDefault();
        }}/>}
        <List style={{height: "100%"}}>
          {isSearchResult &&
          <GroupedVirtuoso groupCounts={[filteredThreads.length || 1, filteredContacts.length || 1]}
                           className={scrollerClassNames}
                           topItemCount={0}
                           fixedItemHeight={79}
                           groupContent={index => {
                             return <Container className={style.AsideThreads__GroupsHead}><Gap y={8} x={5}>
                               <Container className={style.AsideThreads__GroupsHeadTextContainer}>
                                 <Text color="accent">{index === 0 ? strings.conversations : strings.contacts}</Text>
                               </Container>
                             </Gap>
                             </Container>
                           }
                           }
                           itemContent={(index, groupIndex) => {
                             if (groupIndex === 0) {
                               const thread = filteredThreads[index];
                               if (!thread) {
                                 return <NoResult/>
                               }
                               return <AsideThreadsThread $this={this}
                                                          onThreadClick={this.onThreadClick}
                                                          isMenuShow={isMenuShow}
                                                          activeThread={activeThread}
                                                          user={user}
                                                          thread={thread}/>
                             } else {
                               const contact = filteredContacts[index - filteredThreads.length];
                               if (!contact) {
                                 return <NoResult/>
                               }
                               return <AsideThreadsContact onStartChat={this.onStartChat} contact={contact}/>
                             }
                           }}/>
          }
          {!isSearchResult &&
          <Virtuoso data={filteredThreads}
                    endReached={()=> threadsHasNext && !threadsPartialFetching && !isSearchResult && this.onScrollBottomThreshold()}
                    className={scrollerClassNames}
                    fixedItemHeight={82.5}
                    itemContent={(index, el) =>
                      <AsideThreadsThread $this={this}
                                          onThreadClick={this.onThreadClick}
                                          isMenuShow={isMenuShow}
                                          activeThread={activeThread}
                                          user={user}
                                          thread={el}/>}/>
          }

        </List>
        {threadsPartialFetching && <PartialLoadingFragment/>}
      </Container>;
    }
  }
}

const exportDefault = withRouter(AsideThreads);
export {sanitizeRule, exportDefault as default};