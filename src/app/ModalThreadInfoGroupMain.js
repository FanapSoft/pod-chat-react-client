import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {ContactListItemMemoized, getName} from "./_component/contactList";
import ModalContactList, {statics as modalContactListStatics} from "./ModalContactList";
import checkForPrivilege from "../utils/privilege";
import {THREAD_ADMIN} from "../constants/privilege";
import {types} from "../constants/messageTypes";
import {Virtuoso, VirtuosoGrid} from "./_component/Virtuoso";

//strings
import strings from "../constants/localization";
import {avatarUrlGenerator} from "../utils/helpers";

//actions
import {
  threadAddParticipant,
  threadCreateOnTheFly,
  threadLeave,
  threadModalThreadInfoShowing,
  threadNotification,
  threadParticipantList,
  threadRemoveParticipant
} from "../actions/threadActions";
import {chatModalPrompt} from "../actions/chatActions";

//UI components
import {ContactSearchFragment, PartialLoadingFragment} from "./ModalContactList";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Container from "../../../pod-chat-ui-kit/src/container";
import {ListItem} from "../../../pod-chat-ui-kit/src/list";
import ModalThreadInfoMessageTypes from "./ModalThreadInfoMessageTypes";
import ModalThreadInfoGroupMainHead from "./ModalThreadInfoGroupMainHead";
import ModalThreadInfoMessageTypesImage from "./ModalThreadInfoMessageTypesImage";
import ModalThreadInfoMessageTypesMedia from "./ModalThreadInfoMessageTypesMedia";

//styling
import {MdArrowBack, MdPets} from "react-icons/md";
import style from "../../styles/app/ModalThreadInfoGroupMain.scss";
import ModalThreadInfoGroup from "./ModalThreadInfoGroup";
import ModalThreadInfoTabSelector from "./ModalThreadInfoMediaScroller";
import styleVar from "../../styles/variables.scss";

const constants = {
  count: 50,
  ON_ADD_MEMBER: "ON_ADD_MEMBER"
};

function ModalContactListFooterFragment(addMembers, onPrevious, onClose) {
  return (
    <Container>
      {
        addMembers.length > 0 &&
        <Button text onClick={this.onAddMember}>
          {strings.add}
        </Button>
      }
      <Button text onClick={onClose}>{strings.close}</Button>
      <Button text onClick={onPrevious}>
        <MdArrowBack/>
      </Button>
    </Container>
  )
}


export function isOwner(thread, user) {
  return thread.inviter && user.id === thread.inviter.id;
}

@connect(store => {
  return {
    threadParticipantAdd: store.threadParticipantAdd.thread,
    notificationPending: store.threadNotification.fetching,
    contacts: store.contactGetList.contacts,
    participants: store.threadParticipantList.participants,
    participantsHasNext: store.threadParticipantList.hasNext,
    participantsNextOffset: store.threadParticipantList.nextOffset,
    participantsFetching: store.threadParticipantList.fetching,
    participantsPartialFetching: store.threadParticipantListPartial.fetching
  }
}, null, null, {forwardRef: true})
class ModalThreadInfoGroupMain extends Component {

  constructor(props) {
    super(props);
    this.state = {
      addMembers: [],
      internalStep: null,
      removingParticipantIds: [],
      partialParticipantLoading: false,
      query: null,
      endCondition: false,
      onEndReached: null,
      selectedTab: "threadInfo",
      avatar: null,
      mediaList: []
    };
    this.onSelect = this.onSelect.bind(this);
    this.onDeselect = this.onDeselect.bind(this);
    this.onAddMember = this.onAddMember.bind(this);
    this.onStartChat = this.onStartChat.bind(this);
    this.onAddMemberSelect = this.onAddMemberSelect.bind(this);
    this.onSettingsSelect = this.onSettingsSelect.bind(this);
    this.onLeaveSelect = this.onLeaveSelect.bind(this);
    this.onNotificationSelect = this.onNotificationSelect.bind(this);
    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onPrevious = this.onPrevious.bind(this);
    this.onTabSelect = this.onTabSelect.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.setMessageTypesData = this.setMessageTypesData.bind(this);
    this.setOnEndReached = this.setOnEndReached.bind(this);
    this.setEndReachCondition = this.setEndReachCondition.bind(this);
  }

