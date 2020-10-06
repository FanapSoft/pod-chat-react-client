// src/list/BoxSceneMessagesText
import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import "moment/locale/fa";
import {humanFileSize, mobileCheck} from "../utils/helpers";
import {urlify, mentionify, emailify} from "./MainMessagesMessage";
import classnames from "classnames";

//strings

//actions
import {
  messageSendingError,
  messageCancelFile,
  messageSendFile,
} from "../actions/messageActions";

//components
import {BoxModalMediaFragment} from "./index";
import Image from "../../../uikit/src/image";
import Container from "../../../uikit/src/container";
import {Text} from "../../../uikit/src/typography";
import Shape, {ShapeCircle} from "../../../uikit/src/shape";
import Gap from "../../../uikit/src/gap";
import {
  PaperFragment,
  PaperFooterFragment,
  ControlFragment,
  HighLighterFragment,
  SeenFragment
} from "./MainMessagesMessage";

//styling
import {
  MdArrowDownward,
  MdPlayArrow,
  MdClose
} from "react-icons/md";
import style from "../../styles/app/MainMessagesFile.scss";
import styleVar from "../../styles/variables.scss";
import {ContextItem} from "../../../uikit/src/menu/Context";
import strings from "../constants/localization";
import {decodeEmoji} from "./_component/EmojiIcons.js";


export function getImage(metaData, isFromServer, smallVersion) {
  let imageLink = metaData.link;
  let width = metaData.width;
  let height = metaData.height;

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
    imageLink: `${imageLink}&width=${maxWidth}&height=${height}`,
    width: maxWidth,
    height,
    imageLinkOrig: imageLink
  };
}

function isDownloadable(message) {
  return message.id;
}

function isUploading(message) {
  if (message.progress) {
    if (message.state === "UPLOADING") {
      return true;
    }
  }
}

function hasError(message) {
  if (message.state === "UPLOAD_ERROR") {
    return true;
  }
}

@connect(store => {
  return {
    smallVersion: store.chatSmallVersion,
    leftAsideShowing: store.threadLeftAsideShowing.isShowing
  };
})
class MainMessagesMessageFile extends Component {

  constructor(props) {
    super(props);
    this.onImageClick = this.onImageClick.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onRetry = this.onRetry.bind(this);
  }

  onImageClick(e) {
    e.stopPropagation();
  }

  componentDidUpdate() {
    const {message, dispatch} = this.props;
    if (message) {
      if (message.progress) {
        if (!message.hasError) {
          if (hasError(message)) {
            dispatch(messageSendingError(message.threadId, message.uniqueId));
          }
        }
      }
    }
  }

  onDownload(metaData, isVideo, e) {
    (e || isVideo).stopPropagation && (e || isVideo).stopPropagation();
    if (isVideo === true) {
      return;
    }
    window.location.href = `${metaData.link}&downloadable=true`;
    this.props.onMessageControlHide();
  }

  onRetry() {
    const {dispatch, message} = this.props;
    this.onCancel(message);
    dispatch(messageSendFile(message.fileObject, message.threadId, message.message));
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
      onPin
    } = this.props;
    let metaData = message.metadata;
    metaData = typeof metaData === "string" ? JSON.parse(metaData).file : metaData.file;
    const mimeType = metaData.mimeType;
    let isImage = mimeType.indexOf("image") > -1;
    const isVideo = mimeType.match(/mp4|ogg|3gp|ogv/);
    const imageSizeLink = isImage ? getImage(metaData, message.id, smallVersion || leftAsideShowing, message.fileObject) : false;
    if (!imageSizeLink) {
      isImage = false;
    }
    const mainMessagesFileImageClassNames = classnames({
      [style.MainMessagesFile__Image]: true,
      [style["MainMessagesFile__Image--smallVersion"]]: smallVersion
    });

    return (
      <Container className={style.MainMessagesFile} key={message.uuid}>

        {isUploading(message) ?
          <Container className={style.MainMessagesFile__ProgressContainer}>
            <Container className={style.MainMessagesFile__Progress}
                       absolute
                       bottomLeft
                       style={{width: `${message.progress ? message.progress : 0}%`}}
                       title={`${message.progress && message.progress}`}/>
          </Container>
          : ""}
        <PaperFragment message={message} onRepliedMessageClicked={onRepliedMessageClicked}
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
                  <BoxModalMediaFragment link={imageSizeLink.imageLinkOrig} options={{caption: message.message}}>
                    <Image className={mainMessagesFileImageClassNames}
                           onClick={this.onImageClick}
                           src={imageSizeLink.imageLink}
                           style={{maxWidth: `${imageSizeLink.width}px`, height: `${imageSizeLink.height}px`}}/>
                  </BoxModalMediaFragment>
                  <Container userSelect={mobileCheck() ? "none" : "text"} onDoubleClick={e => e.stopPropagation()}>
                    <Text isHTML wordWrap="breakWord" whiteSpace="preWrap" color="text" dark>
                      {mentionify(emailify(urlify(decodeEmoji(message.message))))}
                    </Text>
                  </Container>

                </Container>
                :
                <Container className={style.MainMessagesFile__FileName}>
                  {isVideo ?
                    <video controls id={`video-${message.id}`} style={{display: "none"}} src={metaData.link}/> : ""
                  }
                  <Text wordWrap="breakWord" bold>
                    {metaData.originalName}
                  </Text>
                  <Text size="xs" color="gray" dark={isMessageByMe}>
                    {humanFileSize(metaData.size, true)}
                  </Text>

                </Container>
              }
              <Container className={style.MainMessagesFile__FileControlIcon} topCenter={isImage} style={isImage ? {
                maxWidth: `${imageSizeLink.width}px`,
                height: `${imageSizeLink.height}px`
              } : null}>
                {(isDownloadable(message) && !isImage) || isUploading(message) || hasError(message) ?
                  <Gap x={isImage ? 0 : 10}>
                    <Container center={isImage}>
                      <Shape color="accent" size="lg"
                             onClick={isDownloadable(message) ? this.onDownload.bind(this, metaData, !!isVideo) : this.onCancel.bind(this, message)}>
                        <ShapeCircle>
                          {isUploading(message) || hasError(message) ?
                            <MdClose style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
                            : isDownloadable(message) ?
                              isVideo ?
                                <Text link={`#video-${message.id}`} linkClearStyle data-fancybox>
                                  <MdPlayArrow style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
                                </Text>
                                :
                                <MdArrowDownward style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/> : ""
                          }
                        </ShapeCircle>
                      </Shape>
                    </Container>
                  </Gap>
                  : ""}
              </Container>
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