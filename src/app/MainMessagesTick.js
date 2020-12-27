// src/list/BoxSceneMessages
import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {messageSelectedCondition} from "../utils/helpers";

//strings

//actions
import {
  threadCheckedMessageList,
} from "../actions/threadActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";

//styling
import style from "../../styles/app/MainMessagesTick.scss";

@connect()
export default class messageTickFragment extends Component {

  constructor(props) {
    super(props);
  }

  onAddToCheckedMessage(message, isAdd, e) {
    e.stopPropagation();
    if (!message.id) {
      return;
    }
    this.props.dispatch(threadCheckedMessageList(isAdd, message));
  }

  render(){
    const {message, threadCheckedMessageList} = this.props;
    const isExisted = messageSelectedCondition(message, threadCheckedMessageList);
    const classNames = classnames({
      [style.MainMessagesTick]: true,
      [style["MainMessages__Tick--selected"]]: isExisted
    });
    return <Container className={classNames} onClick={this.onAddToCheckedMessage.bind(this, message, !isExisted)}/>;
  }


}