  componentDidMount() {
    const {setHeaderFooterComponent, thread, participantsHasNext, participantsPartialFetching} = this.props;
    const isGroup = thread.group;
    const isChannel = thread.type === 8;
    const FooterFragment = () => {
      return (
        <Fragment>
          {isGroup && checkForPrivilege(thread, THREAD_ADMIN) &&
          <Button text onClick={this.onAddMemberSelect}>
            {strings.addMember}
          </Button>
          }
          <Button text onClick={this.onClose}>{strings.close}</Button>
        </Fragment>
      )
    };
    const HeaderFragment = () => {
      return strings.groupInfo(isChannel);
    };
    setHeaderFooterComponent(HeaderFragment, FooterFragment);
    this.setState({
      endCondition: participantsHasNext && !participantsPartialFetching
    });
  }

  componentDidUpdate(oldProps) {
    const {endCondition, selectedTab} = this.state;
    if (selectedTab === "people") {
      const {participantsHasNext, participantsPartialFetching} = this.props;
      const newCondition = participantsHasNext && !participantsPartialFetching;
      if (newCondition !== endCondition) {
        this.setState({
          endCondition: newCondition
        });
      }
    }


  }

  onAddMemberSelect() {
    this.setState({
      internalStep: constants.ON_ADD_MEMBER
    });
  }

  onAddMember() {
    const {thread, dispatch, onClose} = this.props;
    const {addMembers, removingParticipantIds} = this.state;
    const removingParticipantIdsClone = [...removingParticipantIds];
    dispatch(threadAddParticipant(thread.id, addMembers));
    onClose();
    this.setState({
      addMembers: [],
      removingParticipantIds: removingParticipantIdsClone,
      internalStep: null
    });
  }

  onSettingsSelect() {
    const {setStep, steps} = this.props;
    setStep(steps.ON_SETTINGS);
  }

  onSelect(id, contact) {
    const {addMembers, removingParticipantIds} = this.state;
    let contactsClone = [...addMembers];
    contactsClone.push(id);
    const removingParticipantIdsClone = [...removingParticipantIds];
    const index = removingParticipantIdsClone.indexOf(contact.userId);
    if (index > -1) {
      removingParticipantIdsClone.splice(index, 1);
    }
    this.setState({
      addMembers: contactsClone,
      removingParticipantIds: removingParticipantIdsClone
    });
  }

  onDeselect(id) {
    const {addMembers} = this.state;
    let contactsClone = [...addMembers];
    contactsClone.splice(contactsClone.indexOf(id), 1);
    this.setState({
      addMembers: contactsClone
    });
  }

  onStartChat(participantId, participant) {
    const {user, dispatch} = this.props;
    if (participant.id === user.id) {
      return;
    }
    this.onClose();
    dispatch(threadCreateOnTheFly(participant.coreUserId, participant));
  }

  onClose(dontGoBack) {
    const {onClose, thread, dispatch, setStep, steps} = this.props;
    onClose(dontGoBack);
    if (this.state.query) {
      dispatch(threadParticipantList(thread.id, 0, constants.count));
    }
    setStep(steps.ON_GROUP_INFO);
    this.setState({
      addMembers: [],
      query: null
    });
  }

  onPrevious() {
    const {setStep, steps} = this.props;
    this.setState({
      internalStep: null
    });
    setStep(steps.ON_GROUP_INFO);
  }

  onLeaveSelect() {
    const {dispatch, thread} = this.props;
    dispatch(chatModalPrompt(true, `${strings.areYouSureAboutLeavingGroup(thread.title, thread.type === 8)}؟`, () => {
      dispatch(threadLeave(thread.id));
      dispatch(threadModalThreadInfoShowing());
      dispatch(chatModalPrompt());
    }, null, strings.leave));
  }

