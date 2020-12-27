import classnames from "classnames";
import style from "../../styles/app/MainMessagesMessage.scss";
import React from "react";

export default function({message, highLightMessage}) {
  const classNames = classnames({
    [style.MainMessagesMessage__Highlighter]: true,
    [style["MainMessagesMessage__Highlighter--highlighted"]]: highLightMessage && highLightMessage === message.time
  });
  return (
    <Container className={classNames}>
      <Container className={style.MainMessagesMessage__HighlighterBox}/>
    </Container>
  );
}