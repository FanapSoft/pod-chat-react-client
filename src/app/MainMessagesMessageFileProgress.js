import React, {Fragment} from "react";
import classnames from "classnames";

import Container from "../../../pod-chat-ui-kit/src/container";

import style from "../../styles/app/MainMessagesMessageFileProgress.scss";

export default function ({isDownloading, progress}) {
  const progressContainer = classnames({
    [style.MainMessagesMessageFileProgress]: true,
    [style["MainMessagesMessageFileProgress--downloading"]]: isDownloading
  });
  return <Container className={progressContainer}>
    {isDownloading ?
      <Fragment>
        <Container className={style.MainMessagesMessageFileProgress__ProgressLine}/>
        <Container
          className={`${style.MainMessagesMessageFileProgress__ProgressSubLine} ${style["MainMessagesMessageFileProgress__ProgressSubLine--inc"]}`}/>
        <Container
          className={`${style.MainMessagesMessageFileProgress__ProgressSubLine} ${style["MainMessagesMessageFileProgress__ProgressSubLine--dec"]}`}/>
      </Fragment>
      :
      <Fragment>
        <Container className={style.MainMessagesMessageFileProgress__Progress}
                   absolute
                   bottomLeft
                   style={{width: `${progress ? progress : 0}%`}}
                   title={`${progress && progress}`}/>
      </Fragment>
    }


  </Container>
}