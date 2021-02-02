// src/list/Avatar.scss.js
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {
  mobileCheck,
  isGroup,
  isChannel,
} from "../utils/helpers";

//strings
import strings from "../constants/localization";

//actions
import {
  threadLeave,
  threadModalThreadInfoShowing, threadNotification, threadPinToTop, threadUnpinFromTop
} from "../actions/threadActions";
import {chatModalPrompt} from "../actions/chatActions";
import {messageSeen} from "../actions/messageActions";

//UI components
import Container from "../../../pod-chat-ui-kit/src/container";
import Context, {ContextItem} from "../../../pod-chat-ui-kit/src/menu/Context";
import {
  MdNotificationsOff,
  MdDelete,
  MdNotificationsActive,
  MdArrowBack
} from "react-icons/md";
import {
  AiFillPushpin
} from "react-icons/ai";

//styling
import style from "../../styles/app/AsideThreadsContextMenu.scss";
import styleVar from "../../styles/variables.scss";

@connect()
export default class AsideThreadsContextMenu extends Component {

  constructor(props) {
    super(props);
    this.state={thread: {}};
    this.onLeaveClick = this.onLeaveClick.bind(this);
    this.onPinClick = this.onPinClick.bind(this);
    this.onMuteClick = this.onMuteClick.bind(this);
    this.onMenuShow = this.onMenuShow.bind(this);
    this.onMenuHide = this.onMenuHide.bind(this);
    this.onLastMessageSeen = this.onLastMessageSeen.bind(this);
  }

  onLeaveClick() {
    const {dispatch} = this.props;
    const {thread} = this.state;
    const isP2P = !isChannel(thread) && !isGroup(thread);
    dispatch(chatModalPrompt(true, `${isP2P ? strings.areYouSureRemovingThread : strings.areYouSureAboutLeavingGroup(thread.title, isChannel(thread))}؟`, () => {
      dispatch(threadLeave(thread.id));
      dispatch(threadModalThreadInfoShowing());
      dispatch(chatModalPrompt());
    }, null, isP2P ? strings.remove : strings.leave));
  }

  onMuteClick() {
    const {dispatch} = this.props;
    const {thread} = this.state;
    dispatch(threadNotification(thread.id, !thread.mute));
  }

  onPinClick() {
    const {dispatch} = this.props;
    const {thread} = this.state;
    dispatch(thread.pin ? threadUnpinFromTop(thread.id) : threadPinToTop(thread.id));
  }

  onLastMessageSeen() {
    const {dispatch} = this.props;
    const {thread} = this.state;
    dispatch(messageSeen(thread.lastMessageVO));
  }

  onMenuShow(e) {
    const {onMenuShow} = this.props;
    this.setState({
      thread: e.detail.data
    });
    onMenuShow(e.detail.data.id);
  }

  onMenuHide() {
    setTimeout(() => {
      const {onMenuHide} = this.props;
      onMenuHide(false);
    }, 200);
  }

  render() {
    const {onThreadClick, pinedThread} = this.props;
    const {thread} = this.state;
    const isMobile = mobileCheck();
    return <Context id="aside-threads-context-menu" stickyHeader={isMobile} style={isMobile ? {height: "59px"} : null}
                    onShow={this.onMenuShow} onHide={this.onMenuHide}>
      {
        isMobile ?
          <Fragment>
            <Container className={style.AsideThreadsContextMenu__MenuActionContainer}>
              <ContextItem onClick={this.onLeaveClick}>
                <MdDelete size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
              </ContextItem>

              <ContextItem onClick={this.onMuteClick}>
                {
                  thread.mute ?
                    <MdNotificationsActive size={styleVar.iconSizeMd} color={styleVar.colorAccent}/> :
                    <MdNotificationsOff size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
                }
              </ContextItem>
              {
                ((thread.pin && pinedThread.length >= 5) || pinedThread.length < 5) &&
                <ContextItem onClick={this.onPinClick}>
                  {
                    thread.pin || pinedThread.length >= 5 ?
                      <Container relative><Container className={style.AsideThreadsContextMenu__UnpinLine}/><AiFillPushpin
                        size={styleVar.iconSizeMd} color={styleVar.colorAccent}/></Container> :
                      <AiFillPushpin size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
                  }
                </ContextItem>

              }
            </Container>

            <ContextItem className={style.AsideThreadsContextMenu__MobileMenuBack}>
              <MdArrowBack size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
            </ContextItem>

          </Fragment> :

          <Fragment>

            <ContextItem onClick={e=>onThreadClick(thread, e)}>
              {strings.openThread}
            </ContextItem>

            <ContextItem onClick={this.onLeaveClick}>
              {
                (isGroup(thread) || isChannel(thread)) ? strings.leave : strings.remove
              }
            </ContextItem>

            <ContextItem onClick={this.onMuteClick}>
              {thread.mute ? strings.unmute : strings.mute}
            </ContextItem>

            {
              ((thread.pin && pinedThread.length >= 5) || pinedThread.length < 5) &&
              <ContextItem onClick={this.onPinClick}>
                {
                  (thread.pin || pinedThread.length >= 5 ? strings.unpinFromTop : strings.pinToTop)
                }
              </ContextItem>

            }

            {
              thread.unreadCount > 0 &&
              <ContextItem onClick={this.onLastMessageSeen}>
                {strings.seenLastMessage}
              </ContextItem>

            }
          </Fragment>
      }
    </Context>
  }
}
