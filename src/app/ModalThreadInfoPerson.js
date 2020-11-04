import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {avatarNameGenerator, avatarUrlGenerator} from "../utils/helpers";


//strings
import strings from "../constants/localization";
import {ROUTE_ADD_CONTACT} from "../constants/routes";

//actions
import {
  contactBlock,
  contactAdding,
  contactRemove,
  contactListShowing, contactSearch, contactAdd
} from "../actions/contactActions";
import {threadLeave, threadModalThreadInfoShowing, threadNotification} from "../actions/threadActions";
import {chatModalPrompt} from "../actions/chatActions";

//UI components
import Modal, {ModalBody, ModalHeader, ModalFooter} from "../../../uikit/src/modal";
import {Button} from "../../../uikit/src/button";
import Gap from "../../../uikit/src/gap";
import {Heading, Text} from "../../../uikit/src/typography";
import Avatar, {AvatarImage, AvatarName} from "../../../uikit/src/avatar";
import Container from "../../../uikit/src/container";
import List, {ListItem} from "../../../uikit/src/list";
import date from "../utils/date";
import Loading, {LoadingBlinkDots} from "../../../uikit/src/loading";
import {
  MdPersonAdd,
  MdPerson,
  MdPhone,
  MdBlock,
  MdNotifications,
  MdEdit,
  MdDelete,
  MdDeleteForever
} from "react-icons/md";

//styling
import styleVar from "../../styles/variables.scss";
import {isChannel, isGroup} from "./Main";
import ModalThreadInfoMessageTypes from "./ModalThreadInfoMessageTypes";


export function getParticipant(participants, user) {
  let participant;
  if (participants) {
    participant = participants.filter(e => e.id !== user.id)[0];
  }
  if (!participant) {
    participant = {};
  }
  return participant;
}

@connect(store => {
  return {
    contactBlocking: store.contactBlock.fetching,
    notificationPending: store.threadNotification.fetching,
    chatInstance: store.chatInstance.chatSDK,
    chatRouterLess: store.chatRouterLess,
    contacts: store.contactGetList.contacts
  };
}, null, null, {withRef: true})
export default class ModalThreadInfo extends Component {

  constructor(props) {
    super(props);
    this.onRemoveThread = this.onRemoveThread.bind(this);
    this.setScrollBottomThresholdCondition = this.setScrollBottomThresholdCondition.bind(this);
    this.setOnScrollBottomThreshold = this.setOnScrollBottomThreshold.bind(this);
    this.state = {
      scrollBottomThresholdCondition: false,
      scrollBottomThreshold: null,
      contact: {}
    };
  }

  componentDidMount() {
    const {participants, user, dispatch, contacts, thread} = this.props;
    if (!participants || !participants.length) {
      return;
    }
    const participant = thread.onTheFly ? thread.participant : getParticipant(participants, user);
    if (!participant.id) {
      return;
    }
    if (!thread.onTheFly && !participant.contactId) {
      return;
    }
    if (contacts && contacts.length) {
      let contact = contacts.findIndex(contact => contact.id === participant.contactId);
      if (contact > -1) {
        return this.setState({contact: contacts[contact]});
      }
    }
    dispatch(contactSearch({id: participant.contactId})).then(contact => {
      this.setState({contact})
    });
  }

  componentDidUpdate({participants: oldParticipants}) {
    const {participants, user, dispatch, contacts} = this.props;
    if (!participants || !participants.length) {
      return;
    }
    const participant = getParticipant(participants, user);
    const oldParticipant = getParticipant(oldParticipants, user);
    if (!participant.id && !oldParticipant.id) {
      return;
    } else if (participant.id === oldParticipant.id) {
      return;
    }
    if (!participant.contactId) {
      return;
    }
    if (contacts && contacts.length) {
      let contact = contacts.findIndex(contact => contact.id === participant.contactId);
      if (contact > -1) {
        return this.setState({contact: contacts[contact]});
      }
    }
    dispatch(contactSearch({id: participant.contactId})).then(contact => {
      this.setState({contact})
    });
  }

