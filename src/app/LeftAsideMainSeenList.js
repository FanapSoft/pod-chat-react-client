// src/
import React, {Component} from "react";
import {connect} from "react-redux";
import {getName, ContactList} from "./_component/contactList";

//strings

//actions
import {messageGetSeenList} from "../actions/messageActions";
import {threadCreateWithUser} from "../actions/threadActions";

//UI components
import Container from "../../../pod-chat-ui-kit/src/container";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import Scroller from "../../../pod-chat-ui-kit/src/scroller";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import strings from "../constants/localization";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import {avatarUrlGenerator} from "../utils/helpers";

//styling

@connect(store => {
  return {
    smallVersion: store.chatSmallVersion,
    thread: store.thread.thread,
    leftAsideShowing: store.threadLeftAsideShowing,
    user: store.user
  }
})
export default class LeftAsideMain extends Component {

  constructor(props) {
    super(props);
    this.onStartChat = this.onStartChat.bind(this);
    this.onScrollBottomThreshold = this.onScrollBottomThreshold.bind(this);
    this.state = {
      seenList: null
    }
  }

  componentDidUpdate(oldProps) {
    const {leftAsideShowing: oldLeftAsideShowing} = oldProps;
    const {leftAsideShowing} = this.props;
    const {data, isShowing} = leftAsideShowing;
    const {data: oldData} = oldLeftAsideShowing;
    if (isShowing) {
      if (data) {
        if (!oldData || oldData !== data) {
          this.getMessageSeenList(data);
        }
      }
    }
  }

  onStartChat(id) {
    this.props.dispatch(threadCreateWithUser(id, "TO_BE_USER_ID"));
  }

  getMessageSeenList(messageId) {
    const {dispatch} = this.props;
    this.setState({
      seenList: null,
      seeListLoading: true
    });
    dispatch(messageGetSeenList(messageId)).then(result => {
      this.setState({
        seenList: result,
        seeListLoading: false
      })
    });
  }

  onScrollBottomThreshold() {

  }

  render() {
    const {seenList, seeListLoading} = this.state;
    if (seeListLoading) {
      return (
        <Container relative userSelect="none">
          <Container topCenter>
            <Loading hasSpace><LoadingBlinkDots size="sm"/></Loading>
          </Container>
        </Container>
      )
    }
    return (
      <Container relative>
        {
          seenList && seenList.length > 1 ?
            <ContactList height={"calc(100vh - 89px)"}
                         contacts={seenList}
                         avatarSize={avatarUrlGenerator.SIZES.SMALL}
                         selection
                         invert/>
            :
            <Container relative>
              <Container topCenter>
                <Gap y={2}/>
                <Text>{strings.noBodyReadMessage}</Text>
              </Container>
            </Container>
        }
      </Container>
    )
  }
}
