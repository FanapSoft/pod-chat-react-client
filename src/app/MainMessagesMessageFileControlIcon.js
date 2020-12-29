import React, {Fragment} from "react";

import Container from "../../../pod-chat-ui-kit/src/container";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";
import {
  MdPlayArrow,
  MdPause,
  MdClose,
  MdArrowDownward
} from "react-icons/md";

import style from "../../styles/app/MainMessagesMessageControlIcon.scss";
import styleVar from "../../styles/variables.scss";

export default function ({inlineStyle, fixCenter, onClick, isCancel, isMedia, isDownload}) {

  return <Container className={style.MainMessagesMessageFileControlIcon} style={inlineStyle || null} center={fixCenter}>
    <Shape color="accent"
           size="lg"
           onDoubleClick={e => e.stopPropagation()}
           onClick={onClick}>
      <ShapeCircle>
        {
          isCancel ?
            <MdClose style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
            :
            <Fragment>

              {
                isMedia === "playing" &&
                <MdPause style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
              }
              {
                isMedia === "pause" &&
                <MdPlayArrow style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
              }
              {
                isDownload &&
                <MdArrowDownward style={{marginTop: "8px"}} size={styleVar.iconSizeSm}/>
              }

            </Fragment>
        }
      </ShapeCircle>
    </Shape>
  </Container>
}