  getContact() {
    const {participants, user, dispatch, contacts} = this.props;
    if (!participants || !participants.length) {
      return;
    }
    const participant = getParticipant(participants, user);
    if (contacts && contacts.length) {
      let contact = contacts.findIndex(contact => contact.id === participant.contactId);
      if (contact > -1) {
        return this.setState({contact: contacts[contact]});
      }
    }
    dispatch(contactSearch({id: participant.contactId})).then(contact => {
      this.setState({contact})
    });
  }

  onBlockSelect(threadId, blocked) {
    const {dispatch, thread} = this.props;
    dispatch(contactBlock(threadId, !blocked, thread));
  }

  onNotificationSelect() {
    const {thread, dispatch} = this.props;
    dispatch(threadNotification(thread.id, !thread.mute));
  }

  onEdit(participant = {}, contact, extraPayload = {}) {
    const {dispatch, history, chatRouterLess, onClose} = this.props;
    dispatch(contactAdding(true, {
      firstName: contact.firstName,
      lastName: contact.lastName,
      addBy: contact.cellphoneNumber || (participant && participant.username) || contact.linkedUser.username,
      ...extraPayload
    }));
    if (!chatRouterLess) {
      history.push(ROUTE_ADD_CONTACT);
    }
    onClose(true);
  }

  onRemove(participant) {
    const {dispatch} = this.props;
    const text = strings.areYouSureAboutDeletingContact(participant.contactName);
    dispatch(chatModalPrompt(true, `${text}؟`, () => {
      dispatch(contactRemove(participant.contactId, participant.threadId));
      dispatch(chatModalPrompt());
    }, () => dispatch(contactListShowing(true))));
  }

  onRemoveThread() {
    const {thread, dispatch} = this.props;
    dispatch(chatModalPrompt(true, `${strings.areYouSureRemovingThread}؟`, () => {
      dispatch(threadLeave(thread.id));
      dispatch(threadModalThreadInfoShowing());
      dispatch(chatModalPrompt());
    }, null, strings.remove));
  }

  setScrollBottomThresholdCondition(scrollBottomThresholdCondition) {
    this.setState({scrollBottomThresholdCondition});
  }

  setOnScrollBottomThreshold(scrollBottomThreshold) {
    this.setState({scrollBottomThreshold});
  }

  onAddContact(participant) {
    this.onEdit(null, {
      firstName: participant.firstName,
      lastName: participant.lastName,
      linkedUser: {
        username: participant.username
      }
    }, {isAdd: true});
  }

