// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";
import {Route, withRouter} from "react-router-dom";
import {mobileCheck} from "../utils/helpers";

//strings
import {
  ROUTE_THREAD
} from "../constants/routes";

//actions
import {threadInit} from "../actions/threadActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import MainHead from "./MainHead";
import MainMessages from "./MainMessages";
import MainFooter from "./MainFooter";
import MainPinMessage from "./MainPinMessage";
import MainIntro from "./MainIntro";

//styling
import style from "../../styles/app/Main.scss";
import MainAudioPlayer from "./MainAudioPlayer";


@connect(store => {
  return {
    thread: store.thread.thread,
    threadFetching: store.thread.fetching,
    chatRouterLess: store.chatRouterLess,
    chatAudioPlayer: store.chatAudioPlayer
  };
})
class Main extends Component {

  constructor(props) {
    super(props);
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

  render() {
    const {thread, chatRouterLess, threadFetching, chatAudioPlayer, history} = this.props;
    const {id, pinMessageVO} = thread;

    if (!id && !threadFetching) {
      return (
        <Container className={style.Main}>
          <Container className={style.Main__Cover}/>
          <MainIntro chatRouterLess={chatRouterLess}/>
        </Container>
      )
    }

    return (
      <Route path={[ROUTE_THREAD, ""]}
             render={() => {
               return (
                 <Container className={style.Main}>
                   <Container className={style.Main__Cover}/>
                   <MainHead thread={thread} chatRouterLess={chatRouterLess} history={history}/>

                   {
                     chatAudioPlayer &&
                     <MainAudioPlayer thread={thread} chatAudioPlayer={chatAudioPlayer}/>
                   }
                   {
                     pinMessageVO &&
                     <MainPinMessage thread={thread} messageVo={pinMessageVO} mainMessageRef={this.mainMessagesRef}/>
                   }

                   <MainMessages thread={thread} ref={this.mainMessagesRef}/>
                   <MainFooter/>
                 </Container>
               )
             }}>
      </Route>
    );
  }
}

export default withRouter(Main);
