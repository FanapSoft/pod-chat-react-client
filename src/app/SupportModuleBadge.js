// app/index.js
import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";

//strings

//actions
import {chatSupportModuleBadgeShowing} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {ButtonFloating} from "../../../pod-chat-ui-kit/src/button";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import Image from "../../../pod-chat-ui-kit/src/image";

//styling
import style from "../../styles/app/SupportModuleBadge.scss";
import talkLogo from "../../styles/images/SupportModuleBadge/talk-logo.png";
import {threadCreateWithExistThread, threadCreateWithUser, threadGetList} from "../actions/threadActions";

@connect(store => {
  return {
    chatInstance: store.chatInstance.chatSDK,
    supportMode: store.chatSupportMode
  };
}, null, null, {forwardRef: true})
export default class SupportModuleBadge extends Component {

  constructor(props) {
    super(props);
    this.onShowChatClick = this.onShowChatClick.bind(this);
    this.state = {
      showLoading: true
    }
  }

  componentDidUpdate(oldProps) {
    const {chatInstance, supportMode, dispatch} = this.props;
    if (oldProps.chatInstance !== chatInstance) {
      chatInstance.getThreadInfo({threadIds: [supportMode]}).then(thread => {
        if (!thread) {
          return;
        }
        dispatch(threadCreateWithExistThread(thread));
        this.setState({
          showLoading: false
        })
      });
    }
  }

  onShowChatClick() {
    this.props.dispatch(chatSupportModuleBadgeShowing(false));
  }

  render() {
    const {showLoading} = this.state;
    const classNames = classnames({
      [style.SupportModuleBadge]: true
    });
    return (
      <ButtonFloating className={classNames} onClick={showLoading ? null : this.onShowChatClick}
                      position={{right: 0, bottom: 0}}>
        {showLoading &&
        <Container className={style.SupportModuleBadge__LoadingContainer}>
          <Container center style={{marginTop: "-6px"}}>
            <Loading><LoadingBlinkDots size="sm" invert/></Loading>
          </Container>
        </Container>
        }
        <Image
          className={style.SupportModuleBadge__Image}
          setOnBackground
          src={talkLogo}/>
      </ButtonFloating>
    );
  }
}
