// src/list/BoxSceneMessages
import React, {Component} from "react";
import {connect} from "react-redux";
import "moment/locale/fa";

//strings
import strings from "../constants/localization";

//actions

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import Text from "../../../pod-chat-ui-kit/src/typography/Text";

//styling

import style from "../../styles/app/MainMessagesUnreadBar.scss";



@connect(store => {
  return {};
}, null, null, {forwardRef: true})
export default class MainMessages extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return <Gap y={5} block>
      <Container className={style.MainMessagesUnreadBar}>

        <Container className={style.MainMessagesUnreadBar__Content}>
          <Text color="accent">{strings.unreadMessages}</Text>
        </Container>

      </Container>
    </Gap>
  }
}