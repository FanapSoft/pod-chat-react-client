import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {avatarNameGenerator, avatarUrlGenerator} from "../utils/helpers";

//strings
import strings from "../constants/localization";

//actions
import {
  threadAdminAdd,
  threadAdminList, threadAdminRemove, threadParticipantList
} from "../actions/threadActions";
import {chatUploadImage} from "../actions/chatActions";

//UI components
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import Container from "../../../pod-chat-ui-kit/src/container";
import {InputText} from "../../../pod-chat-ui-kit/src/input";
import {PartialLoadingFragment} from "./ModalContactList";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {ContactList, getName, getImage} from "./_component/contactList";
import {ContactSearchFragment} from "./ModalContactList";
import {messageGetSeenList} from "../actions/messageActions";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import AvatarText from "../../../pod-chat-ui-kit/src/avatar/AvatarText";

//styling
import {MdArrowBack, MdBlock, MdCameraAlt, MdVerifiedUser} from "react-icons/md";
import styleVar from "../../styles/variables.scss";
import style from "../../styles/app/ModalThreadInfoGroupSettingsAdminAdd.scss";
import {LastMessageFragment} from "./AsideThreads";
import date from "../utils/date";


const constants = {
  count: 50,
  ON_PARTICIPANT_LIST: "ON_PARTICIPANT_LIST",
  ADD_ADMIN_PRIVILEGE: "ADD_ADMIN_PRIVILEGE"
};

@connect(store => {
  return {
    threadAdminList: store.threadAdminList,
    participants: store.threadParticipantList.participants,
    participantsHasNext: store.threadParticipantList.hasNext,
    participantsNextOffset: store.threadParticipantList.nextOffset,
    participantsFetching: store.threadParticipantList.fetching,
    participantsPartialFetching: store.threadParticipantListPartial.fetching,
  };
}, null, null, {forwardRef: true})
export default class ModalThreadInfoGroupSettingsAdminAdd extends Component {

  constructor(props) {
    super(props);
    this.onAddAdmin = this.onAddAdmin.bind(this);
    this.onAddAdminSelect = this.onAddAdminSelect.bind(this);
    this.onPrevious = this.onPrevious.bind(this);
    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onClose = this.onClose.bind(this);
    this.state = {
      internalStep: constants.ON_PARTICIPANT_LIST
    }
  }

  componentDidMount() {
    const {setHeaderFooterComponent} = this.props;
    const FooterComponent = () => {
      return (
        <Fragment>
          <Button text onClick={this.onClose}>{strings.close}</Button>
          <Button text onClick={this.onPrevious}>
            <MdArrowBack/>
          </Button>
        </Fragment>
      )
    };
    const HeaderComponent = () => {
      return strings.addAdmin;
    };
    setHeaderFooterComponent(HeaderComponent, FooterComponent);
  }

  componentDidUpdate(prevProps, prevState) {
    const {setFooterComponent, participantsHasNext, participantsPartialFetching, setScrollBottomThresholdCondition, onClose} = this.props;
    const {participantsHasNext: oldParticipantsHasNext, participantsPartialFetching: oldParticipantsPartialFetching} = prevProps;
    const {internalStep: oldInternalStep} = prevState;
    if (oldParticipantsHasNext !== participantsHasNext && oldParticipantsPartialFetching !== participantsPartialFetching) {
      setScrollBottomThresholdCondition(participantsHasNext && !participantsPartialFetching);
    }
    const {internalStep} = this.state;
    if (oldInternalStep !== internalStep) {
      if (this.state.internalStep === constants.ADD_ADMIN_PRIVILEGE) {
        const FooterComponent = () => {
          return (
            <Fragment>
              <Button text onClick={this.onAddAdminSelect}>
                {strings.doAdd}
              </Button>
              <Button text onClick={this.onClose}>{strings.close}</Button>
              <Button text onClick={this.onPrevious}>
                <MdArrowBack/>
              </Button>
            </Fragment>
          )
        };
        setFooterComponent(FooterComponent);
      }
    }
  }

  onAddAdmin(participantId, participant) {
    this.setState({
      internalStep: constants.ADD_ADMIN_PRIVILEGE,
      selectedParticipant: participant
    });
  }

  onAddAdminSelect() {
    const {selectedParticipant} = this.state;
    const {thread, setStep, steps, dispatch} = this.props;
    dispatch(threadAdminAdd(selectedParticipant, thread.id));
    setStep(steps.ON_ADMIN_LIST);
    this.setState({
      internalStep: constants.ADD_ADMIN_PRIVILEGE,
      selectedParticipant: null
    });
  }

  onPrevious() {
    const {setStep, steps} = this.props;
    setStep(steps.ON_ADMIN_LIST);
  }

  onSearchInputChange(query) {
    this.setState({query});
  }

  onSearchChange(query) {
    const {dispatch, thread} = this.props;
    dispatch(threadParticipantList(thread.id, 0, constants.count, query));
  }

  onScrollBottomThreshold() {
    const {participantsNextOffset, dispatch, thread} = this.props;
    const {query} = this.state;
    dispatch(threadParticipantList(thread.id, participantsNextOffset, constants.count, query));
  }

  onClose() {
    const {dispatch, thread, onClose} = this.props;
    dispatch(threadParticipantList(thread.id, 0, constants.count));
    onClose();
  }

  render() {
    const {participants, participantsPartialFetching, GapFragment} = this.props;
    const {internalStep, selectedParticipant, query} = this.state;

    if (internalStep === constants.ON_PARTICIPANT_LIST) {
      return <Container relative>
        <ContactSearchFragment onSearchInputChange={this.onSearchInputChange}
                               onSearchChange={this.onSearchChange} query={query}
                               inputClassName={style.ModalThreadInfoGroupSettingsAdminAdd__SearchInput}/>
        <ContactList invert
                     selection
                     onSelect={this.onAddAdmin}
                     contacts={participants}/>
        {participantsPartialFetching && <PartialLoadingFragment/>}
      </Container>
    }
    return (
      <Container relative>
        <Avatar>
          <AvatarImage src={avatarUrlGenerator(getImage(selectedParticipant), avatarUrlGenerator.SIZES.SMALL)}
                       text={avatarNameGenerator(getName(selectedParticipant)).letter}
                       size="lg"
                       textBg={avatarNameGenerator(getName(selectedParticipant)).color}/>
          <AvatarName maxWidth="150px">
            {getName(selectedParticipant)}
            <AvatarText>
              <Text size="sm" color="gray" dark>{strings.lastSeen(date.prettifySince(selectedParticipant ? selectedParticipant.notSeenDuration : ""))}</Text>
            </AvatarText>
          </AvatarName>
        </Avatar>
        <GapFragment/>

        <Container centerTextAlign>
          <Text size="md" bold color="accent">{strings.areYouSureAboutAddThisPersonToAdminList}؟</Text>
        </Container>
      </Container>
    )
  }
}
