// src/list/BoxSceneMessagesText
import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import "moment/locale/fa";
import {
  cancelFileDownloadingFromHashMap,
  getFileDownloadingFromHashMap,
  getFileFromHashMap,
  getMessageMetaData,
  humanFileSize,
  mobileCheck
} from "../utils/helpers";

//strings
import {typesCode} from "../constants/messageTypes";
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
import {
  PaperFragment,
  PaperFooterFragment,
  ControlFragment,
  HighLighterFragment,
  SeenFragment
} from "./MainMessagesMessage";
import MainMessagesMessageFileVideo from "./MainMessagesMessageFileVideo";
import MainMessagesMessageFileSound from "./MainMessagesMessageFileSound";
import MainMessagesMessageFileImage from "./MainMessagesMessageFileImage";
import MainMessagesMessageFileProgress from "./MainMessagesMessageFileProgress";
import MainMessagesMessageFileControlIcon from "./MainMessagesMessageFileControlIcon";
import MainMessagesMessageFileCaption from "./MainMessagesMessageFileCaption";

//styling
import style from "../../styles/app/MainMessagesFile.scss";
import styleVar from "../../styles/variables.scss";


export function isImage({messageType}) {
  if (messageType) {
    return messageType === typesCode.POD_SPACE_PICTURE;
  }
}

export function isVideo({messageType}) {
  if (messageType) {
    return messageType === typesCode.POD_SPACE_VIDEO;
  }
}

export function isSound({messageType}) {
  if (messageType) {
    return messageType === typesCode.POD_SPACE_SOUND;
  }
}

export function isVoice({messageType}) {
  if (messageType) {
    return messageType === typesCode.POD_SPACE_VOICE;
  }
}

export function getImage({link, file}, isFromServer, smallVersion) {
  let imageLink = file.link;
  let width = file.actualWidth;
  let height = file.actualHeight;

  const ratio = height / width;
  if (ratio < 0.15 || ratio > 7) {
    return false;
  }
  const maxWidth = smallVersion || window.innerWidth <= 700 ? 190 : ratio >= 2 ? 200 : 300;
  height = Math.ceil(maxWidth * ratio);
  if (!isFromServer) {
    return {imageLink, width: maxWidth, height};
  }
  return {
    width: maxWidth,
    height
  };
}

function isDownloadable(message) {
  return message.id;
}

function isUploading(message) {
  return !message.id;
}

