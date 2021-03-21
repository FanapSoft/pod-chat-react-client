// src/list/BoxSceneMessagesText
import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import "moment/locale/fa";
import {
  getImage,
  getMessageMetaData,
  humanFileSize, isMessageHasError,
  isMessageIsDownloadable,
  isMessageIsImage,
  isMessageIsSound,
  isMessageIsUploading,
  isMessageIsVideo,
  isMessageIsVoice,
  mobileCheck
} from "../utils/helpers";

import {cancelDownload, getFile, getFileDownloading, updateLink} from "../utils/hashmap";


//strings
import strings from "../constants/localization";

//actions
import {
  messageSendingError,
  messageCancelFile,
  messageSendFile,
} from "../actions/messageActions";

//components
import {
  MdArrowDownward,
  MdMic
} from "react-icons/md";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {ContextItem} from "../../../pod-chat-ui-kit/src/menu/Context";

import MainMessagesMessageFileVideo from "./MainMessagesMessageFileVideo";
import MainMessagesMessageFileSound from "./MainMessagesMessageFileSound";
import MainMessagesMessageFileImage from "./MainMessagesMessageFileImage";
import MainMessagesMessageFileProgress from "./MainMessagesMessageFileProgress";
import MainMessagesMessageFileControlIcon from "./MainMessagesMessageFileControlIcon";
import MainMessagesMessageFileCaption from "./MainMessagesMessageFileCaption";
import MainMessagesMessageBox from "./MainMessagesMessageBox";
import MainMessagesMessageBoxHighLighter from "./MainMessagesMessageBoxHighLighter";
import MainMessagesMessageBoxFooter from "./MainMessagesMessageBoxFooter";
import MainMessagesMessageBoxSeen from "./MainMessagesMessageBoxSeen";

//styling
import style from "../../styles/app/MainMessagesMessageFile.scss";
import styleVar from "../../styles/variables.scss";


@connect(store => {
  return {
    smallVersion: store.chatSmallVersion,
    leftAsideShowing: store.threadLeftAsideShowing.isShowing,
    chatAudioPlayer: store.chatAudioPlayer
  };
})
class MainMessagesMessageFile extends Component {

  constructor(props) {
    super(props);
    const {leftAsideShowing, smallVersion, message, setInstance} = props;
    const metaData = getMessageMetaData(message);
    const isImageReal = isMessageIsImage(message) || (isMessageIsImage(message) && !message.id);
    this.state = {
      isImage: isImageReal,
      imageIsSuitableSize: isImageReal && getImage(metaData, message.id, smallVersion || leftAsideShowing),
      isVideo: isMessageIsVideo(message),
      isSound: isMessageIsSound(message),
      isVoice: isMessageIsVoice(message),
      isFile: !isMessageIsSound(message) && !isMessageIsVideo(message) && !isImageReal,
      file: null,
      metaData
    };
    this.onCancelDownload = this.onCancelDownload.bind(this);
    this.setShowProgress = this.setShowProgress.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onRetry = this.onRetry.bind(this);
    this.setPlayTrigger = this.setPlayTrigger.bind(this);
    this.setPlayAfterDownloadTrigger = this.setPlayAfterDownloadTrigger.bind(this);
    this.setJustMountedTrigger = this.setJustMountedTrigger.bind(this);
    this.playTrigger = null;
    this.playAfterDownloadTrigger = null;
    this.justMountedTrigger = null;
    this.downloadTriggerRef = React.createRef();
    this.isDownloading = getFileDownloading(metaData.fileHash) === true;
    this.isPlayable = null;
    this.mainMessagesMessageRef = setInstance(this);
  }

  componentDidMount() {
    const {isImage, imageIsSuitableSize, metaData} = this.state;
    if (isImage && imageIsSuitableSize) {
      window.addEventListener("resize", e => {
        this.setState({
          imageIsSuitableSize
        });
      });
    }
    const fileResult = getFileDownloading(metaData.fileHash);
    const result = typeof fileResult === "string" && fileResult.indexOf("http") > -1 ? fileResult : null;
    if (result) {
      const downloadRef = this.downloadTriggerRef.current;
      if (!downloadRef.href) {
        if (this.justMountedTrigger) {
          this.justMountedTrigger(result);
        }
        this.buildDownloadAndPlayComponent(true, result);
      }
    }
  }

