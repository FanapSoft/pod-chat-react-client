// src/list/BoxSceneMessagesText
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import "moment/locale/fa";
import {decodeEmoji} from "./_component/EmojiIcons.js";
import {clearHtml} from "./_component/Input";
import {
  cancelFileDownloadingFromHashMap,
  getFileDownloadingFromHashMap,
  getFileFromHashMap,
  getImageFromHashMap,
  humanFileSize,
  mobileCheck
} from "../utils/helpers";
import {urlify, mentionify, emailify} from "./MainMessagesMessage";
import classnames from "classnames";
import WaveSurfer from 'wavesurfer.js';

//strings
import {typesCode} from "../constants/messageTypes";
import strings from "../constants/localization";

//actions
import {
  messageSendingError,
  messageCancelFile,
  messageSendFile,
} from "../actions/messageActions";
import {chatAudioPlayer} from "../actions/chatActions";

//components
import {
  MdArrowDownward,
  MdPlayArrow,
  MdPause,
  MdClose
} from "react-icons/md";
import {BoxModalMediaFragment} from "./index";
import Image from "../../../uikit/src/image";
import Container from "../../../uikit/src/container";
import {Text} from "../../../uikit/src/typography";
import Shape, {ShapeCircle} from "../../../uikit/src/shape";
import {ContextItem} from "../../../uikit/src/menu/Context";
import {
  PaperFragment,
  PaperFooterFragment,
  ControlFragment,
  HighLighterFragment,
  SeenFragment
} from "./MainMessagesMessage";

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

