import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import checkForPrivilege from "../utils/privilege";

//actions
import {threadCreateWithExistThread, threadGoToMessageId, threadMessageUnpin} from "../actions/threadActions";

//components
import Container from "../../../uikit/src/container";
import {Text} from "../../../uikit/src/typography";
import Loading, {LoadingBlinkDots} from "../../../uikit/src/loading";
import {
  AiFillPushpin
} from "react-icons/ai";

//styling
import {
  MdClose,
  MdPlayArrow,
  MdPause
} from "react-icons/md";
import style from "../../styles/app/MainPinMessage.scss";
import styleVar from "../../styles/variables.scss";
import {chatAudioPlayer} from "../actions/chatActions";

@connect()
export default class MainAudioPlayer extends Component {

  constructor(props) {
    super(props);
    this.onAudioPlayerClick = this.onAudioPlayerClick.bind(this);
    this.onStopPlayingClick = this.onStopPlayingClick.bind(this);
  }

  onAudioPlayerClick() {
    const {chatAudioPlayer, thread: currentThread, dispatch} = this.props;
    const {thread, message} = chatAudioPlayer;
    if (thread.id === currentThread.id) {
      dispatch(threadGoToMessageId(message.time));
    } else {
      thread.gotoMessage = message.time;
      dispatch(threadCreateWithExistThread(thread));
    }
  }

  onStopPlayingClick(e) {
    e.stopPropagation();
    const {dispatch} = this.props;
    dispatch(chatAudioPlayer());
  }

  onPausePlayingClick(playing, e) {
    e.stopPropagation();
    const {chatAudioPlayer: chatAudioPlayerObject, dispatch} = this.props;
    chatAudioPlayerObject.player.playPause();
    dispatch(chatAudioPlayer({...chatAudioPlayerObject, playing}));
  }

  render() {
    const {chatAudioPlayer} = this.props;
    const {message, playing} = chatAudioPlayer;
    const metaData = typeof message.metadata === "string" ? JSON.parse(message.metadata) : message.metadata;
    const messageDetailsClassNames = classnames({
      [style.MainPinMessage__MessageDetails]: true
    });
    return <Container className={style.MainPinMessage} onClick={this.onAudioPlayerClick}>

      <Container className={style.MainPinMessage__Message}>
        <Container className={style.MainPinMessage__MessageIcon}>
          {playing ?
            <MdPause size={styleVar.iconSizeMd} color={styleVar.colorAccent} style={{margin: "-3px"}} onClick={this.onPausePlayingClick.bind(this, false)}/>
            :
            <MdPlayArrow size={styleVar.iconSizeMd} color={styleVar.colorAccent} style={{margin: "-3px"}} onClick={this.onPausePlayingClick.bind(this, true)}/>
          }
        </Container>
        <Container className={messageDetailsClassNames}>
          <Text isHTML>
            {metaData.name}
          </Text>
        </Container>
      </Container>
      <Container className={style.MainPinMessage__CloseIcon} onClick={this.onStopPlayingClick}>
        <MdClose size={styleVar.iconSizeMd} color={styleVar.colorTextLight}/>
      </Container>

    </Container>
  }
}