  render() {
    const {participants, thread, user, onClose, isShow, smallVersion, contactBlocking, notificationPending, GapFragment, AvatarModalMediaFragment} = this.props;
    const {scrollBottomThresholdCondition, scrollBottomThreshold} = this.state;
    const isOnTheFly = thread.onTheFly;
    let participant = isOnTheFly ? thread.participant : getParticipant(participants, user);
    const participantImage = avatarUrlGenerator(isOnTheFly ? thread.image : participant.image, avatarUrlGenerator.SIZES.MEDIUM);
    const isMyContact = participant.isMyContact || participant.contactId;
    const contact = this.state.contact || {};
    return (
      <Modal isOpen={isShow} onClose={onClose} inContainer={smallVersion} fullScreen={smallVersion} userSelect="none">

        <ModalHeader>
          <Heading h3>{strings.contactInfo}</Heading>
        </ModalHeader>

        <ModalBody threshold={5}
                   onScrollBottomThresholdCondition={scrollBottomThresholdCondition}
                   onScrollBottomThreshold={scrollBottomThreshold}>
          <Container>
            <Container relative>

              <Container>
                <Avatar>
                  <AvatarImage src={avatarUrlGenerator(participantImage, avatarUrlGenerator.SIZES.LARGE)} size="xlg"
                               text={avatarNameGenerator(thread.title).letter}
                               textBg={avatarNameGenerator(thread.title).color}>
                    <AvatarModalMediaFragment participant={participant}/>
                  </AvatarImage>
                  <AvatarName>
                    <Heading h1>{thread.title}</Heading>
                    <Text>{strings.lastSeen(date.prettifySince(participant ? participant.notSeenDuration : ""))}</Text>
                  </AvatarName>
                </Avatar>
              </Container>

              <Container bottomLeft>
                <MdPerson size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
              </Container>

            </Container>
            <Fragment>
              <GapFragment/>
              <List>
                {isMyContact ?

                  <Fragment>

                    {contact.cellphoneNumber &&
                    <ListItem invert>

                      <Container>
                        <MdPhone size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                        <Gap x={20}>
                          <Text inline>{contact.cellphoneNumber}</Text>
                        </Gap>
                      </Container>

                    </ListItem>
                    }
                    {(participant.username || (contact.linkedUser && contact.linkedUser.username)) &&
                    <ListItem invert>

                      <Container>
                        <MdPerson size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                        <Gap x={20}>
                          <Text inline>{participant.username || contact.linkedUser.username}</Text>
                        </Gap>
                      </Container>

                    </ListItem>
                    }

                    {
                    <ListItem selection invert onSelect={this.onEdit.bind(this, participant, contact)}>
                      <Container relative>
                        <MdEdit size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                        <Gap x={20}>
                          <Text>{strings.edit}</Text>
                        </Gap>
                      </Container>
                    </ListItem>
                    }

                    {
                    <ListItem selection invert onSelect={this.onRemove.bind(this, participant)}>
                      <Container relative>
                        <MdDelete size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                        <Gap x={20}>
                          <Text>{strings.remove}</Text>
                        </Gap>
                      </Container>
                    </ListItem>
                    }

                  </Fragment>
                  :
                  <ListItem selection invert onSelect={this.onAddContact.bind(this, participant)}>
                    <Container relative>
                      <MdPersonAdd size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                      <Gap x={20}>
                        <Text>{strings.addToContact}</Text>
                      </Gap>
                    </Container>
                  </ListItem>
                }
              </List>
              {!isOnTheFly &&
              <Fragment>
                <Container>
                  {
                    isMyContact &&
                    <GapFragment/>
                  }
                  <List>

                    {
                      <ListItem selection invert onSelect={this.onRemoveThread.bind(this, participant)}>
                        <Container relative>
                          <MdDeleteForever size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                          <Gap x={20}>
                            <Text>{strings.removeThread}</Text>
                          </Gap>
                        </Container>
                      </ListItem>
                    }

                    <ListItem selection invert onSelect={this.onBlockSelect.bind(this, thread.id, participant.blocked)}>
                      <Container relative>
                        <MdBlock size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                        <Gap x={20}>
                          <Text>{strings.block}</Text>
                        </Gap>
                        <Container centerLeft>
                          {contactBlocking ?
                            <Container centerTextAlign>
                              <Loading hasSpace><LoadingBlinkDots size="sm"/></Loading>
                            </Container>
                            :
                            <Gap x={5}>
                              <Text size="sm"
                                    color={participant.blocked ? "red" : "green"}>{participant.blocked ? strings.blocked : ""}</Text>
                            </Gap>
                          }
                        </Container>
                      </Container>
                    </ListItem>

                    <ListItem selection invert onSelect={this.onNotificationSelect.bind(this, thread)}>

                      <Container relative>
                        <MdNotifications size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                        <Gap x={20}>
                          <Text>{strings.notification}</Text>
                        </Gap>
                        <Container centerLeft>
                          {notificationPending ?
                            <Container centerTextAlign>
                              <Loading hasSpace><LoadingBlinkDots size="sm"/></Loading>
                            </Container>
                            :
                            <Gap x={5}>
                              <Text size="sm"
                                    color={thread.mute ? "red" : "green"}>{thread.mute ? strings.inActive : strings.active}</Text>
                            </Gap>
                          }

                        </Container>
                      </Container>
                    </ListItem>
                  </List>

                </Container>
                <GapFragment/>
                <ModalThreadInfoMessageTypes thread={thread}
                                             setScrollBottomThresholdCondition={this.setScrollBottomThresholdCondition}
                                             setOnScrollBottomThreshold={this.setOnScrollBottomThreshold}/>
              </Fragment>
              }
            </Fragment>

          </Container>

        </ModalBody>

        <ModalFooter>
          <Button text onClick={onClose}>{strings.close}</Button>
        </ModalFooter>

      </Modal>
    );
  }
}
