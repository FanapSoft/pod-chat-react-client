// src/app/MainHeadThreadInfo
import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import classnames from "classnames";
import {
  avatarNameGenerator,
  avatarUrlGenerator,
  getMessageMetaData,
  isChannel,
  isGroup,
  socketStatus
} from "../utils/helpers";
import {getParticipant} from "./ModalThreadInfoPerson";
import date from "../utils/date";

//strings
import strings from "../constants/localization";
import {ROUTE_THREAD_INFO} from "../constants/routes";

//actions
import {threadModalThreadInfoShowing} from "../actions/threadActions";

//UI components
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import Container from "../../../pod-chat-ui-kit/src/container";
import Typing from "./_component/Typing";

//styling
import style from "../../styles/app/MainHeadThreadInfo.scss";

@connect(store => {
  return {
    chatState: store.chatState,
    chatRouterLess: store.chatRouterLess,
    threadShowing: store.threadShowing,
    participants: store.threadParticipantList.participants,
    user: store.user.user
  };
})
class MainHeadThreadInfo extends Component {

  constructor(props) {
    super(props);
    this.onShowInfoClick = this.onShowInfoClick.bind(this);
    this.state = {
      avatar: null
    }
  }

  onShowInfoClick() {
    const {chatRouterLess, history} = this.props;
    if (!chatRouterLess) {
      history.push(ROUTE_THREAD_INFO);
    }
    this.props.dispatch(threadModalThreadInfoShowing(true));
  }

  render() {
    const {thread, smallVersion, chatState, participants, user} = this.props;
    const {isDisconnected, isConnected} = socketStatus(chatState);
    const participant = getParticipant(participants, user);
    if (!thread.id) {
      return null;
    }
    const classNames = classnames({
      [style.MainHeadThreadInfo]: true,
      [style["MainHeadThreadInfo--smallVersion"]]: smallVersion
    });
    const typing = thread.isTyping;
    const typingText = typing && typing.isTyping;
    return (
      <Container className={classNames} onClick={this.onShowInfoClick} relative>
        <Avatar>
          <AvatarImage
            src={avatarUrlGenerator.apply(this, [thread.image, avatarUrlGenerator.SIZES.SMALL, getMessageMetaData(thread)])}
            text={avatarNameGenerator(thread.title).letter}
            textBg={avatarNameGenerator(thread.title).color}/>
          <AvatarName>

            <Container className={style.MainHeadThreadInfo__ThreadInfoTextContainer}>
              <Container>
                <Text size="lg" invert overflow="ellipsis">{thread.title}</Text>
              </Container>
              {
                typingText ?
                  <Typing isGroup={thread.group} typing={thread.isTyping} textProps={{size: "xs", color: "yellow"}}/>
                  :
                  <Container>

                    {
                      isConnected ?
                        isGroup(thread) || isChannel(thread) ?
                          <Text size="xs" invert overflow="ellipsis">{thread.participantCount} {strings.member}</Text>
                          :
                          <Text color={typingText ? "yellow" : null}
                                size="xs"
                                invert
                                overflow="ellipsis">{strings.lastSeen(date.prettifySince(participant ? participant.notSeenDuration : ""))}</Text>
                        :
                        <Text size="xs"
                              invert
                              overflow="ellipsis">{isDisconnected ? `${strings.chatState.networkDisconnected}...` : `${strings.chatState.reconnecting}...`}</Text>
                    }

                  </Container>
              }
            </Container>

          </AvatarName>
        </Avatar>

      </Container>
    )
  }
}

export default withRouter(MainHeadThreadInfo);