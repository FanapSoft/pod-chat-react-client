import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {getName} from "./_component/contactList";

//actions
import {
  threadModalThreadInfoShowing,
  threadParticipantList,
} from "../actions/threadActions";
import {ROUTE_THREAD_INFO} from "../constants/routes";

//UI components
import Gap from "../../../uikit/src/gap";
import Container from "../../../uikit/src/container";
import Divider from "../../../uikit/src/divider";

//UI components

import {BoxModalMediaFragment} from "./index";
import ModalThreadInfoGroup from "./ModalThreadInfoGroup";
import ModalThreadInfoPerson from "./ModalThreadInfoPerson";

//styling
import style from "../../styles/app/ModalThreadInfo.scss";

function GapFragment() {
  return (
    <Container className={style.ModalThreadInfo__GapContainer}>
      <Gap y={20} block>
        <Divider thick={5} color="background" shadowInset/>
      </Gap>
    </Container>
  )
}

function AvatarModalMediaFragment({participant, thread}) {
  let image, caption;
  if (participant) {
    image = participant.image;
    caption = getName(participant);
  } else {
    image = thread.image;
    caption = thread.title;
  }
  return image ? <BoxModalMediaFragment link={image} options={{caption}}
                                        linkClassName={style.ModalThreadInfo__ModalMediaLink}/> : null;
}

@connect(store => {
  return {
    user: store.user.user,
    isShow: store.threadModalThreadInfoShowing,
    participants: store.threadParticipantList.participants,
    participantsFetching: store.threadParticipantList.fetching,
    thread: store.thread.thread,
    contacts: store.contactGetList.contacts,
    chatRouterLess: store.chatRouterLess
  };
}, null, null, {withRef: true})
class ModalThreadInfo extends Component {

  constructor(props) {
    super(props);
    this.onClose = this.onClose.bind(this);
  }

  componentDidMount() {
    const {thread, dispatch, match, isShow} = this.props;
    if (thread.id) {
      if (!isShow) {
        if (match.path === ROUTE_THREAD_INFO) {
          dispatch(threadModalThreadInfoShowing(true));
        }
      }
    }
  }

  componentDidUpdate(oldProps) {
    const {thread, dispatch} = this.props;
    if (thread.id) {
      if (oldProps.thread.id !== thread.id) {
        if (thread.onTheFly) {
          dispatch(threadParticipantList(thread.id));
        }
      }
    }
  }

  onClose(dontGoBack) {
    const {dispatch, chatRouterLess, history} = this.props;
    dispatch(threadModalThreadInfoShowing());
    if (dontGoBack === true) {
      return;
    }
    if (!chatRouterLess) {
      history.goBack();
    }
  }

  render() {
    const {participants, contacts, isShow, thread, user, smallVersion, participantsFetching, history} = this.props;
    const isGroup = thread.group;
    const commonProps = {
      participants,
      contacts,
      isShow,
      thread,
      user,
      onClose: this.onClose,
      smallVersion,
      participantsFetching,
      history,
      GapFragment,
      AvatarModalMediaFragment
    };
    return isGroup ? <ModalThreadInfoGroup {...commonProps}/> : <ModalThreadInfoPerson {...commonProps}/>;
  }
}

export default withRouter(ModalThreadInfo);