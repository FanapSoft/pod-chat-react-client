// /src/app/MainHeadBatchActions
import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {isChannel, isThreadOwner} from "../utils/helpers";

//strings
import strings from "../constants/localization";

//actions
import {threadModalListShowing} from "../actions/threadActions";
import {chatModalPrompt} from "../actions/chatActions";

//UI components
import Gap from "../../../pod-chat-ui-kit/src/gap";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {MdDelete} from "react-icons/md";
import {TiArrowForward} from "react-icons/ti";
import {MessageDeletePrompt} from "./_component/prompts";

//styling
import style from "../../styles/app/MainHeadBatchActions.scss";
import styleVar from "../../styles/variables.scss";

@connect(store => {
  return {
    user: store.user.user
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

            {(!isChannel(thread) || isThreadOwner(thread, user)) &&
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
