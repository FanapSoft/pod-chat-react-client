// app/AsideHead.js
import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {avatarUrlGenerator, OnWindowFocusInOut, avatarNameGenerator, socketStatus, routeChange} from "../utils/helpers";
import classnames from "classnames";

//strings
import strings from "../constants/localization";
import {
  CONTACT_ADDING, CONTACT_LIST_SHOWING, CONTACT_MODAL_CREATE_CHANNEL_SHOWING,
  CONTACT_MODAL_CREATE_GROUP_SHOWING
} from "../constants/actionTypes";
import {ROUTE_ADD_CONTACT, ROUTE_CONTACTS, ROUTE_CREATE_CHANNEL, ROUTE_CREATE_GROUP} from "../constants/routes";

//actions
import {contactAdding, contactListShowing, contactModalCreateGroupShowing} from "../actions/contactActions";
import {chatSearchShow} from "../actions/chatActions";

//UI components
import Dropdown, {DropdownItem} from "../../../pod-chat-ui-kit/src/menu/Dropdown";
import {ButtonFloating} from "../../../pod-chat-ui-kit/src/button"
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {MdMenu, MdClose, MdSearch, MdEdit, MdArrowBack} from "react-icons/md";
import Notification from "./Notification";

//styling
import style from "../../styles/app/AsidHead.scss";
import styleVar from "../../styles/variables.scss";
import utilsStlye from "../../styles/utils/utils.scss";

const statics = {
  headMenuSize: 59
};

@connect(store => {
  return {
    chatState: store.chatState,
    chatInstance: store.chatInstance.chatSDK,
    chatRouterLess: store.chatRouterLess,
    chatSearchShowing: store.chatSearchShow,
    chatRetryHook: store.chatRetryHook,
    chatSignOutHook: store.chatSignOutHook,
    smallVersion: store.chatSmallVersion,
    user: store.user.user
  };
})
class AsideHead extends Component {