  onNotificationSelect() {
    const {thread, dispatch} = this.props;
    dispatch(threadNotification(thread.id, !thread.mute));
  }

  onRemoveParticipant(participant, e) {
    if (e) {
      e.stopPropagation();
    }
    const {thread, dispatch} = this.props;
    const {removingParticipantIds} = this.state;
    dispatch(chatModalPrompt(true, `${strings.areYouSureAboutRemovingMember(getName(participant), thread.type === 8)}؟`, () => {
      dispatch(threadRemoveParticipant(thread.id, [participant.id]));
      dispatch(chatModalPrompt());
      this.setState({
        removingParticipantIds: [...removingParticipantIds, ...[participant.id]]
      });
    }, null));
  }

  onSearchInputChange(query) {
    this.setState({query});
  }

  onSearchChange(query) {
    const {dispatch, thread} = this.props;
    dispatch(threadParticipantList());
    dispatch(threadParticipantList(thread.id, 0, constants.count, query));
  }

  onEndReached() {
    const {onEndReached, selectedTab} = this.state;
    if (selectedTab !== "people") {
      if (onEndReached) {
        onEndReached();
      }
      return;
    }
    const {participantsNextOffset, dispatch, thread} = this.props;
    const {query} = this.state;
    dispatch(threadParticipantList(thread.id, participantsNextOffset, constants.count, query));
  }

  setEndReachCondition(endCondition) {
    this.setState({
      endCondition
    })
  }

  setOnEndReached(onEndReached) {
    this.setState({onEndReached});
  }

  setMessageTypesData({messages, partialLoading, loading}) {
    this.setState({
      mediaListPartialLoading: partialLoading,
      mediaListLoading: loading,
      mediaList: partialLoading || loading ? this.state.mediaList : messages
    })
    //console.log(arguments)
  }

  onTabSelect(tab) {
    if (tab === "people") {
      this.onSearchChange(this.state.query);
    }
    this.setState({
      selectedTab: tab
    });
  }


