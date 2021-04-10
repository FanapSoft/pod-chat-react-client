// src/MainMessagesMessageFileFallback
import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import "moment/locale/fa";
import {
  humanFileSize,
  mobileCheck,
  emailify,
  mentionify,
  urlify,
  getMessageMetaData,
  clearHtml
} from "../utils/helpers";
import classnames from "classnames";

//strings

//actions
import {
  messageSendingError,
  messageCancelFile,
  messageSendFile,
} from "../actions/messageActions";

//components
import MainMessagesMessageBox from "./MainMessagesMessageBox";
import MainMessagesMessageBoxFooter from "./MainMessagesMessageBoxFooter";
import MainMessagesMessageBoxSeen from "./MainMessagesMessageBoxSeen";
import MainMessagesMessageBoxHighLighter from "./MainMessagesMessageBoxHighLighter";
import {IndexModalMediaFragment} from "./index";
import Image from "../../../pod-chat-ui-kit/src/image";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";
import Gap from "../../../pod-chat-ui-kit/src/gap";


//styling
import {
  MdArrowDownward,
  MdPlayArrow,
  MdClose
} from "react-icons/md";
import style from "../../styles/app/MainMessagesMessageFile.scss";
import styleVar from "../../styles/variables.scss";
import {ContextItem} from "../../../pod-chat-ui-kit/src/menu/Context";
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
    this.onCancel = this.onCancel.bind(this);
    this.onRetry = this.onRetry.bind(this);
    this.mainMessagesMessageRef = props.setInstance(this);
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

  createContextMenuChildren() {
    const {
      message
    } = this.props;
    let metaData = getMessageMetaData(message).file || {};
    return <ContextItem onClick={this.onDownload.bind(this, metaData)}>
      {mobileCheck() ?
        <MdArrowDownward color={styleVar.colorAccent} size={styleVar.iconSizeMd}/> : strings.download}
    </ContextItem>
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
      leftAsideShowing,
      smallVersion,
      forceSeen,
      isChannel,
      isGroup
    } = this.props;
    let metaData = getMessageMetaData(message).file || {};
    const mimeType = metaData.mimeType;
    let isImage = mimeType.indexOf("image") > -1;
    const isVideo = mimeType.match(/mp4|ogg|3gp|ogv/);
    const imageSizeLink = isImage ? getImage(metaData, message.id, smallVersion || leftAsideShowing, message.fileObject) : false;
    if (!imageSizeLink) {
      isImage = false;
    }
    const mainMessagesFileImageClassNames = classnames({
      [style.MainMessagesMessageFile__Image]: true,
      [style["MainMessagesFile__Image--smallVersion"]]: smallVersion
    });

    return (
      <Container className={style.MainMessagesMessageFile} key={message.uuid}>

        {isUploading(message) ?
          <Container className={style.MainMessagesMessageFile__ProgressContainer}>
            <Container className={style.MainMessagesMessageFile__Progress}
                       absolute
                       bottomLeft
                       style={{width: `${message.progress ? message.progress : 0}%`}}
                       title={`${message.progress && message.progress}`}/>
          </Container>
          : ""}
        <MainMessagesMessageBox message={message}
                                onRepliedMessageClicked={onRepliedMessageClicked}
                                maxReplyFragmentWidth={isImage && `${imageSizeLink.width}px`}
                                isChannel={isChannel}
                                isGroup={isGroup}
                                isFirstMessage={isFirstMessage}
                                isMessageByMe={isMessageByMe}>
          <MainMessagesMessageBoxHighLighter message={message} highLightMessage={highLightMessage}/>
          <Container>
            <Container relative
                       className={style.MainMessagesMessageFile__FileContainer}>
              {isImage ?
                <Container style={{width: `${imageSizeLink.width}px`}}>
                  <IndexModalMediaFragment link={imageSizeLink.imageLinkOrig} options={{caption: message.message}}>
                    <Image className={mainMessagesFileImageClassNames}
                           src={imageSizeLink.imageLink}
                           style={{maxWidth: `${imageSizeLink.width}px`, height: `${imageSizeLink.height}px`}}/>
                  </IndexModalMediaFragment>
                  <Container userSelect={mobileCheck() ? "none" : "text"} onDoubleClick={e => e.stopPropagation()}>
                    <Text isHTML wordWrap="breakWord" whiteSpace="preWrap" color="text" dark>
                      {mentionify(emailify(decodeEmoji(urlify(clearHtml(message.message)))))}
                    </Text>
                  </Container>

                </Container>
                :
                <Container className={style.MainMessagesMessageFile__FileName}>
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
              <Container className={style.MainMessagesMessageFile__FileControlIcon} topCenter={isImage}
                         style={isImage ? {
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
                {mentionify(emailify(decodeEmoji(urlify(clearHtml(message.message)))))}
              </Text>
            </Container>
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