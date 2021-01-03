import React from "react";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {MdChatBubbleOutline} from "react-icons/md";
import strings from "../constants/localization";
import style from "../../styles/app/MainMessagesNoMessages.scss";
import styleVar from "../../styles/variables.scss";

export default function ({className, ...other}) {
  return (
    <Container className={className} {...other}>
      <Container center centerTextAlign relative style={{width: "100%"}}>
        <div className={style.MainMessagesNoMessages__Empty}/>
        <Text size="lg">{strings.thereIsNoMessageToShow}</Text>
        <MdChatBubbleOutline size={styleVar.iconSizeXlg} color={styleVar.colorAccent}/>
      </Container>
    </Container>
  )
}