export function getImage({link, file}, isFromServer, smallVersion) {
  let imageLink = file.link;
  let width = file.actualWidth;
  let height = file.actualHeight;

  const ratio = height / width;
  if (ratio < 0.25 || ratio > 5) {
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

const imageQualities = {
  low: {
    s: 1,
    q: 0.01
  },
  medium: {
    s: 3
  },
  high: {
    q: .5
  }
};

@connect(store => {
  return {
    smallVersion: store.chatSmallVersion,
    leftAsideShowing: store.threadLeftAsideShowing.isShowing,
    chatAudioPlayer: store.chatAudioPlayer,
    chatFileHashCodeMap: store.chatFileHashCodeUpdate.hashCodeMap
  };
})
class MainMessagesMessageFile extends Component {

  constructor(props) {
    super(props);
    const {leftAsideShowing, smallVersion, message, chatAudioPlayer} = props;
    const metaData = typeof message.metadata === "string" ? JSON.parse(message.metadata) : message.metadata;
    const imageIsSuitableSize = isImage(message) && getImage(metaData, message.id, smallVersion || leftAsideShowing);
    const isImageReal = isImage(message);
    this.state = {
      isImage: isImageReal,
      isVideo: isVideo(message),
      isSound: isSound(message),
      isFile: !isSound(message) && !isVideo(message) && !isImageReal,
      isUploading: isUploading(message),
      imageThumb: isImageReal && imageIsSuitableSize ? getImageFromHashMap.apply(this, [metaData.fileHash, imageQualities.medium.s]) : null,
      imageModalPreview: isImageReal && imageIsSuitableSize ? getImageFromHashMap.apply(this, [metaData.fileHash, null, imageQualities.high.q]) : null,
      imageThumbLowQuality: isImageReal && imageIsSuitableSize ? getImageFromHashMap.apply(this, [metaData.fileHash, imageQualities.low.s, imageQualities.low.q]) : null,
      metaData,
      imageIsSuitableSize
    };

    this.onCancelDownload = this.onCancelDownload.bind(this);
    this.onImageClick = this.onImageClick.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onRetry = this.onRetry.bind(this);
    this.videoRef = React.createRef();
    this.soundRef = React.createRef();
    this.soundPlayerContainer = React.createRef();
    this.downloadTriggerRef = React.createRef();
    this.playVideoRef = React.createRef();
    this.soundPlayer = chatAudioPlayer && chatAudioPlayer.message.id === message.id && chatAudioPlayer.player;
    this.isDownloading = isImageReal && imageIsSuitableSize;
    this.isPlayable = null;
  }

  onImageClick(e) {
    e.stopPropagation();
  }

  componentDidMount() {
    const {metaData} = this.state;
    const fileResult = getFileDownloadingFromHashMap.apply(this, [metaData.fileHash]);
    const result = typeof fileResult === "string" && fileResult.indexOf("blob") > -1 ? fileResult : null;
    if (this.soundPlayer) {
      this.soundPlayerContainer.current.appendChild(this.soundPlayer.container);
    }
    if (result) {
      const downloadRef = this.downloadTriggerRef.current;
      if (!downloadRef.href) {
        return this.buildDownloadAndPlayComponent(true, result, this.soundPlayer);
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
      const id = this.state.metaData.file.hashCode;
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

  buildDownloadAndPlayComponent(isJustBuild, result, soundPlayerBuildBefore) {
    const downloadRef = this.downloadTriggerRef.current;
    const isDownloading = this.isDownloading;
    this.isDownloading = false;
    if (!downloadRef.href) {
      const {message, dispatch, thread} = this.props;
      const {metaData, isVideo, isSound} = this.state;
      const isPlayable = this.isPlayable;
      const videoCurrent = this.videoRef.current;
      const soundCurrent = this.soundRef.current;
      const playVideoRef = this.playVideoRef.current;
      this.isPlayable = null;
      downloadRef.href = result;
      downloadRef.download = metaData.name;
      if (isPlayable === "IS_VIDEO" || isVideo) {
        videoCurrent.src = result;
        if (!isJustBuild && isPlayable === "IS_VIDEO") {
          return playVideoRef.click();
        }
      }
      if (!soundPlayerBuildBefore) {
        if (isPlayable === "IS_SOUND" || isSound) {
          const wavesurfer = this.soundPlayer = WaveSurfer.create({
            container: soundCurrent,
            waveColor: styleVar.colorAccentLight,
            progressColor: styleVar.colorAccent,
            cursorColor: styleVar.colorAccentDark,
            height: 20,
            barWidth: 2,
            barRadius: 2,
            cursorWidth: 2,
            barGap: 1
          });
          if (!isJustBuild && isPlayable === "IS_SOUND") {
            wavesurfer.on('ready', function () {
              dispatch(chatAudioPlayer({message, player: wavesurfer, thread, playing: true}));
              wavesurfer.play();
            });
          }
          wavesurfer.on('finish', function () {
            dispatch(chatAudioPlayer({message, player: wavesurfer, thread, playing: false}));
          });
          wavesurfer.load(result);
          if (isPlayable === "IS_SOUND") {
            return;
          }
        }
      }

      if (isDownloading && !isJustBuild) {
        downloadRef.click();
      }

    }
  }

  onCancelDownload() {
    const {metaData} = this.state;
    cancelFileDownloadingFromHashMap.call(this, metaData.file.hashCode);
  }

  onDownload(metaData, isPlayable, e) {
    (e || isPlayable).stopPropagation && (e || isPlayable).stopPropagation();
    const {thread, message, dispatch} = this.props;
    const videoCurrent = this.videoRef.current;
    const downloadRef = this.downloadTriggerRef.current;
    const playVideoRef = this.playVideoRef.current;
    if (isPlayable === "IS_VIDEO") {
      if (videoCurrent.src) {
        return playVideoRef.click();
      }
    }
    if (isPlayable === "IS_SOUND") {
      if (this.soundPlayer) {
        this.soundPlayer.playPause();
        return dispatch(chatAudioPlayer({
          message,
          player: this.soundPlayer,
          thread,
          playing: this.soundPlayer.isPlaying()
        }));
      }
    }
    if (downloadRef.href) {
      if (isPlayable !== true) {
        return downloadRef.click();
      }
    }
    this.isDownloading = true;
    this.isPlayable = isPlayable;
    getFileFromHashMap.apply(this, [metaData.file.hashCode]);
  }

  onRetry() {
    const {dispatch, message, thread} = this.props;
    console.log(message)
    this.onCancel(message);
    dispatch(messageSendFile(message.fileObject, thread, message.message));
  }

  onCancel() {
    const {dispatch, message} = this.props;
    dispatch(messageCancelFile(message.uniqueId, message.threadId));
  }

  render() {
    const {
      onDelete,
      onForward,
      onReply, isMessageByMe,
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
      leftAsideShowing,
      smallVersion,
      forceSeen,
      isChannel,
      isOwner,
      isGroup,
      onPin,
      chatAudioPlayer
    } = this.props;
    let {
      imageThumb,
      imageModalPreview,
      imageThumbLowQuality,
      isImage,
      isVideo,
      isSound,
      metaData
    } = this.state;
    if (isImage) {
      imageThumb = getImageFromHashMap.apply(this, [metaData.fileHash, imageQualities.medium.s]);
      imageModalPreview = getImageFromHashMap.apply(this, [metaData.fileHash, null, imageQualities.high.q]);
      imageThumbLowQuality = getImageFromHashMap.apply(this, [metaData.fileHash, imageQualities.low.s, imageQualities.low.q]);
      imageThumb = (typeof imageThumb === "string" && imageThumb.indexOf("blob") < 0) || imageThumb === true ? null : imageThumb;
      imageModalPreview = (typeof imageModalPreview === "string" && imageModalPreview.indexOf("blob") < 0) || imageModalPreview === true ? null : imageModalPreview;
      imageThumbLowQuality = (typeof imageThumbLowQuality === "string" && imageThumbLowQuality.indexOf("blob") < 0) || imageThumbLowQuality === true ? null : imageThumbLowQuality;
    }

    const downloading = this.isDownloading && getFileDownloadingFromHashMap.call(this, metaData.file.hashCode) === true;
    const isPlaying = chatAudioPlayer && chatAudioPlayer.message.id === message.id && chatAudioPlayer.playing;
    const isUploadingBool = isUploading(message);
    const isBlurry = imageThumbLowQuality && !imageThumb && !isUploadingBool;
    const gettingImageThumb = !imageThumbLowQuality && !imageThumb && isImage && !isUploadingBool;
    const imageSizeLink = isImage ? getImage(metaData, message.id, smallVersion || leftAsideShowing) : false;
    if (!imageSizeLink) {
      isImage = false;
    }
    const mainMessagesFileImageClassNames = classnames({
      [style.MainMessagesFile__Image]: true,
      [style["MainMessagesFile__Image--smallVersion"]]: smallVersion
    });
    const progressContainer = classnames({
      [style.MainMessagesFile__ProgressContainer]: true,
      [style["MainMessagesFile__ProgressContainer--downloading"]]: downloading || gettingImageThumb
    });
    return (
      <Container className={style.MainMessagesFile} key={message.uuid}>
        <Container display="none">
          <a ref={this.downloadTriggerRef}/>
          <a ref={this.playVideoRef} href={`#video-${message.id}`} data-fancybox/>
        </Container>
        {isUploadingBool || downloading || gettingImageThumb ?
          <Container className={progressContainer}>
            {downloading || gettingImageThumb ?
              <Fragment>
                <Container className={style.MainMessagesFile__ProgressLine}/>
                <Container
                  className={`${style.MainMessagesFile__ProgressSubLine} ${style["MainMessagesFile__ProgressSubLine--inc"]}`}/>
                <Container
                  className={`${style.MainMessagesFile__ProgressSubLine} ${style["MainMessagesFile__ProgressSubLine--dec"]}`}/>
              </Fragment>
              :
              <Fragment>
                <Container className={style.MainMessagesFile__Progress}
                           absolute
                           bottomLeft
                           style={{width: `${message.progress ? message.progress : 0}%`}}
                           title={`${message.progress && message.progress}`}/>
              </Fragment>
            }


          </Container>
          : ""}
        <PaperFragment message={message} onRepliedMessageClicked={onRepliedMessageClicked}
                       scope={this}
                       maxReplyFragmentWidth={isImage && `${imageSizeLink.width}px`}
                       isChannel={isChannel} isGroup={isGroup}
                       isFirstMessage={isFirstMessage} isMessageByMe={isMessageByMe}>
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
            <ContextItem onClick={this.onDownload.bind(this, metaData)}>
              {mobileCheck() ?
                <MdArrowDownward color={styleVar.colorAccent} size={styleVar.iconSizeMd}/> : strings.download}
            </ContextItem>
          </ControlFragment>
          <Container>
            <Container relative
                       className={style.MainMessagesFile__FileContainer}>
              {isImage ?
                <Container style={{width: `${imageSizeLink.width}px`}}>
                  <BoxModalMediaFragment link={imageModalPreview} options={{caption: message.message}}>
                    <Image className={mainMessagesFileImageClassNames}
                           onClick={this.onImageClick}
                           src={message.id ? isBlurry ? imageThumbLowQuality : imageThumb : imageSizeLink.imageLink}
                           style={{
                             backgroundColor: gettingImageThumb ? "#fff" : "none",
                             maxWidth: `${imageSizeLink.width}px`,
                             width: `${imageSizeLink.width}px`,
                             height: `${imageSizeLink.height}px`,
                             filter: isBlurry || gettingImageThumb ? "blur(8px)" : "none"
                           }}/>
                  </BoxModalMediaFragment>
                  <Container userSelect={mobileCheck() ? "none" : "text"} onDoubleClick={e => e.stopPropagation()}>
                    <Text isHTML wordWrap="breakWord" whiteSpace="preWrap" color="text" dark>
                      {mentionify(emailify(urlify(decodeEmoji(clearHtml(message.message)))))}
                    </Text>
                  </Container>

                </Container>
                :
                <Container className={style.MainMessagesFile__FileName}>
                  {isVideo ?
                    <video controls id={`video-${message.id}`} style={{display: "none"}} ref={this.videoRef}/> : ""
                  }
                  <Text wordWrap="breakWord" bold>
                    {metaData.name}
                  </Text>
                  {
                    isSound &&
                    <div style={{minWidth: "100px"}} ref={this.soundPlayerContainer}>
                      <div ref={this.soundRef}/>
                    </div>
                  }
                  <Text size="xs" color="gray" dark={isMessageByMe}>
                    {humanFileSize(metaData.file.size, true)}
                  </Text>

                </Container>
              }
              {(isDownloadable(message) && !isImage) || downloading || isUploadingBool || hasError(message) ?
                <Container className={style.MainMessagesFile__FileControlIcon}
                           style={isImage ? {
                             maxWidth: `${imageSizeLink.width}px`,
                             height: `${imageSizeLink.height}px`
                           } : null}>

                  <Container center={isImage}>
                    <Shape color="accent" size="lg"
                           onDoubleClick={e => e.stopPropagation()}
                           onClick={isDownloadable(message) ? downloading ? this.onCancelDownload : this.onDownload.bind(this, metaData, isVideo ? "IS_VIDEO" : isSound ? "IS_SOUND" : null) : this.onCancel.bind(this, message)}>
                      <ShapeCircle>
                        {isUploadingBool || hasError(message) ?
                          <MdClose style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
                          : isDownloadable(message) ?
                            downloading ?
                              <MdClose style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
                              :
                              isVideo || isSound ?
                                isSound ?
                                  isPlaying ?
                                    <MdPause style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
                                    :
                                    <MdPlayArrow style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
                                  :
                                  <MdPlayArrow style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
                                :
                                <MdArrowDownward style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/> : ""
                        }
                      </ShapeCircle>
                    </Shape>
                  </Container>
                </Container>
                : ""}
            </Container>

            {!isImage &&

            <Container userSelect={mobileCheck() ? "none" : "text"} onDoubleClick={e => e.stopPropagation()}>
              <Text isHTML wordWrap="breakWord" whiteSpace="preWrap" color="text" dark>
                {mentionify(emailify(urlify(decodeEmoji(message.message))))}
              </Text>
            </Container>
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