  render() {
    let {
      participants,
      thread,
      user,
      participantsPartialFetching,
      AvatarModalMediaFragment,
      participantsFetching,
      partialParticipantLoading,
      dispatch
    } = this.props;
    const {removingParticipantIds, addMembers, internalStep, mediaList, selectedTab, endCondition, query, mediaListLoading} = this.state;
    AvatarModalMediaFragment = AvatarModalMediaFragment.bind(this);
    if (internalStep === constants.ON_ADD_MEMBER) {
      return <ModalContactList isShow
                               selectiveMode
                               headingTitle={strings.selectContacts}
                               activeList={addMembers}
                               FooterFragment={ModalContactListFooterFragment.bind(this, addMembers, this.onPrevious, this.onClose)}
                               userType={modalContactListStatics.userType.HAS_POD_USER_NOT_BLOCKED}
                               onClose={this.onClose}
                               onSelect={this.onSelect}
                               onDeselect={this.onDeselect}/>
    }
    const isThreadOwner = checkForPrivilege(thread, THREAD_ADMIN);
    const hasAllowToSeenParticipant = thread.type !== 8 || isThreadOwner;
    const conversationAction = ({contact: participant}) => {
      const participantId = participant.id;
      const isAdmin = participant.admin;
      const adminFragment = (
        <Container className={style.ModalThreadInfoGroupMain__AdminTextContainer}>
          <Text size="sm" color="accent">{strings.admin}</Text>
        </Container>
      );
      if (user.id === participantId) {
        if (isAdmin) {
          return adminFragment;
        }
        return "";
      }
      const isRemovingParticipant = removingParticipantIds.indexOf(participantId) > -1;
      return (
        <Container onMouseDown={e => e.stopPropagation()}>
          {isRemovingParticipant ?
            <Container centerTextAlign>
              <Loading hasSpace><LoadingBlinkDots size="sm"/></Loading>
            </Container>
            :
            <Container>
              {isThreadOwner && (
                <Button onClick={this.onRemoveParticipant.bind(this, participant)} text size="sm">
                  {strings.remove}
                </Button>)
              }
              {isAdmin && adminFragment}
            </Container>
          }

        </Container>

      )
    };

    let extraTabs = ["threadInfo"];
    if (hasAllowToSeenParticipant) {
      extraTabs.push("people");
    }

    return <Fragment>
      <Container>
        <ModalThreadInfoMessageTypes thread={thread}
                                     extraTabs={extraTabs}
                                     selectedTab={selectedTab}
                                     setEndReachCondition={this.setEndReachCondition}
                                     setOnEndReached={this.setOnEndReached}
                                     setMessageTypesData={this.setMessageTypesData}
                                     onTabSelect={this.onTabSelect}/>
        {selectedTab === "people" &&
        <Fragment>
          <ContactSearchFragment onSearchInputChange={this.onSearchInputChange}
                                 onSearchChange={this.onSearchChange} query={query}
                                 inputClassName={style.ModalThreadInfoGroupMain__SearchInput}/>
          <Container>
            {participantsFetching && !partialParticipantLoading ?
              <Container centerTextAlign>
                <Loading><LoadingBlinkDots size="sm"/></Loading>
              </Container>
              :
              (!participants.length && (query && query.trim())) &&
              <Container relative centerTextAlign>
                <Gap y={5}>
                  <Container>
                    <Text>{strings.thereIsNoContactWithThisKeyword(query)}</Text>
                  </Container>
                </Gap>
              </Container>
            }
          </Container>
        </Fragment>
        }
      </Container>


      {selectedTab === "threadInfo" ? <ModalThreadInfoGroupMainHead {...this.props}
                                                                    AvatarModalMediaFragment={AvatarModalMediaFragment}
                                                                    selectedTab={selectedTab}
                                                                    setEndReachCondition={this.setEndReachCondition}
                                                                    setOnEndReached={this.setOnEndReached}
                                                                    setMessageTypesData={this.setMessageTypesData}
                                                                    onTabSelect={this.onTabSelect}
                                                                    hasAllowToSeenParticipant={hasAllowToSeenParticipant}
                                                                    participantsPartialFetching={participantsPartialFetching}
                                                                    $this={this}
                                                                    onLeaveSelect={this.onLeaveSelect}
                                                                    isThreadOwner={isThreadOwner}
                                                                    onAddMemberSelect={this.onAddMemberSelect}
                                                                    onSettingsSelect={this.onSettingsSelect}
                                                                    onNotificationSelect={this.onNotificationSelect}
                                                                    onSearchChange={this.onSearchChange}/> :
        <Container style={{height: selectedTab === "people" ? "auto": "calc(100vh - 300px)"}}>
          {mediaListLoading ?
            <Container center>
              <Loading><LoadingBlinkDots size="sm"/></Loading>
            </Container> :
            mediaList.length || selectedTab === "people" ?
              <ModalThreadInfoTabSelector dispatch={dispatch}
                                          totalCount={selectedTab === "people" ? participants.length : mediaList.length}
                                          endCondition={endCondition}
                                          mediaList={mediaList}
                                          onEndReached={this.onEndReached}
                                          selectedTab={selectedTab}
                                          onStartChat={this.onStartChat}
                                          conversationAction={conversationAction}
                                          participants={participants}/>
                                          :
            <Container relative center>
              <Gap y={5}>
                <Container flex style={{display:"flex", flexDirection: "column", alignItems: "center"}}>
                  <Container>
                    <MdPets size={styleVar.iconSizeLg} color={styleVar.colorGray}/>
                  </Container>
                  <Container>
                    <Text>{strings.noResult}</Text>
                  </Container>
                </Container>
              </Gap>
            </Container>
          }

        </Container>


      }

    </Fragment>

  }
}

export default withRouter(ModalThreadInfoGroupMain);