  static defaultProps = {
    menuItems: [
      {
        name: strings.addContact,
        type: CONTACT_ADDING
      },
      {
        name: strings.contactList,
        type: CONTACT_LIST_SHOWING
      },
      {
        name: strings.createGroup(),
        type: CONTACT_MODAL_CREATE_GROUP_SHOWING
      },
      {
        name: strings.createGroup(true),
        type: CONTACT_MODAL_CREATE_CHANNEL_SHOWING
      },
      {
        name: strings.signedOut,
        type: "CHAT_SIGN_OUT"
      }
    ]
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      reConnecting: false,
      timeUntilReconnectTimer: null
    };
    this.container = React.createRef();
    this.onCloseMenu = this.onCloseMenu.bind(this);
    this.onOpenMenu = this.onOpenMenu.bind(this);
    this.onRetryClick = this.onRetryClick.bind(this);
    this.onChatSearchToggle = this.onChatSearchToggle.bind(this);
    OnWindowFocusInOut(e=>{}, e => {
      const {isDisconnected} = socketStatus(this.props.chatState);
      if (isDisconnected) {
        if (!this.state.reConnecting) {
          this.onRetryClick();
        }
      }
    })
  }

  componentDidUpdate(prevProps) {
    const {reConnecting, timeUntilReconnectTimer} = this.state;
    const {chatState} = this.props;
    if (reConnecting) {
      const {isConnected} = socketStatus(chatState);
      if (isConnected) {
        this.setState({
          reConnecting: false
        });
      }
    }
    if (chatState) {
      const {isDisconnected, timeUntilReconnect, isReconnecting} = socketStatus(chatState);
      const {isDisconnected: oldIsDisconnected, timeUntilReconnect: oldTimeUntilReconnect} = socketStatus(prevProps.chatState);

      if (isReconnecting) {
        clearInterval(this.timeRemainingToConnectIntervalId);
        if (timeUntilReconnectTimer) {
          this.setState({
            timeUntilReconnectTimer: null
          });
        }

      } else {
        if ((isDisconnected && !oldIsDisconnected) || (timeUntilReconnect !== oldTimeUntilReconnect)) {
          clearInterval(this.timeRemainingToConnectIntervalId);
          this.setState({
            timeUntilReconnectTimer: timeUntilReconnect / 1000
          });
          this.timeRemainingToConnectIntervalId = setInterval(() => {
            const {timeUntilReconnectTimer} = this.state;
            if (timeUntilReconnectTimer > 0) {
              this.setState({
                timeUntilReconnectTimer: timeUntilReconnectTimer - 1
              });
            } else {
              this.setState({
                timeUntilReconnectTimer: null
              });
              clearInterval(this.timeRemainingToConnectIntervalId);
            }
          }, 1000);
        }
      }
    }
  }

  onMenuSelect(type) {
    const {history, chatRouterLess, dispatch} = this.props;
    switch (type) {
      case CONTACT_ADDING:
        dispatch(contactAdding(true));
        routeChange(history, ROUTE_ADD_CONTACT, chatRouterLess);
        break;
      case CONTACT_LIST_SHOWING:
        dispatch(contactListShowing(true));
        routeChange(history, ROUTE_CONTACTS, chatRouterLess);
        break;
      case CONTACT_MODAL_CREATE_GROUP_SHOWING:
        dispatch(contactModalCreateGroupShowing(true));
        routeChange(history, ROUTE_CREATE_GROUP, chatRouterLess);
        break;
      case CONTACT_MODAL_CREATE_CHANNEL_SHOWING:
        dispatch(contactModalCreateGroupShowing(true, true));
        routeChange(history, ROUTE_CREATE_CHANNEL, chatRouterLess);
        break;
      default: {
        const {chatSignOutHook} = this.props;
        if (chatSignOutHook) {
          chatSignOutHook();
        }
      }
    }
  }

  onCloseMenu() {
    this.setState({
      isOpen: false
    });
  }

  onOpenMenu() {
    this.setState({
      isOpen: true
    });
  }

  onRetryClick() {
    this.setState({
      reConnecting: true
    });
    clearTimeout(this.timeOutForTryButton);
    this.timeOutForTryButton = setTimeout(() => {
      const {isDisconnected} = socketStatus(this.props.chatState);
      if (isDisconnected) {
        this.setState({
          reConnecting: false
        });
      }
    }, 5000);
    const {chatRetryHook, chatInstance} = this.props;
    if (chatRetryHook) {
      chatRetryHook().then(token => {
        chatInstance.setToken(token);
        chatInstance.reconnect();
      });
    }
  }

  onChatSearchToggle() {
    const {chatSearchShowing, dispatch} = this.props;
    dispatch(chatSearchShow(!chatSearchShowing));
  }

  render() {
    const {menuItems, chatState, chatInstance, smallVersion, chatSearchShowing, user} = this.props;
    const {isOpen, reConnecting, timeUntilReconnectTimer} = this.state;
    const {isReconnecting, isConnected, isDisconnected} = socketStatus(chatState);
    const iconSize = styleVar.iconSizeLg.replace("px", "");
    const iconMargin = `${(statics.headMenuSize - iconSize) / 2}px`;
    const firstInit = !chatInstance;
    const classNames = classnames({
      [style.AsideHead]: true,
      [style["AsideHead--smallVersion"]]: smallVersion
    });
    return (
      <Container className={classNames} ref={this.container} relative>
        <Notification/>
        <MdMenu size={iconSize}
                className={utilsStlye["u-clickable"]}
                onClick={this.onOpenMenu} style={{color: styleVar.colorWhite, margin: iconMargin}}/>
        <Container centerRight className={style.AsideHead__ConnectionHandlerContainer}>
          <Container inline>
            <Text size="lg" color="gray" light bold>
              {firstInit || reConnecting ? `${strings.chatState.connectingToChat}${reConnecting ? "" : "..."}` : isConnected ? strings.podchat : isReconnecting ? `${strings.chatState.reconnecting}...` : `${strings.chatState.networkDisconnected}...`}
            </Text>
          </Container>
          {isDisconnected && !reConnecting &&
          <Container inline onClick={this.onRetryClick}>
            <Text size="xs" color="gray" light linkStyle inline>{strings.tryAgain}</Text>
            {timeUntilReconnectTimer ? <Text size="xs" color="gray" light inline> ( {timeUntilReconnectTimer} )</Text> : ""}
          </Container>
          }
          {reConnecting &&
          <Container inline>
            <Loading><LoadingBlinkDots size="sm" invert/></Loading>
          </Container>
          }

        </Container>

        <Dropdown isOpen={isOpen} container={this.container} onClose={this.onCloseMenu}>
          <Container relative className={style.AsideHead__UserProfileContainer}>
            <Gap block x={20} y={20}>
              <Container topLeft>
                <Gap x={10} y={15} block>
                  <MdArrowBack size={styleVar.iconSizeMd} color={styleVar.colorBackgroundLight} style={{margin: "7px 0"}} onClick={this.onCloseMenu}/>
                </Gap>
              </Container>
              <Avatar>
                <AvatarImage src={avatarUrlGenerator(user.image, avatarUrlGenerator.SIZES.MEDIUM)}
                             text={avatarNameGenerator(user.name).letter}
                             textBg={avatarNameGenerator(user.name).color}
                             customSize="50px"/>
                <Container>
                  <AvatarName>
                    <Container>
                      <Text invert overflow="ellipsis">{user.name}</Text>
                    </Container>
                    <Container>
                      <Text size="xs" invert overflow="ellipsis">{user.cellphoneNumber}</Text>
                    </Container>
                  </AvatarName>
                </Container>
              </Avatar>
              <Text target="_blank" link="https://panel.pod.ir/Users/Info">
                <ButtonFloating onClick={this.onGotoBottomClicked} size="sm" style={{
                  backgroundColor: styleVar.colorAccentLight,
                  boxShadow: "none",
                  left: 5,
                  bottom: 5}}>
                  <MdEdit size={styleVar.iconSizeMd} style={{margin: "7px 5px"}}/>
                </ButtonFloating>
              </Text>
            </Gap>
          </Container>
          {menuItems.map(el => (
            <DropdownItem key={el.type} onSelect={this.onMenuSelect.bind(this, el.type)} invert>{el.name}</DropdownItem>
          ))}
        </Dropdown>
        <Container centerLeft>
          <Container inline cursor="pointer" className={style.AsideHead__SearchContainer} onClick={this.onChatSearchToggle}>
            {chatSearchShowing ?
              <MdClose size={styleVar.iconSizeMd} color={styleVar.colorWhite}/>
              :
              <MdSearch size={styleVar.iconSizeMd} color={styleVar.colorWhite}/>
            }
          </Container>
        </Container>
      </Container>
    )
  }
}

export default withRouter(AsideHead);