import React, {Fragment, useState} from "react";

import {
  getMessageMetaData,
  humanFileSize
} from "../utils/helpers";
import {getFile, getImage, getFileDownloading, updateLink} from "../utils/hashmap";

import Text from "../../../pod-chat-ui-kit/src/typography/Text";
import Container from "../../../pod-chat-ui-kit/src/container";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";

import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import {
  MdArrowDownward,
  MdPlayArrow
} from "react-icons/md";

const lastFileRequest = {
  downloadFunction: null,
  fileHash: null,
  id: null
};

function fileStatus(fileHash) {
  let fileResult = getFileDownloading(fileHash);
  const isDownloading = fileResult === true || fileResult === "LOADING";
  if (isDownloading) {
    return "DOWNLOADING";
  }
  if (!fileResult) {
    return "NOT_STARTED";
  }
  return fileResult
}

function gotoMessage(dispatch, message) {
  dispatch(threadModalThreadInfoShowing());
  window.modalMediaRef.close();
  dispatch(threadGoToMessageId(message.time));
}

function openModalMedia(idMessage) {
  window.modalMediaRef.getFancyBox().open({src: `#${idMessage}`, opts: {arrows: false, infobar: false}});
}

function onPlayClick(fileHash, dispatch, setDownloading, idMessage, idMessageTrigger, downloadable) {
  const fileStatusResult = fileStatus(fileHash);
  if (lastFileRequest.downloadFunction) {
    lastFileRequest.downloadFunction(false);
    //cancelFileDownloadingFromHashMapWindow(lastFileRequest.fileHash, dispatch);
  }
  lastFileRequest.downloadFunction = setDownloading;
  lastFileRequest.id = idMessage;
  lastFileRequest.fileHash = fileHash;

  function pastAction() {
    if (downloadable) {
      if (document.getElementById(idMessageTrigger)) {
        document.getElementById(idMessageTrigger).click();
      }
    } else {
      setTimeout(e => {
        if (document.getElementById(idMessage)) {
          openModalMedia(idMessage);
        }
      }, 300);
    }
  }

  if (fileStatusResult === "NOT_STARTED") {
    setDownloading(true);
    getFile(fileHash, () => {
      if (lastFileRequest.id === idMessage) {
        setTimeout(() => {
          setDownloading(false);
          pastAction();
        }, 100)
      }
    }, dispatch, true, true, {responseType: "link"})
  } else {
    //TODO: fix it when on new token coming
    if (fileStatusResult !== "DOWNLOADING") {
      updateLink(fileHash, dispatch, true).then(link => {
        if (downloadable) {
          const elem = document.getElementById(idMessageTrigger);
          if (elem) {
            elem.href = link;
          }
        } else {
          const elem = document.getElementById(idMessage);
          if (elem) {
            elem.src = link
          }
        }
        pastAction();
      })
    }
  }
}

import styleVar from "../../styles/variables.scss";
import style from "../../styles/app/ModalThreadInfoMessageTypesMedia.scss";
import {threadGoToMessageId, threadModalThreadInfoShowing} from "../actions/threadActions";


export default function ({dispatch, message, type}) {
  const idMessage = `${message.id}-message-types-${type}`;
  const idMessageTrigger = `${idMessage}-trigger`;
  let [downloading, setDownloading] = useState(false);
  const metaData = getMessageMetaData(message).file;
  if (!metaData) {
    return null;
  }
  const {originalName, size} = metaData;
  const fileResult = fileStatus(metaData.fileHash);
  return (
    <Container className={style.ModalThreadInfoMessageTypesMedia__FileContainer}
               onClick={gotoMessage.bind(null, dispatch, message)} key={idMessage}>
      <Container maxWidth="calc(100% - 50px)">

        <Container className={style.ModalThreadInfoMessageTypesMedia__FileNameContainer}>
          <Text whiteSpace="noWrap" bold>{originalName}</Text>
        </Container>

        <Text size="xs" color="gray">{humanFileSize(size, true)}</Text>
      </Container>
      <Container centerLeft onClick={e => e.stopPropagation()} style={{marginLeft: "5px"}}>
        {
          (fileResult !== "DOWNLOADING" && fileResult !== "NOT_STARTED") &&
          <Fragment>
            <Fragment>
              {
                type === "file" &&
                <Text id={idMessageTrigger} link={`#${idMessage}`} download={originalName} href={fileResult}
                      linkClearStyle/>
              }
            </Fragment>

            <Fragment>
              {
                type === "video" ?
                  <video controls id={idMessage} style={{display: "none"}}
                         src={fileResult}/> :
                  type === "sound" || type === "voice" ? <audio controls id={idMessage} style={{display: "none"}}
                                                                src={fileResult}/> : ""
              }
            </Fragment>
          </Fragment>
        }

        {
          downloading ?
            <Loading><LoadingBlinkDots size="sm"/></Loading>
            :
            <Shape color="accent"
                   size="lg"
                   onClick={onPlayClick.bind(null, metaData.fileHash, dispatch, setDownloading, idMessage, idMessageTrigger, type === "file")}>
              <ShapeCircle>
                {
                  type === "file" ?
                    <MdArrowDownward style={{cursor: "pointer", marginTop: "8px"}}
                                     size={styleVar.iconSizeSm}/>
                    :
                    <MdPlayArrow style={{cursor: "pointer", marginTop: "8px"}}
                                 size={styleVar.iconSizeSm}/>
                }
              </ShapeCircle>
            </Shape>
        }
      </Container>
    </Container>
  )
}