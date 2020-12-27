// app/index.js
import React, {Component} from "react";
import {connect} from "react-redux";
import {Route, withRouter} from "react-router-dom";
import {statics as contactListStatics} from "./ModalContactList";
import classnames from "classnames";

//strings
import strings from "../constants/localization";
import {
  ROUTE_ADD_CONTACT,
  ROUTE_CONTACTS,
  ROUTE_CREATE_CHANNEL,
  ROUTE_CREATE_GROUP,
  ROUTE_SHARE,
  ROUTE_THREAD_INFO,
} from "../constants/routes";

//actions
import {contactGetList} from "../actions/contactActions";
import {
  chatClearCache, chatDestroy,
  chatNotification,
  chatNotificationClickHook,
  chatRetryHook,
  chatRouterLess,
  chatSetInstance,
  chatSignOutHook,
  chatSmallVersion
} from "../actions/chatActions";
import {
  threadCreateWithExistThread,
  threadCreateWithUser,
  threadGetList,
  threadParticipantList,
  threadShowing
} from "../actions/threadActions";
import {userGet} from "../actions/userActions";

//components
import Aside from "./Aside";
import Main from "./Main";
import LeftAside from "./LeftAside";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {ModalMedia} from "../../../pod-chat-ui-kit/src/modal";
import ModalContactListMenu from "./ModalContactListMenu";
import ModalAddContact from "./ModalAddContact";
import ModalThreadList from "./ModalThreadList";
import ModalCreateGroup from "./ModalCreateGroup";
import ModalThreadInfo from "./ModalThreadInfo";
import ModalImageCaption from "./ModalImageCaption";
import ModalPrompt from "./ModalPrompt";
import ModalShare from "./ModalShare";

//styling
import style from "../../styles/app/index.scss";
import {isChannel, isThreadOwner} from "../utils/helpers";


@connect(store => {
  return {
    chatInstance: store.chatInstance.chatSDK,
    chatRouterLess: store.chatRouterLess,
    user: store.user,
    thread: store.thread.thread,
    threadShowing: store.threadShowing,
    leftAsideShowing: store.threadLeftAsideShowing.isShowing,
    messageNew: store.messageNew
  };
}, null, null, {forwardRef: true})
class Index extends Component {
  constructor(props) {
    super(props);
    this.openThread = this.openThread.bind(this);
    this.modalDeleteMessagePromptRef = React.createRef();
    this.modalThreadListRef = React.createRef();
    this.modalMediaRef = React.createRef();
    this.modalImageCaptionRef = React.createRef();
    this.firstContactFetching = true;
    this.deletingDatabases = false;
  }

  componentDidUpdate(oldProps) {
    const {token, location, user: propsUser, chatInstance, dispatch, clearCache, thread, messageNew, onNewMessage, onReady} = this.props;
    const {token: oldToken, thread: oldThread, messageNew: oldMessageNew, user: oldUser, location: oldLocation} = oldProps;
    const {user, fetching: userFetching} = propsUser;

    //outside events handler
    if (onNewMessage) {
      if (!oldMessageNew && messageNew) {
        onNewMessage(messageNew);
      } else if (oldMessageNew) {
        if (oldMessageNew.id !== messageNew.id) {
          onNewMessage(messageNew, thread.id, thread);
        }
      }
    }
    if (onReady) {
      if (user.id !== oldUser.id) {
        onReady(user, chatInstance, this);
      }
    }
    //

    if (!thread.onTheFly) {
      if ((!oldThread.id && thread.id) || (oldThread.id !== thread.id)) {
        if (isChannel(thread)) {
          if (isThreadOwner(thread, user)) {
            dispatch(threadParticipantList(thread.id));
          }
        } else {
          dispatch(threadParticipantList(thread.id));
        }
      }
    }

    if (oldLocation.pathname !== location.pathname) {
      if (location.pathname === "/") {
        this.resetChat();
      }
    }

    if (oldToken) {
      if (oldToken !== token) {
        this.setToken(token);
      }
    }

    if (chatInstance) {
      if (this.firstContactFetching) {
        dispatch(contactGetList(contactListStatics.offset, contactListStatics.count));
        this.firstContactFetching = false;
      }
      if (clearCache && !this.deletingDatabases) {
        this.deletingDatabases = true;
        dispatch(chatClearCache());
      }
      if (!user.id) {
        if (!userFetching) {
          dispatch(userGet(chatInstance));
        }
      }
    }
  }

