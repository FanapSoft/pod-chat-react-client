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
  getImageFromHashMap, getImageFromHashMapWindow,
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
import {chatAudioPlayer, chatGetImage} from "../actions/chatActions";

//components
import {
  MdArrowDownward,
  MdPlayArrow,
  MdPause,
  MdClose,
  MdMic
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

const imageQualities = {
  low: {
    s: 1,
    q: 0.01
  },
  medium: {
    s: 3
  },
  high: {
    q: meta => {
      let {size} = meta.file;
      size = size / 1024;
      if (size <= 1024) {
        return .5
      }
      if (size <= 2048) {
        return .3
      }
      if (size <= 4096) {
        return .2
      }
      return .1
    }
  }
};

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
    const metaData = typeof message.metadata === "string" ? JSON.parse(message.metadata) : message.metadata;
    const imageIsSuitableSize = isImage(message) && getImage(metaData, message.id, smallVersion || leftAsideShowing);
    const isImageReal = isImage(message);
    const {fileHash} = metaData;
    this.state = {
      isImage: isImageReal,
      isVideo: isVideo(message),
      isSound: isSound(message),
      isVoice: isVoice(message),
      isFile: !isSound(message) && !isVideo(message) && !isImageReal,
      isUploading: isUploading(message),
      imageThumb: isImageReal && imageIsSuitableSize ? getImageFromHashMapWindow(fileHash, imageQualities.medium.s, null, "imageThumb", this, true) : null,
      imageModalPreview: isImageReal && imageIsSuitableSize ? getImageFromHashMapWindow(fileHash, null, imageQualities.high.q(metaData), "imageModalPreview", this, true) : null,
      imageThumbLowQuality: isImageReal && imageIsSuitableSize ? getImageFromHashMapWindow(fileHash, imageQualities.low.s, imageQualities.low.q, "imageThumbLowQuality", this, true) : null,
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

  requestForImage(hash, size, quality, updateKey) {
    const {dispatch} = this.props;
    const id = `${hash}-${size}-${quality}`;
    if (window[id]) {
      return window[id];
    }
    dispatch(chatGetImage(hash, size, quality)).then(result => {
      window[id] = URL.createObjectURL(result);
      this.setState({
        [updateKey]: window[id]
      });
    });
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
    const {chatFileHashCodeMap: oldChatFileHashCodeMap, message: oldMessage} = oldProps;

    if (message) {
      if (message.progress) {
        if (!message.hasError) {
          if (hasError(message)) {
            dispatch(messageSendingError(message.threadId, message.uniqueId));
          }
        }
      }
    }

    if (oldMessage) {
      if (oldMessage.metadata.mapLink) {
        if (!message.metadata.mapLink) {
          const metaData = typeof message.metadata === "string" ? JSON.parse(message.metadata) : message.metadata;
          this.setState({
            metaData
          })
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

  buildDownloadAndPlayComponent(isJustBuild, result, soundPlayerBuildBefore) {
    const downloadRef = this.downloadTriggerRef.current;
    const isDownloading = this.isDownloading;
    this.isDownloading = false;
    if (!downloadRef.href) {
      const {message, dispatch, thread} = this.props;
      const {metaData, isVideo, isSound, isVoice} = this.state;
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
        if (isPlayable === "IS_SOUND" || isSound || isVoice) {
          const wavesurfer = this.soundPlayer = WaveSurfer.create({
            container: soundCurrent,
            waveColor: styleVar.colorAccentLight,
            progressColor: styleVar.colorAccent,
            cursorColor: styleVar.colorAccentDark,
            height: 20,
            barWidth: 2,
            barRadius: 2,
            barMinHeight: 1,
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
    cancelFileDownloadingFromHashMap.call(this, metaData.fileHash);
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
    console.log(message);
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
      isVoice,
      metaData,
      imageIsSuitableSize
    } = this.state;
    if (isImage) {
      imageThumb = imageThumb === "LOADING" ? null : imageThumb;
      imageModalPreview = imageModalPreview === "LOADING" ? null : imageModalPreview;
      imageThumbLowQuality = imageThumbLowQuality === "LOADING" ? null : imageThumbLowQuality;
    }
    const isLocationMap = metaData.mapLink;
    const isLocationMapLoading = isLocationMap === true;
    const downloading = this.isDownloading && getFileDownloadingFromHashMap.call(this, metaData.fileHash) === true;
    const isPlaying = chatAudioPlayer && chatAudioPlayer.message.id === message.id && chatAudioPlayer.playing;
    const isUploadingBool = isUploading(message);
    const isBlurry = imageThumbLowQuality && !imageThumb && !isUploadingBool;
    const gettingImageThumb = isLocationMapLoading || (isImage && imageIsSuitableSize && !isUploadingBool) && (!imageThumbLowQuality && !imageThumb);
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
    const fileControlContainerClassNames = classnames({
      [style.MainMessagesFile__FileControlIcon]: true,
      [style["MainMessagesFile__FileControlIcon--image"]]: isImage || imageIsSuitableSize
    });
    const ImageFragment = () => <Image className={mainMessagesFileImageClassNames}
                                       onClick={this.onImageClick}
                                       src={message.id ? isBlurry ? imageThumbLowQuality : imageThumb : imageSizeLink.imageLink}
                                       style={{
                                         backgroundColor: gettingImageThumb ? "#fff" : "none",
                                         maxWidth: `${imageSizeLink.width}px`,
                                         width: `${imageSizeLink.width}px`,
                                         height: `${isLocationMapLoading ? "200" : imageSizeLink.height}px`,
                                         filter: isBlurry || gettingImageThumb ? "blur(8px)" : "none"
                                       }}/>;
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
                  {isLocationMap ?
                    <Text link={isLocationMap} linkClearStyle target={"_blank"}>
                      <ImageFragment/>
                    </Text>
                    :
                    <BoxModalMediaFragment link={imageModalPreview || imageThumb} options={{caption: message.message}}>
                      <ImageFragment/>
                    </BoxModalMediaFragment>
                  }

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

                  {isVoice ?
                    <MdMic size={styleVar.iconSizeSm} color={styleVar.colorAccent}/>
                    :
                    <Text wordWrap="breakWord" bold>
                      {metaData.name}
                    </Text>
                  }

                  {
                    (isSound || isVoice) &&
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
                <Container className={fileControlContainerClassNames}
                           style={isImage ? {
                             maxWidth: `${imageSizeLink.width}px`,
                             height: `${imageSizeLink.height}px`
                           } : null}>

                  <Container center={isImage}>
                    <Shape color="accent" size="lg"
                           onDoubleClick={e => e.stopPropagation()}
                           onClick={isDownloadable(message) ? downloading ? this.onCancelDownload : this.onDownload.bind(this, metaData, isVideo ? "IS_VIDEO" : isSound || isVoice ? "IS_SOUND" : null) : this.onCancel.bind(this, message)}>
                      <ShapeCircle>
                        {isUploadingBool || hasError(message) ?
                          <MdClose style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
                          : isDownloadable(message) ?
                            downloading ?
                              <MdClose style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
                              :
                              isVideo || isSound || isVoice ?
                                isSound || isVoice ?
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