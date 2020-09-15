// src/list/BoxSceneMessages
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import "moment/locale/fa";
import {avatarNameGenerator, OnWindowFocusInOut, mobileCheck} from "../utils/helpers";

//strings


//actions
import {messageSeen} from "../actions/messageActions";
import {
  threadMessageGetListByMessageId,
  threadMessageGetListPartial,
  threadMessageGetList,
  threadUnreadMentionedMessageGetList,
  threadCheckedMessageList,
  threadNewMessage,
  threadFilesToUpload,
  threadCreateOnTheFly, threadUnreadMentionedMessageRemove
} from "../actions/threadActions";

//components


//styling
import {
  MdExpandMore,
} from "react-icons/md";
import style from "../../styles/app/MainMessagesUnreadBar.scss";
import styleVar from "../../styles/variables.scss";
import Container from "../../../uikit/src/container";
import Gap from "../../../uikit/src/gap";
import Text from "../../../uikit/src/typography/Text";
import strings from "../constants/localization";


@connect(store => {
  return {};
}, null, null, {withRef: true})
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