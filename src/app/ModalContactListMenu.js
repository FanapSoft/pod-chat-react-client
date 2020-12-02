import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import ModalContactList, {statics as modalContactListStatics} from "./ModalContactList"

//strings
import strings from "../constants/localization";
import {ROUTE_ADD_CONTACT, ROUTE_THREAD} from "../constants/routes";

//actions
import {
  contactListShowing,
  contactAdding,
  contactChatting,
  contactRemove
} from "../actions/contactActions";
import {threadCreateOnTheFly, threadCreateWithUser} from "../actions/threadActions";
import {chatModalPrompt} from "../actions/chatActions";


//UI components
import Container from "../../../pod-chat-ui-kit/src/container";
import {Button} from "../../../pod-chat-ui-kit/src/button";

//styling

function ModalContactListMenuFooterFragment(onAdd, onClose) {
  return (
    <Container>
      <Button text onClick={onAdd}>{strings.add}</Button>
      <Button text onClick={onClose}>{strings.close}</Button>
    </Container>
  )
}

function LeftActionFragment(onRemoveContact, {contact}) {
  return !contact.linkedUser &&
    <Container onMouseDown={e => e.stopPropagation()}>
      <Button onClick={onRemoveContact.bind(null, contact)} text size="sm">
        {strings.remove}
      </Button>
    </Container>
}

@connect(store => {
  return {
    isShow: store.contactListShowing,
    chatRouterLess: store.chatRouterLess
  };
}, null, null, {forwardRef: true})
class ModalContactListMenu extends Component {

  constructor(props) {
    super(props);
    this.removeContact = this.removeContact.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onStartChat = this.onStartChat.bind(this);
    this.onAdd = this.onAdd.bind(this);
  }

  componentDidUpdate({isShow: oldIsShow, chatInstance: oldChatInstance}) {

  }

  onAdd() {
    const {chatRouterLess, history, dispatch} = this.props;
    dispatch(contactAdding(true));
    if (!chatRouterLess) {
      history.push(ROUTE_ADD_CONTACT);
    }
  }

  onClose(e, noHistory) {
    const {history, chatRouterLess, dispatch} = this.props;
    dispatch(contactListShowing());
    if (!chatRouterLess) {
      if (!noHistory) {
        history.push("/");
      }
    }
  }

  onStartChat(contactId, contact) {
    const {history, chatRouterLess, dispatch} = this.props;
    if (!contact || !contact.linkedUser) {
      return;
    }
    const user = {
      id: contact.id,
      contactId: contact.id,
      isMyContact: true,
      coreUserId: contact.linkedUser.coreUserId,
      username: contact.linkedUser.username,
      image: contact.linkedUser.image,
      name: `${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ''}`
    };
    dispatch(threadCreateOnTheFly(contact.linkedUser.coreUserId, user));
    this.onClose(true);
    if (!chatRouterLess) {
      history.push(ROUTE_THREAD);
    }
  }

  removeContact(contact, e) {
    if (e) {
      e.stopPropagation();
    }
    const {dispatch} = this.props;
    const text = strings.areYouSureAboutDeletingContact();
    dispatch(chatModalPrompt(true, `${text}؟`, () => {
      dispatch(contactRemove(contact.id));
      dispatch(chatModalPrompt());
    }, () => dispatch(contactListShowing(true))));
  }

  render() {
    const {isShow} = this.props;

    return (
      <ModalContactList isShow={isShow}
                        onClose={this.onClose}
                        userType={modalContactListStatics.userType.ALL}
                        onSelect={this.onStartChat}
                        LeftActionFragment={LeftActionFragment.bind(this, this.removeContact)}
                        FooterFragment={ModalContactListMenuFooterFragment.bind(this, this.onAdd, this.onClose)}/>
    )
  }
}

export default withRouter(ModalContactListMenu);