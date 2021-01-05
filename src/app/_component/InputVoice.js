// src/list/BoxScene.jss
import React, {Component} from "react";
import moment from "moment";
import {connect} from "react-redux";
import classnames from "classnames";
import {checkForMediaAccess, mobileCheck} from "../../utils/helpers";

//strings
import strings from "../../constants/localization";
import {types} from "../../constants/messageTypes";

//actions
import {
  chatAudioRecorder as chatAudioRecorderAction
} from "../../actions/chatActions";
import {messageEditing as messageEditingAction, messageFileReply, messageSendFile} from "../../actions/messageActions";

//components
import Container from "../../../../pod-chat-ui-kit/src/container";
import InputVoiceRecorder from "./InputVoiceRecorder";

//styling
import {MdMic, MdMicOff, MdStop} from "react-icons/md";
import style from "../../../styles/modules/InputVoiceRecorder.scss";
import styleVar from "../../../styles/variables.scss";


export const constants = {
  replying: "REPLYING",
  forwarding: "FORWARDING"
};

@connect(store => {
  return {
    threadFilesToUpload: store.threadFilesToUpload,
    messageEditing: store.messageEditing,
    thread: store.thread.thread,
    isSendingText: store.threadIsSendingMessage
  };
})
export default class InputEmojiTrigger extends Component {

  constructor(props) {
    super(props);
    this.stream = null;
    this.onClick = this.onClick.bind(this);
    this.onStop = this.onStop.bind(this);
    this.lastThread = this.props.thread;
    this.state = {
      mic: true
    }
  }

  componentDidMount() {
    if (navigator.permissions) {
      navigator.permissions.query(
        {name: 'microphone'}
      ).then((permissionStatus) => {
        if (permissionStatus.state === "denied") {
          this.setState({
            mic: false
          });
        }
      })
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {thread, chatAudioRecorder, dispatch} = this.props;
    if ((prevProps.thread && prevProps.thread.id) !== thread.id) {
      if (chatAudioRecorder) {
        dispatch(chatAudioRecorderAction(false));
      }
    }
  }

  onClick() {
    const {chatAudioRecorder, thread, dispatch} = this.props;
    const {mic} = this.state;
    if (!mic) {
      return alert(strings.youCannotUseMicrophone)
    }
    checkForMediaAccess().then(({hasMicrophone, isMicrophoneAlreadyCaptured}) => {
      if (hasMicrophone && !isMicrophoneAlreadyCaptured) {
        navigator.mediaDevices.getUserMedia({audio: true})
          .then((stream) => {
            if (!chatAudioRecorder) {
              this.lastThread = thread;
            }
            this.stream = stream;
            dispatch(chatAudioRecorderAction(!chatAudioRecorder));
          })
          .catch((err) => {
            this.setState({
              mic: false
            });
            alert(strings.youCannotUseMicrophone)
          });

        this.setState({
          mic: true
        });
      } else if (hasMicrophone && isMicrophoneAlreadyCaptured) {
        if(!this.stream) {
          navigator.mediaDevices.getUserMedia({audio: true})
            .then((stream) => {
              this.stream = stream;
              if (!chatAudioRecorder) {
                this.lastThread = thread;
              }
              dispatch(chatAudioRecorderAction(!chatAudioRecorder));
            });
        } else {
          if (!chatAudioRecorder) {
            this.lastThread = thread;
          }
          dispatch(chatAudioRecorderAction(!chatAudioRecorder));
        }

      }
    });
  }

  onStop(recordedBlob) {
    this.stream = null;
    const {chatAudioRecorder, messageEditing, dispatch, thread} = this.props;
    if (chatAudioRecorder === "CANCELED") {
      return dispatch(chatAudioRecorderAction(false));
    }
    if (this.lastThread.id !== thread.id) {
      return;
    }
    if (recordedBlob.stopTime - recordedBlob.startTime < 1000) {
      return;
    }
    recordedBlob.blob.lastModifiedDate = new Date();
    recordedBlob.blob.name = `voice-${moment(new Date()).format("YYYY-MM-DD-HH:mm")}`;
    if (messageEditing) {
      if (messageEditing.type === constants.replying) {
        dispatch(messageEditingAction());
        return dispatch(messageFileReply(recordedBlob.blob, thread, messageEditing.message.id, null, messageEditing.message, {messageType: types.voice}));
      }
    }
    dispatch(messageSendFile(recordedBlob.blob, thread, null, {messageType: types.voice}));
  }


  render() {
    const {chatAudioRecorder} = this.props;
    const {mic} = this.state;
    const classNames =
      classnames({
        [style.InputVoiceRecorder]: true,
        [style["InputVoiceRecorder--noMobile"]]: !mobileCheck(),
        [style["InputVoiceRecorder--recording"]]: chatAudioRecorder
      });
    return (
      <Container inline className={classNames} relative onClick={this.onClick}>
        {chatAudioRecorder ?
          <MdStop size={styleVar.iconSizeMd}
                  color={styleVar.colorAccentDark}
                  style={{margin: "3px 4px"}}/>
          :
          mic ?
            <MdMic size={styleVar.iconSizeMd}
                   color={styleVar.colorAccentDark}
                   style={{margin: "3px 4px"}}/>
            :
            <MdMicOff size={styleVar.iconSizeMd}
                      color={styleVar.colorGrayDark}
                      style={{margin: "3px 4px"}}/>
        }


        <InputVoiceRecorder stream={this.stream} chatAudioRecorder={chatAudioRecorder} onStop={this.onStop}/>

      </Container>
    );
  }
}