function hasError(message) {
  if (message.state === "UPLOAD_ERROR") {
    return true;
  }
}

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
    const {leftAsideShowing, smallVersion, message, chatAudioPlayer} = props;
    const metaData = getMessageMetaData(message);
    const isImageReal = isImage(message) || (isImage(message) && !message.id);
    this.state = {
      isImage: isImageReal,
      imageIsSuitableSize: isImageReal && getImage(metaData, message.id, smallVersion || leftAsideShowing),
      isVideo: isVideo(message),
      isSound: isSound(message),
      isVoice: isVoice(message),
      isFile: !isSound(message) && !isVideo(message) && !isImageReal,
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
    this.isDownloading = false;
    this.isPlayable = null;
  }

  componentDidMount() {
    const {metaData} = this.state;
    const fileResult = getFileDownloadingFromHashMap.apply(this, [metaData.fileHash]);
    const result = typeof fileResult === "string" && fileResult.indexOf("blob") > -1 ? fileResult : null;
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

  componentDidUpdate(oldProps) {
    const {message, dispatch} = this.props;
    const {chatFileHashCodeMap: oldChatFileHashCodeMap} = oldProps;

    if (message) {
      if (message.progress) {
        if (!message.hasError) {
          if (hasError(message)) {
            dispatch(messageSendingError(message.threadId, message.uniqueId));
          }
        }
      }
    }

    const downloadRef = this.downloadTriggerRef.current;
    if (!downloadRef.href) {
      const id = this.state.metaData.fileHash;
      const result = getFileDownloadingFromHashMap.call(this, id);
      const oldResult = oldChatFileHashCodeMap.find(e => e.id === id);
      if (oldResult) {
        if (oldResult.result === "LOADING") {
          if (result !== true && result !== false) {
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
    cancelFileDownloadingFromHashMap.call(this, metaData.fileHash);
  }

  onDownload(isPlayable, e) {
    (e || isPlayable).stopPropagation && (e || isPlayable).stopPropagation();
    const {metaData} = this.state;
    if (isPlayable) {
      if (this.playTrigger) {
        const result = this.playTrigger(isPlayable);
        if (result) {
          return;
        }
      }
    }
    const downloadRef = this.downloadTriggerRef.current;
    if (downloadRef.href) {
      return downloadRef.click();
    }
    this.isDownloading = true;
    this.isPlayable = isPlayable;
    getFileFromHashMap.apply(this, [metaData.file.hashCode]);
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

  setShowProgress(newShowProgress, newProgress) {
    const {showProgress, progress} = this.state;
    if (newShowProgress === showProgress && newProgress === progress) {
      return;
    }
    this.setState({
      showProgress: newShowProgress,
      progress: newProgress
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

  render() {
    const {
      onDelete,
      onForward,
      onReply,
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
      onShare,
      isParticipantBlocked,
      forceSeen,
      isChannel,
      isOwner,
      isGroup,
      onPin,
      chatAudioPlayer,
      smallVersion,
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
    const downloading = this.isDownloading && getFileDownloadingFromHashMap.call(this, metaData.fileHash) === true;
    const uploading = isUploading(message);
    const audioPlaying = chatAudioPlayer && chatAudioPlayer.message.id === message.id && chatAudioPlayer.playing;
    const showProgressFinalDecision = showProgress || uploading || downloading;
    if (!imageIsSuitableSize) {
      isImage = false;
    }
    const renderControlIconCondition = (isDownloadable(message) && !isImage) || downloading || uploading || hasError(message);
    return (
      <Container className={style.MainMessagesFile} key={message.uuid}>
        <Container display="none">
          <a ref={this.downloadTriggerRef}/>
        </Container>
        {showProgressFinalDecision &&
        <MainMessagesMessageFileProgress isDownloading={showProgress === "downloading" || downloading}
                                         progress={message.progress}/>}
        <PaperFragment message={message}
                       onRepliedMessageClicked={onRepliedMessageClicked}
                       maxReplyFragmentWidth={isImage && `${imageIsSuitableSize.width}px`}
                       isChannel={isChannel}
                       isGroup={isGroup}
                       isFirstMessage={isFirstMessage}
                       isMessageByMe={isMessageByMe}>
          <HighLighterFragment message={message} highLightMessage={highLightMessage}/>
          <ControlFragment
            isParticipantBlocked={isParticipantBlocked}
            isOwner={isOwner}
            isMessageByMe={isMessageByMe}
            onPin={onPin}
            isChannel={isChannel}
            isGroup={isGroup}
            onShare={onShare}
            messageControlShow={messageControlShow}
            message={message}
            onMessageSeenListClick={onMessageSeenListClick}
            onMessageControlHide={onMessageControlHide}
            onDelete={onDelete} onForward={onForward} onReply={onReply}>
            <ContextItem onClick={this.onDownload.bind(this)}>
              {mobileCheck() ?
                <MdArrowDownward color={styleVar.colorAccent} size={styleVar.iconSizeMd}/> : strings.download}
            </ContextItem>
          </ControlFragment>
          <Container>
            <Container relative
                       className={style.MainMessagesFile__FileContainer}>
              {isImage ?
                <MainMessagesMessageFileImage imageSizeLink={imageIsSuitableSize}
                                              message={message}
                                              setShowProgress={this.setShowProgress}
                                              smallVersion={smallVersion}
                                              isUploading={uploading}
                                              dispatch={dispatch}
                                              metaData={metaData}/>
                :
                //MainMessagesMessageFileOther
                <Container className={style.MainMessagesFile__FileName}>
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
                      {metaData.name}
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
                  inlineStyle={isImage &&
                  {
                    marginRight: 0,
                    maxWidth: `${imageIsSuitableSize.width}px`,
                    height: `${imageIsSuitableSize.height}px`
                  }}
                  onClick={isDownloadable(message) ? downloading ? this.onCancelDownload : this.onDownload.bind(this, isVideo || isSound || isVoice) : this.onCancel.bind(this, message)}
                  fixCenter={isImage}
                  isCancel={(uploading || hasError(message)) || (isDownloadable(message) && downloading)}
                  isMedia={(isSound || isVoice) && audioPlaying ? "playing" : ((isSound || isVoice) && !audioPlaying) || isVideo ? "pause" : false}
                  isDownload={!isVideo && !isSound && !isImage && !isVoice}/>
              }

            </Container>

            {
              !isImage && <MainMessagesMessageFileCaption message={message.message}/>
            }

          </Container>
          <PaperFooterFragment message={message} onMessageControlShow={onMessageControlShow}
                               isMessageByMe={isMessageByMe}
                               onMessageControlHide={onMessageControlHide}
                               messageControlShow={messageControlShow} messageTriggerShow={messageTriggerShow}>
            <SeenFragment isMessageByMe={isMessageByMe} message={message} thread={thread} forceSeen={forceSeen}
                          onMessageSeenListClick={onMessageSeenListClick} onRetry={this.onRetry}
                          onCancel={this.onCancel}/>
          </PaperFooterFragment>
        </PaperFragment>
      </Container>
    )
  }
}

export default withRouter(MainMessagesMessageFile);