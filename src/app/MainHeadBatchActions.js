// /src/app/MainHeadBatchActions

import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {isChannel, isMyThread} from "./Main";

//strings
import strings from "../constants/localization";

//actions
import {
  threadSelectMessageShowing,
  threadModalListShowing, threadCheckedMessageList
} from "../actions/threadActions";
import {messageDelete} from "../actions/messageActions";
import {chatModalPrompt} from "../actions/chatActions";

//UI components
import Gap from "../../../uikit/src/gap";
import Container from "../../../uikit/src/container";
import {Text} from "../../../uikit/src/typography";
import {MdDelete} from "react-icons/md";
import {TiArrowForward} from "react-icons/ti";

//styling
import style from "../../styles/app/MainHeadBatchActions.scss";
import styleVar from "../../styles/variables.scss";
import {MessageDeletePrompt} from "./_component/prompts";

@connect(store => {
  return {
    user: store.user.user,
    smallVersion: store.chatSmallVersion
  };
})
export default class MainHeadBatchActions extends Component {

  constructor(props) {
    super(props);
    this.onForward = this.onForward.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  onForward(e) {
    e.stopPropagation();
    const {dispatch, threadCheckedMessageList} = this.props;
    dispatch(threadModalListShowing(true, threadCheckedMessageList));
  }

  onDelete(e) {
    e.stopPropagation();
    const {dispatch, threadCheckedMessageList: message, user, thread} = this.props;
    dispatch(chatModalPrompt(true,
      null, null, null, null,
      <MessageDeletePrompt user={user} thread={thread} message={message} dispatch={dispatch}/>));
  }

  render() {
    const {smallVersion, threadCheckedMessageList, thread, user} = this.props;
    const classNames = classnames({
      [style.MainHeadBatchActions]: true,
      [style["MainHeadBatchActions--smallVersion"]]: smallVersion
    });
    return (
      <Container className={classNames} centerRight>

        {threadCheckedMessageList && threadCheckedMessageList.length ?
          <Container>

            {(!isChannel(thread) || isMyThread(thread, user)) &&
            <Container className={style.MainHeadBatchActions__DeleteContainer} inline onClick={this.onDelete}>
              <MdDelete size={styleVar.iconSizeMd} color={styleVar.colorWhite}/>
            </Container>
            }
            <Container className={style.MainHeadBatchActions__ForwardContainer} inline onClick={this.onForward}>
              <TiArrowForward size={styleVar.iconSizeMd} color={styleVar.colorWhite}/>
            </Container>

          </Container> :
          <Container>
            <Gap x={10}>
              <Text invert>{strings.selectMessage}</Text>
            </Gap>
          </Container>
        }

      </Container>
    )

  }
}
