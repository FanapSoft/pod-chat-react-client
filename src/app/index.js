// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";
import {Route, withRouter} from "react-router-dom";
import {statics as contactListStatics} from "./ModalContactList";
import classnames from "classnames";

//strings
import strings from "../constants/localization";
import {
  ROUTE_ADD_CONTACT,
  ROUTE_CONTACTS, ROUTE_CREATE_CHANNEL,
  ROUTE_CREATE_GROUP, ROUTE_SHARE, ROUTE_THREAD,
  ROUTE_THREAD_INFO, ROUTE_USERNAME
} from "../constants/routes";

//actions
import {
  chatClearCache, chatDestroy,
  chatNotification,
  chatNotificationClickHook, chatRetryHook,
  chatRouterLess,
  chatSetInstance, chatSignOutHook,
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
import Container from "../../../uikit/src/container";
import {Text} from "../../../uikit/src/typography";
import {ModalMedia} from "../../../uikit/src/modal";
import ModalContactListMenu from "./ModalContactListMenu";
import ModalAddContact from "./ModalAddContact";
import ModalThreadList from "./ModalThreadList";
import ModalCreateGroup from "./ModalCreateGroup";
import ModalThreadInfo from "./ModalThreadInfo";
import ModalImageCaption from "./ModalImageCaption";
import ModalPrompt from "./ModalPrompt";

//styling
import style from "../../styles/app/index.scss";
import {contactGetList} from "../actions/contactActions";
import ModalShare from "./ModalShare";

export function BoxModalMediaFragment({link, caption, linkClassName, children, options}) {
  const fixedOptions = options || {};

  return <Container className={style.Box__MediaTrigger} inline>
    <Text link={link}
          className={linkClassName}
          linkClearStyle
          data-options={JSON.stringify(fixedOptions)}>
      {children && children}
    </Text>

  </Container>
}

@connect(store => {
  return {
    chatInstance: store.chatInstance.chatSDK,
    chatRouterLess: store.chatRouterLess,
    user: store.user.user,
    userFetching: store.user.fetching,
    threadShowing: store.threadShowing,
    leftAsideShowing: store.threadLeftAsideShowing.isShowing,
    thread: store.thread.thread,
    messageNew: store.messageNew
  };
}, null, null, {withRef: true})
class Box extends Component {
  constructor(props) {
    super(props);
    this.openThread = this.openThread.bind(this);
    this.modalDeleteMessagePromptRef = React.createRef(this.modalDeleteMessagePromptRef);
    this.modalThreadListRef = React.createRef(this.modalThreadListRef);
    this.modalMediaRef = React.createRef(this.modalMediaRef);
    this.modalImageCaptionRef = React.createRef(this.modalImageCaptionRef);
    this.firstContactFetching = true;
    this.deletingDatabases = false;
  }

  componentDidUpdate(oldProps) {
    const {token, location, user, userFetching, chatInstance, dispatch, clearCache, thread, messageNew, onNewMessage, onReady} = this.props;
    const {token: oldToken, thread: oldThread, messageNew: oldMessageNew, user: oldUser} = oldProps;

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

    if (!thread.onTheFly) {
      if ((oldThread.id !== thread.id) || (!oldThread.id && thread.id)) {
        if (thread.type === 8) {
          if (thread.inviter.id === user.id) {
            dispatch(threadParticipantList(thread.id));
          }
        } else {
          dispatch(threadParticipantList(thread.id));
        }
      }
    }

    if (oldProps.location.pathname !== location.pathname) {
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
    const closeModal = modal => modal.current.getWrappedInstance().onClose();
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
    if (this.props.chatInstance) {
      this.props.chatInstance.setToken(token);
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
    let classNames = classnames({
      [customClassName]: customClassName,
      [style.Box]: true,
      [style["Box--small"]]: small,
      [style["Box--isThreadShow"]]: threadShowing,
      [style["Box--isAsideLeftShow"]]: leftAsideShowing
    });
    const modalMediaI18n = {
      fa: strings.modalMedia
    };
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
        <ModalMedia selector={`.${style.Box__MediaTrigger} a:visible`}
                    ref={this.modalMediaRef}
                    lang="fa"
                    i18n={modalMediaI18n}
                    backFocus={false}/>
        <ModalPrompt smallVersion={small} ref={this.modalDeleteMessagePromptRef}/>
      </Container>
    );

    return (
      <Container className={classNames}>
        {popups}
        <Container className={style.Box__Aside}>
          <Aside/>
        </Container>
        <Container className={style.Box__Main}>
          <Main/>
        </Container>
        <Container className={style.Box__AsideLeft}>
          <LeftAside/>
        </Container>
      </Container>
    );
  }
}

export default withRouter(Box);