import React, {Fragment, Component} from "react";
import {isChannel, isGroup, isMessageByMe, mobileCheck} from "../utils/helpers";

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
import {connect} from "react-redux";
import {threadLeftAsideShowing, threadModalListShowing} from "../actions/threadActions";
import {THREAD_LEFT_ASIDE_SEEN_LIST} from "../constants/actionTypes";
import {chatModalPrompt} from "../actions/chatActions";
import {MessageDeletePrompt, PinMessagePrompt} from "./_component/prompts";
import MainMessagesMessageShare from "./MainMessagesMessageShare";
import {messageEditing} from "../actions/messageActions";
import checkForPrivilege from "../utils/privilege";
import {THREAD_ADMIN} from "../constants/privilege";

@connect(store => {
  return {
    supportMode: store.chatSupportMode
  };
})
export default class AsideThreadsContextMenu extends Component {
  constructor(props) {
    super(props);
    const {thread, supportMode} = props;
    this.state = {message: {}};
    this.isMobile = mobileCheck();
    this.isChannel = isChannel(thread);
    this.isGroup = isGroup(thread);
    this.isOwner = (this.isChannel || this.isGroup) && checkForPrivilege(thread, THREAD_ADMIN);
    this.deleteCondition = false;
    this.pinToTopCondition = this.isOwner;
    this.replyCondition = !this.isChannel || this.isOwner;
    this.messageInfoCondition = false;
    this.isMessageByMe = false;
    this.shareCondition = this.forwardCondition = !supportMode;
    this.onDelete = this.onDelete.bind(this);
    this.onForward = this.onForward.bind(this);
    this.onReply = this.onReply.bind(this);
    this.onShare = this.onShare.bind(this);
    this.onPin = this.onPin.bind(this);
    this.onMessageInfo = this.onMessageInfo.bind(this);
  }

  onMenuShow(e) {
    const {thread, user, supportMode} = this.props;
    const instance = this.instance = e.detail.data.instance;
    const {message} = instance.props;
    const isMessageByMeResult = isMessageByMe(message, user, thread);
    this.isMessageByMe = !this.isChannel || isMessageByMeResult;
    this.messageInfoCondition = !supportMode && ((this.isGroup || this.isChannel) && (this.isOwner || isMessageByMeResult));
    this.deleteCondition = !supportMode && (this.isMessageByMe || this.isOwner);
    this.setState({
      message
    });
  }

  onMessageInfo(e) {
    const {dispatch} = this.props;
    const {message} = this.state;
    e.stopPropagation();
    dispatch(threadLeftAsideShowing(true, THREAD_LEFT_ASIDE_SEEN_LIST, message.id));
  }

  onPin() {
    const {dispatch} = this.props;
    const {message} = this.state;
    dispatch(chatModalPrompt(true,
      null, null, null, null,
      <PinMessagePrompt message={message} dispatch={dispatch}/>));
  }

  onShare() {
    const {dispatch} = this.props;
    const {message} = this.state;
    dispatch(chatModalPrompt(true,
      null, null, null, null,
      <MainMessagesMessageShare message={message}/>));
  }

  onDelete(e) {
    const {dispatch, user, thread} = this.props;
    const {message} = this.state;
    dispatch(chatModalPrompt(true,
      null, null, null, null,
      <MessageDeletePrompt thread={thread} message={message} dispatch={dispatch} user={user}/>));
  }

  onForward() {
    const {dispatch} = this.props;
    const {message} = this.state;
    dispatch(threadModalListShowing(true, message));
  }

  onReply() {
    const {dispatch} = this.props;
    const {message} = this.state;
    dispatch(messageEditing(message, "REPLYING"));
  }

  render() {
    const {supportMode} = this.props;
    const MobileContextMenu = () => {
      return <Fragment>
        <Container className={style.MainMessagesMessageBoxControl__MenuActionContainer}>
          {
            this.deleteCondition &&
            <ContextItem onClick={this.onDelete}>
              <MdDelete size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
            </ContextItem>
          }

          {
            this.forwardCondition &&
            <ContextItem onClick={this.onForward}>
              <TiArrowForward size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
            </ContextItem>
          }


          {
            this.replyCondition &&
            <ContextItem onClick={this.onReply}>
              <MdReply size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
            </ContextItem>
          }

          {
            this.pinToTopCondition &&
            <ContextItem onClick={this.onPin}>
              <AiFillPushpin size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
            </ContextItem>
          }

          {
            this.messageInfoCondition &&
            <ContextItem onClick={this.onMessageInfo}>
              <MdInfoOutline size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
            </ContextItem>
          }

          {
            this.instance && this.instance.createContextMenuChildren && this.instance.createContextMenuChildren()
          }

          {
            this.shareCondition &&
            <ContextItem onClick={this.onShare}>
              <MdShare size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
            </ContextItem>
          }
        </Container>

        <ContextItem className={style.MainMessagesMessageBoxControl__MobileMenuBack}>
          <MdArrowBack size={styleVar.iconSizeMd} color={styleVar.colorAccent}/>
        </ContextItem>
      </Fragment>
    };
    return <Context id={"messages-context-menu"} preventHideOnScroll={false} rtl stickyHeader={mobileCheck()}
                    onShow={this.onMenuShow.bind(this)}
                    style={mobileCheck() ? {height: "59px"} : null}>
      {this.isMobile ? <MobileContextMenu/> :
        <Fragment>
          {
            this.deleteCondition &&
            <ContextItem onClick={this.onDelete}>
              {strings.remove}
            </ContextItem>
          }

          {
            this.forwardCondition &&
            <ContextItem onClick={this.onForward}>
              {strings.forward}
            </ContextItem>
          }


          {
            this.replyCondition &&
            <ContextItem onClick={this.onReply}>
              {strings.reply}
            </ContextItem>
          }

          {
            this.pinToTopCondition &&
            <ContextItem onClick={this.onPin}>
              {strings.pinToTop}
            </ContextItem>
          }

          {
            this.messageInfoCondition &&
            <ContextItem onClick={this.onMessageInfo}>
              {strings.messageInfo}
            </ContextItem>
          }

          {
            this.instance && this.instance.createContextMenuChildren && this.instance.createContextMenuChildren()
          }

          {
            this.shareCondition &&
            <ContextItem onClick={this.onShare}>
              {strings.share}
            </ContextItem>
          }
        </Fragment>
      }
    </Context>
  }

}