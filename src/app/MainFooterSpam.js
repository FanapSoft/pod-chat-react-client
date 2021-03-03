// src/list/BoxScene.js
import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import checkForPrivilege from "../utils/privilege";

//strings
import strings from "../constants/localization";
import {THREAD_ADMIN} from "../constants/privilege";

//actions
import {contactBlock} from "../actions/contactActions";
import {threadNotification, threadSpamPv} from "../actions/threadActions";
import {chatModalPrompt} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import Text from "../../../pod-chat-ui-kit/src/typography/Text";
import Gap from "../../../pod-chat-ui-kit/src/gap";

//styling
import style from "../../styles/app/MainFooterSpam.scss";
import {isChannel, isGroup} from "../utils/helpers";


function showMuteForChannel(props) {
  const {
    thread,
    user
  } = props;
  if (!thread || !user) {
    return false;
  }

  if (!thread.group) {
    return false;
  }

  if (thread.type !== 8) {
    return false;
  }
  return !checkForPrivilege(thread, THREAD_ADMIN);
}

function showSpam(props) {
  const {
    thread,
    user,
    participants,
    participantsFetching,
    contacts,
    contactsFetching
  } = props;
  if (!user) {
    return false;
  }
  if (!thread || !thread.inviter) {
    return false;
  }
  if (thread.inviter.id === user.id) {
    return false;
  }
  if (participantsFetching || contactsFetching) {
    return false;
  }
  let participant;
  if (thread.group) {
    return false;
  }
  if (!contacts || !contacts.length) {
    return false
  }
  if (!participants || !participants.length) {
    return false;
  }
  participant = participants.filter(e => e.id !== user.id)[0];
  if (!participant) {
    return false;
  }
  for (const contact of contacts) {
    if (contact.blockId) {
      continue;
    }
    if (contact.id === participant.contactId) {
      return false;
    }
  }
  return thread.canSpam;
}


export function showBlock(props) {
  const {
    thread,
    user,
    participants,
    participantsFetching
  } = props;
  if (participantsFetching) {
    return false;
  }
  let participant;
  if (isChannel(thread) || isGroup(thread)) {
    return false;
  }
  if (!participants || !participants.length) {
    return false;
  }
  if (participants[0].threadId !== thread.id) {
    return false;
  }
  participant = participants.filter(e => e.id !== user.id)[0];
  if (!participant) {
    return false;
  }
  return participant.blocked;
}

function ActionBaseFragment({onClick, classNamesObject, text}) {
  const newClassNamesObject = {
    ...classNamesObject, ...{
      [style.MainFooterSpam__ActionBase]: true
    }
  };
  const classNames = classnames(newClassNamesObject);
  return (
    <Container className={classNames} userSelect="none" onClick={onClick}>
      <Container className={style.MainFooterSpam__ActionBaseTextContainer}>
        <Text color="accent" bold>{text}</Text>
      </Container>
    </Container>)
}

@connect(store => {
  return {
    contacts: store.contactGetList.contacts,
    contactsFetching: store.contactGetList.fetching,
    thread: store.thread.thread,
    participants: store.threadParticipantList.participants,
    participantsFetching: store.threadParticipantList.fetching,
    user: store.user.user
  };
}, null, null, {forwardRef: true})
export default class MainFooterSpam extends Component {

  constructor() {
    super();
    this.reportSpamClick = this.reportSpamClick.bind(this);
    this.onUnblockSelect = this.onUnblockSelect.bind(this);
    this.onBlockSelect = this.onBlockSelect.bind(this);
    this.onThreadMute = this.onThreadMute.bind(this);
  }

  reportSpamClick() {
    const {dispatch, thread} = this.props;
    dispatch(chatModalPrompt(true, `${strings.areYouSureToDoIt}؟`, () => {
      dispatch(threadSpamPv(thread.id));
      dispatch(chatModalPrompt());
    }, null, strings.accept));
  }

  onUnblockSelect() {
    const {dispatch, thread} = this.props;
    dispatch(chatModalPrompt(true, `${strings.areYouSureToDoIt}؟`, () => {
      dispatch(contactBlock(thread.id));
      dispatch(chatModalPrompt());
    }, null, strings.accept));
  }

  onBlockSelect() {
    const {dispatch, thread} = this.props;
    dispatch(chatModalPrompt(true, `${strings.areYouSureToDoIt}؟`, () => {
      dispatch(contactBlock(thread.id, true, thread));
      dispatch(chatModalPrompt());
    }, null, strings.accept));
  }

  onThreadMute() {
    const {dispatch, thread} = this.props;
    dispatch(threadNotification(thread.id, !thread.mute));
  }

  render() {
    const {thread} = this.props;
    const showSpamming = false;//showSpam(this.props);
    const showBlockIs = showBlock(this.props);
    const showMuteForChannelIs = showMuteForChannel(this.props);
    let classNamesObject = {
      [style.MainFooterSpam]: true,
      [style["MainFooterSpam--active"]]: showSpamming || showBlockIs || showMuteForChannelIs
    };
    const classNames = classnames(classNamesObject);
    return (
      showSpamming ?
        <Container className={classNames} userSelect="none">
          <Container style={{margin: "0 auto"}}>
            <Container onClick={this.reportSpamClick} inline>
              <Text linkStyle color="accent" bold>
                {strings.reportSpam}
              </Text>
            </Container>
            <Gap x={5}/>
            <Container onClick={this.onBlockSelect} inline>
              <Text linkStyle color="accent" bold>
                {strings.block}
              </Text>
            </Container>
          </Container>
        </Container>
        : <ActionBaseFragment classNamesObject={classNamesObject}
                              text={showBlockIs ? strings.unBlock : thread.mute ? strings.unmute : strings.mute}
                              onClick={showBlockIs ? this.onUnblockSelect : this.onThreadMute}/>
    );
  }
}