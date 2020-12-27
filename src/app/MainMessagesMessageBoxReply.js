import {decodeEmoji} from "../utils/helpers";
import {clearHtml} from "./_component/Input";
import strings from "../constants/localization";
import style from "../../styles/app/MainMessagesMessage.scss";
import ImageFetcher from "./_component/ImageFetcher";
import React from "react";

export default function({isMessageByMe, message, gotoMessageFunc, maxWidth}) {
  if (message.replyInfo) {
    const replyInfo = message.replyInfo;
    let meta = "";
    try {
      meta = JSON.parse(replyInfo.metadata);
    } catch (e) {
    }
    const text = decodeEmoji(clearHtml(replyInfo.message));
    const file = meta && meta.file;
    let isImage, isVideo, imageLink;
    if (file) {
      isImage = file.mimeType.indexOf("image") > -1;
      isVideo = file.mimeType.indexOf("video") > -1;
      if (isImage && !file.fileHash) {
        let width = file.width;
        let height = file.height;
        const ratio = height / width;
        const maxWidth = 100;
        height = Math.ceil(maxWidth * ratio);
        imageLink = `${file.link}&width=${maxWidth}&height=${height}`;
      }
    }
    const imageLinkString = `url(${imageLink})`;
    const inlineStyle = {
      borderRadius: "5px", maxHeight: "70px", overflow: "hidden", position: "relative"
    };
    if (isMessageByMe) {
      inlineStyle.backgroundColor = "#dee8d2";
    }
    return (
      <Container
        maxWidth={maxWidth}
        cursor={replyInfo.deleted ? "default" : "pointer"}
        onDoubleClick={e => e.stopPropagation()}
        onClick={gotoMessageFunc.bind(null, replyInfo.repliedToMessageTime, replyInfo.deleted)}>
        <Paper colorBackground
               style={inlineStyle}>
          <Text bold size="xs">{strings.replyTo}:</Text>
          {replyInfo.deleted ?
            <Text bold size="xs" italic color="gray" dark>{strings.messageDeleted}</Text>
            :
            <Container>
              {isImage && text ?
                <Text italic size="xs" isHTML>{text && text.slice(0, 25)}</Text>
                :
                isImage && !text ?
                  <Container>
                    <MdCameraAlt size={style.iconSizeSm} color={style.colorGrayDark}
                                 style={{margin: "0 5px", verticalAlign: "middle"}}/>
                    <Text inline size="sm" bold color="gray" dark>{strings.photo}</Text>
                  </Container> :
                  isVideo ?
                    <Container>
                      <MdVideocam size={style.iconSizeSm} color={style.colorGrayDark}
                                  style={{margin: "0 5px", verticalAlign: "middle"}}/>
                      <Text inline size="sm" bold color="gray" dark>{strings.video}</Text>
                    </Container> :
                    file ?
                      <Container>
                        <MdInsertDriveFile size={style.iconSizeSm} color={style.colorGrayDark}
                                           style={{margin: "0 5px", verticalAlign: "middle"}}/>
                        <Text inline size="sm" bold color="gray" dark>{file.originalName}</Text>
                      </Container>
                      :
                      <Text italic size="xs" isHTML>{text}</Text>}

              {isImage &&
              meta.fileHash ?
                <ImageFetcher className={style.MainMessagesMessage__ReplyFragmentImage}
                              hashCode={meta.fileHash}
                              size={1}
                              setOnBackground/>
                :
                isImage ?
                  <Container className={style.MainMessagesMessage__ReplyFragmentImage}
                             style={{backgroundImage: imageLinkString}}/> :
                  null
              }

            </Container>

          }
        </Paper>
        <Gap block y={5}/>
      </Container>
    )
  }
  return "";
}