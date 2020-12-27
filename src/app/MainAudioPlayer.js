import React, {Component} from "react";
import {connect} from "react-redux";

//actions
import {threadCreateWithExistThread, threadGoToMessageId} from "../actions/threadActions";
import {chatAudioPlayer} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {
  MdClose,
  MdPlayArrow,
  MdPause
} from "react-icons/md";

//styling
import style from "../../styles/app/MainAudioPlayer.scss";
import styleVar from "../../styles/variables.scss";
import {getMessageMetaData} from "../utils/helpers";


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
    const metaData = getMessageMetaData(message);
    return <Container className={style.MainAudioPlayer} onClick={this.onAudioPlayerClick}>

      <Container className={style.MainAudioPlayer__Message}>
        <Container className={style.MainAudioPlayer__MessageIcon}>
          {playing ?
            <MdPause size={styleVar.iconSizeMd} color={styleVar.colorAccent} style={{margin: "-3px"}} onClick={this.onPausePlayingClick.bind(this, false)}/>
            :
            <MdPlayArrow size={styleVar.iconSizeMd} color={styleVar.colorAccent} style={{margin: "-3px"}} onClick={this.onPausePlayingClick.bind(this, true)}/>
          }
        </Container>
        <Container className={style.MainAudioPlayer__MessageDetails}>
          <Text isHTML>
            {metaData.name}
          </Text>
        </Container>
      </Container>
      <Container className={style.MainAudioPlayer__CloseIcon} onClick={this.onStopPlayingClick}>
        <MdClose size={styleVar.iconSizeMd} color={styleVar.colorTextLight}/>
      </Container>

    </Container>
  }
}