  resetChat() {
    const {dispatch} = this.props;
    dispatch(threadShowing(false));
    const closeModal = modal => modal.current.onClose();
    closeModal(this.modalDeleteMessagePromptRef);
    closeModal(this.modalThreadListRef);
    closeModal(this.modalImageCaptionRef);
    this.modalMediaRef.current.close();
  }

  componentDidMount() {
    const {small, routerLess, dispatch, disableNotification, onNotificationClickHook, onRetryHook, onSignOutHook} = this.props;
    dispatch(chatSetInstance(this.props));
    if (small) {
      dispatch(chatSmallVersion(small))
    }
    if (routerLess) {
      dispatch(chatRouterLess(routerLess))
    }
    if (disableNotification) {
      dispatch(chatNotification(false));
    }
    if (onNotificationClickHook) {
      dispatch(chatNotificationClickHook(onNotificationClickHook));
    }
    if (onRetryHook) {
      dispatch(chatRetryHook(onRetryHook));
    }
    if (onSignOutHook) {
      dispatch(chatSignOutHook(onSignOutHook));
    }
    window.modalMediaRef = this.modalMediaRef.current;
  }

  componentWillUnmount() {
    const {dispatch, chatInstance} = this.props;
    dispatch(chatDestroy());
    chatInstance.logout();
  }

  setToken(token) {
    const {chatInstance} = this.props;
    if (chatInstance) {
      chatInstance.setToken(token);
    }
  }

  /*----outside api---*/
  openThread(thread) {
    const {dispatch} = this.props;
    if (thread instanceof Object) {
      dispatch(threadCreateWithExistThread(thread));
      return;
    }
    dispatch(threadCreateWithUser(thread, "TO_BE_USER_ID"));
  }
  refreshThreads() {
    const {dispatch} = this.props;
    dispatch(threadGetList(0, 50));
  }
  /*----outside api---*/

  render() {
    const {threadShowing, customClassName, leftAsideShowing, small, chatRouterLess} = this.props;
    const classNames = classnames({
      [customClassName]: customClassName,
      [style.Index]: true,
      [style["Index--small"]]: small,
      [style["Index--isThreadShow"]]: threadShowing,
      [style["Index--isAsideLeftShow"]]: leftAsideShowing
    });
    const popups = (
      <Container>
        <Route exact={!chatRouterLess} path={chatRouterLess ? "" : [ROUTE_CREATE_GROUP, ROUTE_CREATE_CHANNEL]}
               render={() => <ModalCreateGroup smallVersion={small}/>}/>
        <Route exact={!chatRouterLess} path={chatRouterLess ? "" : ROUTE_CONTACTS}
               render={() => <ModalContactListMenu smallVersion={small}/>}/>
        <Route exact={!chatRouterLess} path={chatRouterLess ? "" : ROUTE_ADD_CONTACT}
               render={() => <ModalAddContact smallVersion={small}/>}/>
        <Route exact={!chatRouterLess} path={chatRouterLess ? "" : ROUTE_SHARE}
               render={() => <ModalShare smallVersion={small}/>}/>
        <Route exact={!chatRouterLess} path={chatRouterLess ? "" : ROUTE_THREAD_INFO}
               render={() => <ModalThreadInfo smallVersion={small}/>}/>
        <ModalThreadList smallVersion={small} ref={this.modalThreadListRef}/>
        <ModalImageCaption smallVersion={small} ref={this.modalImageCaptionRef}/>
        <ModalMedia selector={`.${style.Index__MediaTrigger} a:visible`}
                    ref={this.modalMediaRef}
                    lang="fa"
                    i18n={{fa: strings.modalMedia}}
                    backFocus={false}/>
        <ModalPrompt smallVersion={small} ref={this.modalDeleteMessagePromptRef}/>
      </Container>
    );

    return (
      <Container className={classNames}>
        {popups}
        <Container className={style.Index__Aside}>
          <Aside/>
        </Container>
        <Container className={style.Index__Main}>
          <Main/>
        </Container>
        <Container className={style.Index__AsideLeft}>
          <LeftAside/>
        </Container>
      </Container>
    );
  }
}

export default withRouter(Index);


export function IndexModalMediaFragment({link, caption, linkClassName, children, options}) {
  const fixedOptions = options || {};

  return <Container className={style.Index__MediaTrigger} inline>
    <Text link={link}
          target={"_blank"}
          className={linkClassName}
          linkClearStyle
          data-options={JSON.stringify(fixedOptions)}>
      {children && children}
    </Text>

  </Container>
}