import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {statics as modalContactListStatics} from "./ModalContactList";

//strings
import strings from "../constants/localization";
import {ROUTE_ADD_CONTACT, ROUTE_CONTACTS, ROUTE_THREAD} from "../constants/routes";

//actions
import {
  contactAdd,
  contactAdding,
  contactChatting, contactGetList,
  contactListShowing, contactUpdate
} from "../actions/contactActions";

//UI components
import Modal, {ModalBody, ModalHeader, ModalFooter} from "../../../pod-chat-ui-kit/src/modal";
import {InputText} from "../../../pod-chat-ui-kit/src/input";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import {Heading} from "../../../pod-chat-ui-kit/src/typography";
import Message from "../../../pod-chat-ui-kit/src/message";
import Container from "../../../pod-chat-ui-kit/src/container";
import {chatRouterLess} from "../actions/chatActions";


//styling

@connect(store => {
  return {
    isShowing: store.contactAdding.isShowing,
    contactEdit: store.contactAdding.contactEdit,
    contactAdd: store.contactAdd.contact,
    contactAddPending: store.contactAdd.fetching,
    contactAddError: store.contactAdd.error,
    chatRouterLess: store.chatRouterLess,
    user: store.user.user
  };
}, null, null, {forwardRef: true})
class ModalAddContact extends Component {

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      sameUserMobilePhone: false,
      notEnteredFirstOrFamilyName: false,
      notEnteredMobilePhone: false,
      addBy: "",
      firstName: "",
      lastName: ""
    }
  }

  componentDidMount() {
    const {isShowing, match, dispatch, contactEdit} = this.props;
    if (!isShowing) {
      if (match.path === ROUTE_ADD_CONTACT) {
        dispatch(contactAdding(true));
      }
    }
    if (contactEdit) {
      this.setState({
        addBy: contactEdit.addBy,
        firstName: contactEdit.firstName,
        lastName: contactEdit.lastName
      });
    }
  }

  componentDidUpdate(oldProps) {
    const {chatRouterLess, contactAdd, contactEdit, isShowing, dispatch, history} = this.props;
    if (contactEdit) {
      if (contactEdit !== oldProps.contactEdit) {
        this.setState({
          addBy: contactEdit.addBy,
          firstName: contactEdit.firstName,
          lastName: contactEdit.lastName
        });
        return;
      }
    }
    if (contactAdd) {
      if (oldProps.contactAdd !== contactAdd) {
        if (isShowing) {
          if (!contactEdit) {
            if (contactAdd.linkedUser) {
              this.onClose();
              dispatch(contactListShowing(false));
              dispatch(contactChatting(contactAdd));
              if (!chatRouterLess) {
                history.push(ROUTE_THREAD);
              }
            }
          }
        }
      }
    }
  }

  onSubmit(e) {
    if(e) {
      e.preventDefault();
    }
    const {addBy, firstName, lastName} = this.state;
    if (!addBy) {
      return this.setState({
        notEnteredMobilePhone: true
      });
    }
    if (!firstName || !firstName.trim()) {
      if (!lastName || !lastName.trim()) {
        return this.setState({
          notEnteredFirstOrFamilyName: true
        });
      }
    }
    const {contactEdit, dispatch, user} = this.props;
    if (addBy === user.cellphoneNumber) {
      return this.setState({
        sameUserMobilePhone: true
      });
    }
    dispatch(contactAdd(addBy, firstName, lastName, contactEdit));
    this.setState({
      notEnteredFirstOrFamilyName: false,
      notEnteredMobilePhone: false,
      sameUserMobilePhone: false
    });
    if(contactEdit) {
      this.setState({
        sameUserMobilePhone: false,
        notEnteredFirstOrFamilyName: false,
        notEnteredMobilePhone: false,
        addBy: "",
        firstName: "",
        lastName: ""
      });
      dispatch(contactAdd(null, null, null, false, true));
    }
  }

  onClose(e, noHistory) {
    const {chatRouterLess, history, dispatch} = this.props;
    dispatch(contactAdding(false));
    dispatch(contactAdd(null, null, null, false, true));
    this.setState({
      addBy: "",
      firstName: "",
      lastName: ""
    });
    if (!chatRouterLess) {
      if (!noHistory) {
        history.push("/");
      }
    }
  }

  onFieldChange(field, event) {
    if(field === "addBy") {
      this.setState({
        sameUserMobilePhone: false
      });
    }
    this.setState({
      notEnteredFirstOrFamilyName: false,
      [field]: event.target.value
    });
  }

  render() {
    const {isShowing, contactAdd, contactAddPending, smallVersion, contactEdit, contactAddError} = this.props;
    const {addBy, firstName, lastName, notEnteredFirstOrFamilyName, notEnteredMobilePhone, sameUserMobilePhone} = this.state;
    const somethingWrong = contactAddError || (contactAdd && !contactAdd.linkedUser) || (notEnteredFirstOrFamilyName || notEnteredMobilePhone || sameUserMobilePhone);
    return (
      <Modal isOpen={isShowing} onClose={this.onClose.bind(this)} inContainer={smallVersion} fullScreen={smallVersion}
             userSelect="none">

        <ModalHeader>
          <Heading h3>{contactEdit && !contactEdit.isAdd ? strings.editContact(contactEdit) : strings.addContact}</Heading>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={this.onSubmit}>
            {!contactEdit &&
            <InputText max={40} onChange={this.onFieldChange.bind(this, "addBy")}
                       dir="ltr"
                       value={addBy}
                       placeholder={`${strings.mobilePhoneOrUsername} ( ${strings.required} )`}/>
            }
            <InputText max={15} onChange={this.onFieldChange.bind(this, "firstName")}
                       placeholder={`${strings.firstName} ( ${strings.required} )`}
                       value={firstName}/>
            <InputText max={15} onChange={this.onFieldChange.bind(this, "lastName")} placeholder={strings.lastName}
                       value={lastName}/>
            <input type="submit" style={{display: "none"}}/>
          </form>

        </ModalBody>

        <ModalFooter>
          <Button text loading={contactAddPending}
                  onClick={this.onSubmit}>{contactEdit && !contactEdit.isAdd ? strings.edit : strings.add}</Button>
          <Button text onClick={this.onClose.bind(this)}>{strings.cancel}</Button>
          {somethingWrong &&

          <Container inline>
            <Message warn>
              {(notEnteredFirstOrFamilyName ? strings.firstOrFamilyNameIsRequired : notEnteredMobilePhone ? strings.mobilePhoneIsRequired : sameUserMobilePhone ? strings.youCannotAddYourself : contactAddError ? contactAddError : strings.isNotPodUser)}
            </Message>
          </Container>

          }

        </ModalFooter>

      </Modal>
    )
  }
}

export default withRouter(ModalAddContact);