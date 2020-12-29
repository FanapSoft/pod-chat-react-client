import React from "react";
import classnames from "classnames";

import Container from "../../../pod-chat-ui-kit/src/container";

import style from "../../styles/app/MainMessagesMessageBoxHighLighter.scss";


export default function({message, highLightMessage}) {
  const classNames = classnames({
    [style.MainMessagesMessageBoxHighLighter]: true,
    [style["MainMessagesMessageBoxHighLighter--highlighted"]]: highLightMessage && highLightMessage === message.time
  });
  return (
    <Container className={classNames}>
      <Container className={style.MainMessagesMessageBoxHighLighter__Box}/>
    </Container>
  );
}