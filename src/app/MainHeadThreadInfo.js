// src/list/Avatar.scss.js
import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {socketStatus} from "./AsideHead";

//strings
import strings from "../constants/localization";
import {ROUTE_THREAD, ROUTE_THREAD_INFO} from "../constants/routes";

//actions
import {threadModalThreadInfoShowing} from "../actions/threadActions";

//UI components
import {Text} from "../../../uikit/src/typography";
import Avatar, {AvatarImage, AvatarName} from "../../../uikit/src/avatar";
import Container from "../../../uikit/src/container";

//styling
import style from "../../styles/app/MainHeadThreadInfo.scss";
import classnames from "classnames";
import {avatarNameGenerator, avatarUrlGenerator} from "../utils/helpers";
import Loading from "../../../uikit/src/loading";
import LoadingBlinkDots from "../../../uikit/src/loading/LoadingBlinkDots";
import {getParticipant} from "./ModalThreadInfoPerson";
import date from "../utils/date";

export function TypingFragment({isGroup, typing, textProps}) {
  return (
    <Container style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
      <Text inline bold {...textProps}>{strings.typing(isGroup ? typing.user.user : null)}</Text>
      <Loading><LoadingBlinkDots size="sm" invert/></Loading>
    </Container>
  )
}

@connect(store => {
  return {
    smallVersion: store.chatSmallVersion,
    chatState: store.chatState,
    chatRouterLess: store.chatRouterLess,
    chatFileHashCodeMap: store.chatFileHashCodeUpdate.hashCodeMap,
    thread: store.thread.thread,
    threadShowing: store.threadShowing,
    participants: store.threadParticipantList.participants,
    user: store.user.user
  };
})
class BoxHeadThreadInfo extends Component {

  constructor(props) {
    super(props);
    this.onShowInfoClick = this.onShowInfoClick.bind(this);
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
    const {isDisconnected, timeUntilReconnect, isReconnecting, isConnected} = socketStatus(chatState);
    const participant = getParticipant(participants, user);
    if (thread.id) {
      const classNames = classnames({
        [style.MainHeadThreadInfo]: true,
        [style["MainHeadThreadInfo--smallVersion"]]: smallVersion
      });
      const typing = thread.isTyping;
      const typingText = typing && typing.isTyping;
      return (
        <Container className={classNames} onClick={this.onShowInfoClick} relative>
          <Avatar>
            <AvatarImage src={avatarUrlGenerator.apply(this, [thread.image, avatarUrlGenerator.SIZES.SMALL, thread.metadata])}
                         text={avatarNameGenerator(thread.title).letter}
                         textBg={avatarNameGenerator(thread.title).color}/>
            <AvatarName>

              <Container className={style.MainHeadThreadInfo__ThreadInfoTextContainer}>
                <Container>
                  <Text size="lg" invert overflow="ellipsis">{thread.title}</Text>
                </Container>
                {
                  typingText ?
                    <TypingFragment isGroup={thread.group} typing={thread.isTyping}
                                    textProps={{size: "xs", color: "yellow"}}/> :
                    <Container>

                      {
                        isConnected ?
                          thread.group ?
                            <Text size="xs" invert overflow="ellipsis">{thread.participantCount} {strings.member}</Text>
                            :
                            <Text color={typingText ? "yellow" : null} size="xs" invert
                                  overflow="ellipsis">{strings.lastSeen(date.prettifySince(participant ? participant.notSeenDuration : ""))}</Text>
                          :
                          <Text size="xs" invert overflow="ellipsis">{isDisconnected ? `${strings.chatState.networkDisconnected}...` : `${strings.chatState.reconnecting}...`}</Text>
                      }

                    </Container>
                }
              </Container>

            </AvatarName>
          </Avatar>

        </Container>
      )
    }
    return "";
  }
}

export default withRouter(BoxHeadThreadInfo);