  componentDidUpdate(oldProps, oldState) {
    const {message, dispatch} = this.props;

    if (message) {
      if (message.progress) {
        if (!message.hasError) {
          if (isMessageHasError(message)) {
            dispatch(messageSendingError(message.threadId, message.uniqueId));
          }
        }
      }
    }

    const downloadRef = this.downloadTriggerRef.current;
    if (!downloadRef.href) {
      const id = this.state.metaData.fileHash;
      const result = getFileDownloading(id);
      const oldResult = oldState.file;
      if (oldResult) {
        if (oldResult === "LOADING") {
          if (result !== true && result !== false && result) {
            this.buildDownloadAndPlayComponent(false, result);
          }
        }
      }
    }
  }

  buildDownloadAndPlayComponent(isJustBuild, result) {
    const downloadRef = this.downloadTriggerRef.current;
    const isDownloading = this.isDownloading;
    this.isDownloading = false;
    if (!downloadRef.href) {
      const {metaData} = this.state;
      const isPlayable = this.isPlayable;
      downloadRef.href = result;
      downloadRef.download = metaData.name;
      this.isPlayable = null;
      if (isPlayable) {
        this.playAfterDownloadTrigger(result);
        return;
      }
      if (isDownloading && !isJustBuild) {
        downloadRef.click();
      }
    }
  }

  onCancelDownload() {
    const {metaData} = this.state;
    cancelDownload(metaData.fileHash, this.props.dispatch);
    //just a trigger nothing ;)
    this.setState({
      metaData
    })
  }

  onDownload(isPlayable, e) {
    (e || isPlayable).stopPropagation && (e || isPlayable).stopPropagation();
    const {metaData, isVideo} = this.state;
    const downloadRef = this.downloadTriggerRef.current;
    const pastAction = () => {
      if (isPlayable) {
        if (this.playTrigger) {
          const result = this.playTrigger(downloadRef.href);
          if (downloadRef.href) {
            return;
          }
        }
      }
      if (downloadRef.href) {
        return downloadRef.click();
      }
      this.isDownloading = true;
      this.isPlayable = isPlayable;
      getFile(metaData.file.hashCode, "file", this, false, false, this.state.isVideo ? {responseType: "link"} : {});
    };
    //TODO: fix it when on new token coming
    if (isVideo && downloadRef && downloadRef.href) {
      updateLink(metaData.file.hashCode, this.props.dispatch).then(link => {
        downloadRef.href = link;
        pastAction();
      });
    } else {
      pastAction();
    }

  }

  onRetry() {
    const {dispatch, message, thread} = this.props;
    this.onCancel(message);
    dispatch(messageSendFile(message.fileObject, thread, message.message));
  }

  onCancel() {
    const {dispatch, message} = this.props;
    if (message.cancel) {
      message.cancel();
    }
    dispatch(messageCancelFile(message.uniqueId, message.threadId));
  }

  setShowProgress(newShowProgress) {
    const {showProgress} = this.state;
    if (newShowProgress === showProgress) {
      return;
    }
    this.setState({
      showProgress: newShowProgress
    })
  }

  setPlayTrigger(playTrigger) {
    if (!this.playTrigger) {
      this.playTrigger = playTrigger;
    }
  }

  setPlayAfterDownloadTrigger(playAfterDownloadTrigger) {
    if (!this.playAfterDownloadTrigger) {
      this.playAfterDownloadTrigger = playAfterDownloadTrigger;
    }
  }

  setJustMountedTrigger(justMountedTrigger) {
    if (!this.justMountedTrigger) {
      this.justMountedTrigger = justMountedTrigger;
    }
  }

  createContextMenuChildren() {
    return <ContextItem onClick={this.onDownload.bind(this, false)}>
      {mobileCheck() ?
        <MdArrowDownward color={styleVar.colorAccent} size={styleVar.iconSizeMd}/> : strings.download}
    </ContextItem>
  }

  componentWillUnmount() {
    if (this.isDownloading) {
      this.onCancelDownload();
    }
  }

