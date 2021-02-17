import React, {useState} from "react";

import {
  getFileDownloadingFromHashMapWindow,
  getFileFromHashMap, getFileFromHashMapWindow,
  getMessageMetaData,
  humanFileSize
} from "../utils/helpers";

import Text from "../../../pod-chat-ui-kit/src/typography/Text";
import Container from "../../../pod-chat-ui-kit/src/container";
import strings from "../constants/localization";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import Image from "../../../pod-chat-ui-kit/src/image";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";
import {
  MdArrowDownward,
  MdPlayArrow,
  MdClose
} from "react-icons/md";
import {IndexModalMediaFragment} from "./index";


import styleVar from "../../styles/variables.scss";
import style from "../../styles/app/ModalThreadInfoMessageTypesMedia.scss";
import {threadGoToMessageId, threadModalThreadInfoShowing} from "../actions/threadActions";

export default function ({dispatch, message, type}) {
  const idMessage = `${message.id}-message-types-${type}`;
  const idMessageTrigger = `${idMessage}-trigger`;
  let [fileResult, setFileResult] = useState(null);
  const metaData = getMessageMetaData(message).file;
  if (!metaData) {
    return null;
  }
  const {originalName, size} = metaData;
  const gotoMessage = () => {
    dispatch(threadModalThreadInfoShowing());
    window.modalMediaRef.close();
    dispatch(threadGoToMessageId(message.time));
  };
  const setOrGetAttributeFromLinkTrigger = value => {
    const elem = document.getElementById(idMessageTrigger);
    if (value === true) {
      if (elem) {
        return elem;
      }
      return {
        click: e => {
        }
      };
    }
    if (elem) {
      if (value) {
        return elem.setAttribute("play", value);
      }
      return elem.getAttribute("play");
    }
  };
  const onPlayClick = result => {
    if (result) {
      return document.getElementById(idMessageTrigger).click();
    }
    setOrGetAttributeFromLinkTrigger("true");
    setFileResult(getFileFromHashMapWindow(metaData.fileHash, setFileResult, dispatch, true, true));
  };

  fileResult = getFileDownloadingFromHashMapWindow(metaData.fileHash);
  const result = typeof fileResult === "string" && fileResult.indexOf("blob") > -1 ? fileResult : null;
  const isDownloading = fileResult === true || fileResult === "LOADING";
  const isPlaying = result && setOrGetAttributeFromLinkTrigger() === "true";
  if (isPlaying) {
    setTimeout(e => {
      setOrGetAttributeFromLinkTrigger(true).click();
      setOrGetAttributeFromLinkTrigger("false");
    }, 300);
  }
  return (
    <Container className={style.ModalThreadInfoMessageTypesMedia__FileContainer} onClick={gotoMessage} key={idMessage}>
      <Container maxWidth="calc(100% - 30px)">

        <Container className={style.ModalThreadInfoMessageTypesMedia__FileNameContainer}>
          <Text whiteSpace="noWrap" bold>
            {originalName}
          </Text>
        </Container>

        <Text size="xs" color="gray">{humanFileSize(size, true)}</Text>
      </Container>
      <Container centerLeft onClick={e => e.stopPropagation()}>
        {type === "file" ?
          <Text id={idMessageTrigger} link={`#${idMessage}`} download={originalName} href={result} linkClearStyle/>
          :
          <Text id={idMessageTrigger} link={`#${idMessage}`} linkClearStyle data-fancybox/>
        }
        {type === "video" ?
          <video controls id={idMessage} style={{display: "none"}}
                 src={result}/> :
          type === "sound" || type === "voice" ? <audio controls id={idMessage} style={{display: "none"}}
                                                        src={result}/> : ""
        }
        {
          isDownloading ?
            <Loading><LoadingBlinkDots size="sm"/></Loading>
            :
            type === "file" ?
              <MdArrowDownward style={{cursor: "pointer"}} color={styleVar.colorAccent} size={styleVar.iconSizeSm}
                               onClick={onPlayClick.bind(this, result)}/>
              :
              <MdPlayArrow style={{cursor: "pointer"}} color={styleVar.colorAccent} size={styleVar.iconSizeSm}
                           onClick={onPlayClick.bind(this, result)}/>
        }
      </Container>
    </Container>
  )
}