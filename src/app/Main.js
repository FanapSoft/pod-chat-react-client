// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";
import {Route, withRouter} from "react-router-dom";
import {mobileCheck} from "../utils/helpers";

//strings
import {
  ROUTE_THREAD,
  ROUTE_ADD_CONTACT,
  ROUTE_CONTACTS, ROUTE_USERNAME,
} from "../constants/routes";
import strings from "../constants/localization";

//actions
import {contactAdding, contactListShowing} from "../actions/contactActions";
import {threadInit, threadMessageGetList, threadParticipantList, threadShowing} from "../actions/threadActions";

//components
import MainHead from "./MainHead";
import MainMessages from "./MainMessages";
import MainFooter from "./MainFooter";
import Message from "../../../uikit/src/message";
import Gap from "../../../uikit/src/gap";
import {MdChat} from "react-icons/md";
import {Button} from "../../../uikit/src/button";
import Container from "../../../uikit/src/container";
import MainPinMessage from "./MainPinMessage";

//styling
import style from "../../styles/app/Main.scss";
import styleVar from "../../styles/variables.scss";
import MainAudioPlayer from "./MainAudioPlayer";


export function isMyThread(thread, user) {
  if (!thread || !user) {
    return false
  }
  if (thread.inviter.id === user.id) {
    return true
  }
}

export function isChannel(thread) {
  if (thread.group) {
    if (thread.type === 8) {
      return true;
    }
  }
  return false;
}

export function isGroup(thread) {
  if (thread.group) {
    if (thread.type !== 8) {
      return true;
    }
  }
  return false;
}


@connect(store => {
  return {
    thread: store.thread.thread,
    threadFetching: store.thread.fetching,
    threadShowing: store.threadShowing,
    chatRouterLess: store.chatRouterLess,
    chatAudioPlayer: store.chatAudioPlayer
  };
})
class Main extends Component {
  constructor(props) {
    super(props);
    this.onContactListShow = this.onContactListShow.bind(this);
    this.onAddMember = this.onAddMember.bind(this);
    this.mainMessagesRef = React.createRef();
  }

  componentDidUpdate({location: oldLocation}) {
    const {location, dispatch} = this.props;
    if (mobileCheck()) {
      if (oldLocation.pathname !== "/") {
        if (location.pathname === "/") {
          dispatch(threadInit());
        }
      }
    }
  }

  onContactListShow() {
    const {history, chatRouterLess, dispatch} = this.props;
    dispatch(contactListShowing(true));
    if (!chatRouterLess) {
      history.push(ROUTE_CONTACTS);
    }
  }

  onAddMember() {
    const {history, chatRouterLess, dispatch} = this.props;
    dispatch(contactAdding(true));
    if (!chatRouterLess) {
      history.push(ROUTE_ADD_CONTACT);
    }
  }

  render() {
    const {thread, threadFetching, chatAudioPlayer} = this.props;
    const {id, pinMessageVO} = thread;

    if (!id && !threadFetching) {
      return (
        <Container className={style.Main}>
          <Container className={style.Main__Cover}/>
          <Container center centerTextAlign>
            <Message size="lg">{strings.pleaseStartAThreadFirst}</Message>
            <Gap y={10} block/>
            <MdChat size={48} style={{color: styleVar.colorAccent}}/>
            <Container>
              <Button outlined onClick={this.onAddMember}>{strings.addContact}</Button>
              <Button outlined onClick={this.onContactListShow}>{strings.contactList}</Button>
            </Container>
          </Container>
        </Container>
      );
    }
    return (
      <Route path={[ROUTE_THREAD, ""]}
             render={props => {
               return (
                 <Container className={style.Main}>
                   <Container className={style.Main__Cover}/>
                   <MainHead/>
                   {
                     chatAudioPlayer &&
                     <MainAudioPlayer thread={thread} chatAudioPlayer={chatAudioPlayer}/>
                   }
                   {pinMessageVO &&
                   <MainPinMessage thread={thread} messageVo={pinMessageVO} mainMessageRef={this.mainMessagesRef}/>}

                   <MainMessages ref={this.mainMessagesRef}/>
                   <MainFooter/>
                 </Container>
               )
             }}>
      </Route>
    );
  }
}

export default withRouter(Main);