  render() {
    const {
      isMessageByMe,
      isFirstMessage,
      thread,
      messageControlShow,
      messageTriggerShow,
      message,
      highLightMessage,
      onMessageControlShow,
      onRepliedMessageClicked,
      onMessageSeenListClick,
      onMessageControlHide,
      forceSeen,
      isChannel,
      isGroup,
      chatAudioPlayer,
      smallVersion,
      leftAsideShowing,
      dispatch
    } = this.props;
    let {
      isImage,
      isVideo,
      isSound,
      isVoice,
      metaData,
      imageIsSuitableSize,
      showProgress
    } = this.state;
    const downloadable = isMessageIsDownloadable(message);
    const downloading = this.isDownloading && getFileDownloading(metaData.fileHash) === true;
    const uploading = isMessageIsUploading(message);
    const audioPlaying = chatAudioPlayer && chatAudioPlayer.message.id === message.id && chatAudioPlayer.playing;
    const showProgressFinalDecision = showProgress || uploading || downloading;
    if (!imageIsSuitableSize) {
      isImage = false;
    }
    const renderControlIconCondition = !isImage && (downloadable || downloading || uploading || isMessageHasError(message));
    return (
      <Container className={style.MainMessagesMessageFile} key={message.uuid}>
        <Container display="none">
          <a ref={this.downloadTriggerRef}/>
        </Container>
        {showProgressFinalDecision &&
        <MainMessagesMessageFileProgress isDownloading={showProgress === "downloading" || downloading}
                                         progress={message.progress}/>}
        <MainMessagesMessageBox message={message}
                                onRepliedMessageClicked={onRepliedMessageClicked}
                                maxReplyFragmentWidth={isImage && `${imageIsSuitableSize.width}px`}
                                isChannel={isChannel}
                                isGroup={isGroup}
                                isFirstMessage={isFirstMessage}
                                isMessageByMe={isMessageByMe}>
          <MainMessagesMessageBoxHighLighter message={message} highLightMessage={highLightMessage}/>
          <Container>
            <Container relative
                       className={style.MainMessagesMessageFile__FileContainer}>
              {isImage ?
                <MainMessagesMessageFileImage
                  onCancel={uploading || isMessageHasError(message) ? this.onCancel : this.onCancelDownload}
                  isUploading={uploading}
                  message={message}
                  setShowProgress={this.setShowProgress}
                  smallVersion={smallVersion}
                  leftAsideShowing={leftAsideShowing}
                  showCancelIcon={downloading || uploading}
                  dispatch={dispatch}
                  metaData={metaData}/>
                :
                <Container className={style.MainMessagesMessageFile__FileName}>
                  {isVideo &&
                  <MainMessagesMessageFileVideo setPlayTrigger={this.setPlayTrigger}
                                                setJustMountedTrigger={this.setJustMountedTrigger}
                                                setPlayAfterDownloadTrigger={this.setPlayAfterDownloadTrigger}
                                                message={message}/>
                  }

                  {isVoice ?
                    <MdMic size={styleVar.iconSizeSm} color={styleVar.colorAccent}/>
                    :
                    <Text wordWrap="breakWord" bold>
                      {metaData.name || metaData.file.originalName}
                    </Text>
                  }

                  {
                    (isSound || isVoice) &&
                    <MainMessagesMessageFileSound thread={thread}
                                                  setJustMountedTrigger={this.setJustMountedTrigger}
                                                  setPlayTrigger={this.setPlayTrigger}
                                                  setPlayAfterDownloadTrigger={this.setPlayAfterDownloadTrigger}
                                                  message={message}
                                                  dispatch={dispatch}
                                                  chatAudioPlayer={chatAudioPlayer}/>
                  }
                  <Text size="xs" color="gray" dark={isMessageByMe}>
                    {humanFileSize(metaData.file.size, true)}
                  </Text>

                </Container>
              }
              {
                renderControlIconCondition &&
                <MainMessagesMessageFileControlIcon
                  onClick={downloadable ? downloading ? this.onCancelDownload : this.onDownload.bind(this, isVideo || isSound || isVoice) : this.onCancel.bind(this, message)}
                  isCancel={(uploading || isMessageHasError(message)) || (downloadable && downloading)}
                  isMedia={(isSound || isVoice) && audioPlaying ? "playing" : ((isSound || isVoice) && !audioPlaying) || isVideo ? "pause" : false}
                  isDownload={!isVideo && !isSound && !isVoice}/>
              }

            </Container>

            {
              !isImage && <MainMessagesMessageFileCaption message={message.message}/>
            }

          </Container>
          <MainMessagesMessageBoxFooter message={message} onMessageControlShow={onMessageControlShow}
                                        mainMessagesMessageRef={this.mainMessagesMessageRef}
                                        isMessageByMe={isMessageByMe}
                                        onMessageControlHide={onMessageControlHide}
                                        messageControlShow={messageControlShow} messageTriggerShow={messageTriggerShow}>
            <MainMessagesMessageBoxSeen isMessageByMe={isMessageByMe} message={message} thread={thread}
                                        forceSeen={forceSeen}
                                        onMessageSeenListClick={onMessageSeenListClick} onRetry={this.onRetry}
                                        onCancel={this.onCancel}/>
          </MainMessagesMessageBoxFooter>
        </MainMessagesMessageBox>
      </Container>
    )
  }
}

export default withRouter(MainMessagesMessageFile);