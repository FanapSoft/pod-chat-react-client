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
import {
  threadLeave,
  threadModalThreadInfoShowing,
  threadNotification,
  threadParticipantList
} from "../actions/threadActions";
import {chatModalPrompt} from "../actions/chatActions";

//UI components
import Modal, {ModalBody, ModalHeader, ModalFooter} from "../../../pod-chat-ui-kit/src/modal";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Heading, Text} from "../../../pod-chat-ui-kit/src/typography";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import Container from "../../../pod-chat-ui-kit/src/container";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import date from "../utils/date";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
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
import style from "../../styles/app/ModalThreadInfoPers.scss"
import styleVar from "../../styles/variables.scss";
import ModalThreadInfoMessageTypes from "./ModalThreadInfoMessageTypes";
import ModalThreadInfoPersonHead from "./ModalThreadInfoPersonHead";
import {Virtuoso, VirtuosoGrid} from "./_component/Virtuoso";
import ModalThreadInfoMessageTypesImage from "./ModalThreadInfoMessageTypesImage";
import ModalThreadInfoMessageTypesMedia from "./ModalThreadInfoMessageTypesMedia";
import {types} from "../constants/messageTypes";


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


function tabIsFile(selectedTab) {
  if (types[selectedTab]) {
    return selectedTab !== "picture";
  }
  return false
}

@connect(store => {
  return {
    contactBlocking: store.contactBlock.fetching,
    notificationPending: store.threadNotification.fetching,
    chatInstance: store.chatInstance.chatSDK,
    chatRouterLess: store.chatRouterLess,
    contacts: store.contactGetList.contacts
  };
}, null, null, {forwardRef: true})
export default class ModalThreadInfo extends Component {

  constructor(props) {
    super(props);
    this.onRemoveThread = this.onRemoveThread.bind(this);
    this.setEndReachCondition = this.setEndReachCondition.bind(this);
    this.setOnEndReached = this.setOnEndReached.bind(this);
    this.onTabSelect = this.onTabSelect.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.setMessageTypesData = this.setMessageTypesData.bind(this);
    this.state = {
      endCondition: false,
      onEndReached: null,
      selectedTab: "threadInfo",
      mediaList: [],
      contact: {}
    };
  }

  onTabSelect(tab) {
    this.setState({
      selectedTab: tab
    });
  }

  componentDidMount() {
    const {participants, user, dispatch, contacts, thread} = this.props;
    if (!thread.onTheFly && (!participants || !participants.length)) {
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
    const {participants, user, dispatch, contacts, thread} = this.props;
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

  onEndReached() {
    const {onEndReached} = this.state;
    onEndReached();
  }

  setEndReachCondition(endCondition) {
    this.setState({
      endCondition
    })
  }

  setOnEndReached(onEndReached) {
    this.setState({onEndReached});
  }

  setMessageTypesData({messages, partialLoading}) {
    this.setState({
      mediaListPartialLoading: partialLoading,
      mediaList: partialLoading ? this.state.mediaList : messages
    })
    //console.log(arguments)
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
    const {participants, thread, user, onClose, isShow, smallVersion, contactBlocking, notificationPending, GapFragment, AvatarModalMediaFragment, dispatch} = this.props;
    const {scrollBottomThresholdCondition, scrollBottomThreshold, mediaList, selectedTab, endCondition} = this.state;
    const isOnTheFly = thread.onTheFly;
    let participant = isOnTheFly ? thread.participant : getParticipant(participants, user);
    const participantImage = avatarUrlGenerator(isOnTheFly ? thread.image : participant.image, avatarUrlGenerator.SIZES.MEDIUM);
    const contact = this.state.contact || {};

    const TabComponentSelector = {
      "picture": {
        Scroller: VirtuosoGrid,
        props: {
          listClassName: style.ModalThreadInfoPerson__ImageList,
          itemClassName: style.ModalThreadInfoPerson__ImageListItem
        },
        ListItem: ({idx}) => {
          return <ModalThreadInfoMessageTypesImage message={mediaList[idx]} dispatch={dispatch}/>
        }
      },
      "file": {
        Scroller: Virtuoso,
        ListItem: ({idx}) => <ModalThreadInfoMessageTypesMedia message={mediaList[idx]}
                                                               dispatch={dispatch}
                                                               type={selectedTab}
        />
      },
    };

    const {Scroller, ListItem, Height, props} = TabComponentSelector[tabIsFile(selectedTab) ? "file" : selectedTab] || {};
    return (
      <Modal isOpen={isShow} onClose={onClose} inContainer={smallVersion} fullScreen={smallVersion} userSelect="none">

        <ModalHeader>
          <Heading h3>{strings.contactInfo}</Heading>
        </ModalHeader>

        <ModalBody threshold={5}
                   onScrollBottomThresholdCondition={scrollBottomThresholdCondition}
                   onScrollBottomThreshold={scrollBottomThreshold}>
          {
            isOnTheFly ? < ModalThreadInfoPersonHead thread={thread}
                                                     isOnTheFly={isOnTheFly}
                                                     notificationPending={notificationPending}
                                                     GapFragment={GapFragment}
                                                     AvatarModalMediaFragment={AvatarModalMediaFragment}
                                                     participantImage={participantImage}
                                                     contact={contact}
                                                     participant={participant}
                                                     contactBlocking={contactBlocking}
                                                     onEdit={this.onEdit}
                                                     $this={this}
                                                     onRemove={this.onRemove}
                                                     onAddContact={this.onAddContact}
                                                     onRemoveThread={this.onRemoveThread}
                                                     onBlockSelect={this.onBlockSelect}
                                                     onNotificationSelect={this.onNotificationSelect}/> :
              <Fragment>
                <ModalThreadInfoMessageTypes thread={thread}
                                             extraTabs={["threadInfo"]}
                                             selectedTab={selectedTab}
                                             setEndReachCondition={this.setEndReachCondition}
                                             setOnEndReached={this.setOnEndReached}
                                             setMessageTypesData={this.setMessageTypesData}
                                             onTabSelect={this.onTabSelect}/>

                {selectedTab === "threadInfo" ?
                  < ModalThreadInfoPersonHead thread={thread}
                                              isOnTheFly={isOnTheFly}
                                              notificationPending={notificationPending}
                                              GapFragment={GapFragment}
                                              AvatarModalMediaFragment={AvatarModalMediaFragment}
                                              participantImage={participantImage}
                                              contact={contact}
                                              participant={participant}
                                              contactBlocking={contactBlocking}
                                              onEdit={this.onEdit}
                                              $this={this}
                                              onRemove={this.onRemove}
                                              onAddContact={this.onAddContact}
                                              onRemoveThread={this.onRemoveThread}
                                              onBlockSelect={this.onBlockSelect}
                                              onNotificationSelect={this.onNotificationSelect}/>
                  : <Scroller {...props}
                              style={{height: Height || `calc(100vh - 245px)`, overflowX: "hidden"}}
                              totalCount={selectedTab === "people" ? participants.length : mediaList.length}
                              endReached={e => endCondition && this.onEndReached()}
                              itemContent={idx => <ListItem idx={idx}/>}/>

                }
              </Fragment>
          }


        </ModalBody>

        <ModalFooter>
          < Button text onClick={onClose}>{strings.close}</Button>
        </ModalFooter>

      </Modal>
    );
  }
}
