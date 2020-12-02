import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import ModalContactList, {statics as modalContactListStatics} from "./ModalContactList";

//strings
import strings from "../constants/localization";
import {ROUTE_CREATE_GROUP, ROUTE_THREAD, ROUTE_ADD_CONTACT} from "../constants/routes";

//actions
import {contactModalCreateGroupShowing} from "../actions/contactActions";
import {threadCreateGroupOrChannelWithUsers, threadCreateWithUser} from "../actions/threadActions";

//UI components
import Modal, {ModalBody, ModalHeader, ModalFooter} from "../../../pod-chat-ui-kit/src/modal";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import {Heading, Text} from "../../../pod-chat-ui-kit/src/typography";
import {InputText} from "../../../pod-chat-ui-kit/src/input";
import Container from "../../../pod-chat-ui-kit/src/container";

//styling
import {MdArrowForward} from "react-icons/md";
import Message from "../../../pod-chat-ui-kit/src/message";

const constants = {
  GROUP_NAME: "GROUP_NAME",
  SELECT_CONTACT: "SELECT_CONTACT"
};

function ModalContactListFooterFragment(threadContacts, onNext, onClose) {
  return (<Container>
    {
      threadContacts.length > 1 &&
      <Button text onClick={onNext}>
        <MdArrowForward/>
      </Button>
    }
    <Button text onClick={onClose}>{strings.cancel}</Button>
  </Container>)
}

@connect(store => {
  return {
    contactModalCreateGroup: store.contactModalCreateGroupShowing,
    chatRouterLess: store.chatRouterLess
  };
}, null, null, {forwardRef: true})
class ModalCreateGroup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      threadContacts: [],
      groupName: "",
      step: constants.SELECT_CONTACT
    };
    this.onCreate = this.onCreate.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onDeselect = this.onDeselect.bind(this);
    this.onNext = this.onNext.bind(this);
  }

  componentDidMount() {
    const {contactModalCreateGroup, dispatch, match} = this.props;
    if (!contactModalCreateGroup.isShowing) {
      if (match.path === ROUTE_CREATE_GROUP) {
        dispatch(contactModalCreateGroupShowing(true));
      }
    }
  }

  onNext() {
    this.setState({
      step: constants.GROUP_NAME
    });
  }

  onCreate(groupName, isChannel, e) {
    if (e) {
      e.preventDefault();
    }
    if (!groupName || !groupName.trim()) {
      this.setState({
        nameNotEntered: true
      });
      return;
    }
    const {dispatch, chatRouterLess, history} = this.props;
    dispatch(threadCreateGroupOrChannelWithUsers(this.state.threadContacts, groupName, isChannel));
    if (!chatRouterLess) {
      history.push(ROUTE_THREAD);
    }
    this.onClose(false, true);
    this.setState({
      nameNotEntered: false
    });
  }

  onClose(e, noHistory) {
    const {dispatch, chatRouterLess, history} = this.props;
    dispatch(contactModalCreateGroupShowing(false));
    this.setState({
      step: constants.SELECT_CONTACT,
      threadContacts: []
    });
    if (!chatRouterLess) {
      if (!noHistory) {
        history.push("/");
      }
    }
  }

  onSelect(id) {
    const {threadContacts} = this.state;
    let contactsClone = [...threadContacts];
    contactsClone.push(id);
    this.setState({
      threadContacts: contactsClone
    });
  }

  onDeselect(id) {
    const {threadContacts} = this.state;
    let contactsClone = [...threadContacts];
    contactsClone.splice(contactsClone.indexOf(id), 1);
    this.setState({
      threadContacts: contactsClone
    });
  }

  groupNameChange(event) {
    this.setState({
      groupName: event.target.value,
      nameNotEntered: false
    })
  }

  render() {
    const {contactModalCreateGroup, smallVersion} = this.props;
    const {threadContacts, step, groupName, nameNotEntered} = this.state;
    const {isShowing, isChannel} = contactModalCreateGroup;
    if (step === constants.SELECT_CONTACT && isShowing) {
      return <ModalContactList isShow
                               headingTitle={strings.selectContacts}
                               selectiveMode
                               activeList={threadContacts}
                               FooterFragment={ModalContactListFooterFragment.bind(this, threadContacts, this.onNext, this.onClose)}
                               userType={modalContactListStatics.userType.HAS_POD_USER_NOT_BLOCKED}
                               onClose={this.onClose}
                               onSelect={this.onSelect}
                               onDeselect={this.onDeselect}/>
    }
    return (
      <Modal isOpen={isShowing} onClose={this.onClose.bind(this)} inContainer={smallVersion} fullScreen={smallVersion}
             userSelect="none">

        <ModalHeader>
          <Heading h3>{strings.createGroup(isChannel)}</Heading>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={this.onCreate.bind(this, groupName, isChannel)}>
            <InputText onChange={this.groupNameChange.bind(this)}
                       max={40}
                       value={groupName}
                       placeholder={strings.groupName(isChannel)}/>
            <input type="submit" style={{display: "none"}}/>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button text
                  onClick={this.onCreate.bind(this, groupName, isChannel)}>{strings.createGroup(isChannel)}</Button>
          <Button text onClick={this.onClose.bind(this)}>{strings.cancel}</Button>
          <Container inline>
            <Message warn>
              {nameNotEntered && strings.groupNameNotEntered(isChannel)}
            </Message>
          </Container>
        </ModalFooter>

      </Modal>
    )
  }
}

export default withRouter(ModalCreateGroup);
