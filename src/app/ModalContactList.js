import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import classnames from "classnames";
import {Virtuoso} from 'react-virtuoso'

//strings
import strings from "../constants/localization";

//actions
import {
  contactAdding,
  contactGetList,
} from "../actions/contactActions";

//UI components
import Modal, {ModalBody, ModalHeader, ModalFooter} from "../../../pod-chat-ui-kit/src/modal";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import {Heading, Text} from "../../../pod-chat-ui-kit/src/typography";
import Container from "../../../pod-chat-ui-kit/src/container";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {InputText} from "../../../pod-chat-ui-kit/src/input";
import {MdSearch, MdClose} from "react-icons/md";

//styling
import style from "../../styles/app/ModalContactList.scss";
import styleVar from "../../styles/variables.scss";
import {ContactList, ContactListSelective} from "./_component/contactList";
import {ROUTE_ADD_CONTACT} from "../constants/routes";
import {avatarUrlGenerator} from "../utils/helpers";


export const statics = {
  count: 10,
  userType: {
    ALL: "ALL",
    HAS_POD_USER: "HAS_POD_USER",
    HAS_POD_USER_NOT_BLOCKED: "HAS_POD_USER_NOT_BLOCKED",
    HAS_POD_USER_BLOCKED: "HAS_POD_USER_BLOCKED",
    NOT_POD_USER: "NOT_POD_USER"
  }
};

export function PartialLoadingFragment() {
  return (
    <Container bottomCenter centerTextAlign style={{zIndex: 1}}>
      <Loading><LoadingBlinkDots size="sm"/></Loading>
    </Container>
  )
}

export function NoResultFragment({children}) {
  return <Container relative centerTextAlign>
    <Gap y={5}>
      <Container>
        <Text>{children}</Text>
      </Container>
    </Gap>
  </Container>
}

export function ContactSearchFragment({onSearchInputChange, onSearchChange, query, inputRef, inputClassName}) {

  function onSearchQueryChange(e) {
    const query = e.target ? e.target.value : "";
    onSearchInputChange(query);
    clearTimeout(window.toSearchTimoutId);
    if (!query.slice()) {
      return onSearchChange(query.slice());
    }

    window.toSearchTimoutId = setTimeout(e => {
      clearTimeout(window.toSearchTimoutId);
      onSearchChange(query);
    }, 750);
  }

  const classNames = classnames({
    [style.ModalContactList__Input]: true,
    [inputClassName]: inputClassName
  });

  return (
    <Container relative>
      <Container centerRight>
        <MdSearch size={styleVar.iconSizeMd} color={styleVar.colorGrayDark}/>
      </Container>
      <InputText className={classNames} onChange={onSearchQueryChange} value={query || ""}
                 placeholder={strings.search} ref={inputRef}/>
      <Container centerLeft>
        <Gap x={5}>
          {
            query && query.trim() ?

              <MdClose size={styleVar.iconSizeMd}
                       color={styleVar.colorGrayDark}
                       style={{cursor: "pointer"}}
                       onClick={onSearchQueryChange.bind(null, "")}/>
              : ""
          }
        </Gap>
      </Container>
    </Container>
  )
}

function AvatarTextFragment({contact}) {
  return <Text size="xs" inline
               color={contact.blocked ? "red" : "accent"}>{contact.blocked ? strings.blocked : contact.linkedUser ? "" : strings.isNotPodUser}</Text>;
}

function filterContactList(contacts, userType) {
  const {ALL, HAS_POD_USER, HAS_POD_USER_BLOCKED, HAS_POD_USER_NOT_BLOCKED} = statics.userType;
  if (!userType || userType === ALL) {
    return contacts;
  }
  if (userType === HAS_POD_USER) {
    return contacts.filter(e => e.hasUser);
  }
  if (userType === HAS_POD_USER_BLOCKED) {
    return contacts.filter(e => e.hasUser && e.blocked);
  }
  if (userType === HAS_POD_USER_NOT_BLOCKED) {
    return contacts.filter(e => e.hasUser && !e.blocked);
  }
  return contacts.filter(e => !e.hasUser);
}

@connect(store => {
  return {
    contacts: store.contactGetList.contacts,
    contactsHasNext: store.contactGetList.hasNext,
    contactsNextOffset: store.contactGetList.nextOffset,
    contactsFetching: store.contactGetList.fetching,
    contactsPartialFetching: store.contactGetListPartial.fetching,
    chatInstance: store.chatInstance.chatSDK,
    chatRouterLess: store.chatRouterLess,
    smallVersion: store.chatSmallVersion
  };
}, null, null, {forwardRef: true})
class ModalContactList extends Component {

  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onScrollBottomThreshold = this.onScrollBottomThreshold.bind(this);
    this.onClose = this.onClose.bind(this);
    this.state = {
      query: null
    };
  }

  componentDidUpdate({isShow: oldIsShow, chatInstance: oldChatInstance, contactsNextOffset: oldContactsNextOffset}) {
    const {chatInstance, dispatch, isShow, userType, contacts, contactsHasNext, contactsNextOffset} = this.props;
    const {searchInput} = this.state;

    if (oldChatInstance !== chatInstance) {
      dispatch(contactGetList(0, statics.count, searchInput));
    }

    const filterContacts = filterContactList(contacts, userType);
    if (!filterContacts.length) {
      if (oldContactsNextOffset !== contactsNextOffset) {
        if (contactsHasNext) {
          dispatch(contactGetList(contactsNextOffset, statics.count, searchInput));
        }
      }
    }
    if (oldIsShow !== isShow) {
      if (chatInstance) {
        dispatch(contactGetList(0, statics.count, searchInput));
      }
    }
    if (searchInput) {
      const current = this.inputRef.current;
      if (current) {
        this.inputRef.current.focus();
      }
    }
  }

  componentDidMount() {
    const {dispatch, chatInstance} = this.props;
    if (chatInstance) {
      dispatch(contactGetList(null, null, null, true));
      dispatch(contactGetList(0, statics.count));
    }
  }

  onAdd() {
    const {chatRouterLess, history, dispatch} = this.props;
    dispatch(contactAdding(true));
    if (!chatRouterLess) {
      history.push(ROUTE_ADD_CONTACT);
    }
  }

  onClose() {
    const {onClose} = this.props;
    if (onClose) {
      onClose();
    }
    this.onSearchInputChange("");
  }

  onSearchInputChange(query) {
    this.setState({query});
  }

  onSearchChange(query) {
    const {dispatch} = this.props;
    dispatch(contactGetList(0, statics.count, query));
  }

  onScrollBottomThreshold() {
    const {contactsNextOffset, dispatch} = this.props;
    const {query} = this.state;
    dispatch(contactGetList(contactsNextOffset, statics.count, query));
  }

  render() {
    const {
      contacts, isShow, smallVersion, chatInstance, onSelect, onDeselect,
      contactsHasNext, contactsFetching, contactsPartialFetching,
      FooterFragment, LeftActionFragment,
      selectiveMode, activeList, headingTitle, userType
    } = this.props;
    const {query} = this.state;
    const commonArgs = {
      contacts: filterContactList(contacts, userType),
      onSelect,
      invert: true,
      AvatarTextFragment,
      LeftActionFragment,
      endReached: () => {
        if (contactsHasNext && !contactsPartialFetching) {
          this.onScrollBottomThreshold();
        }
      }
    };
    return (
      <Modal isOpen={isShow} onClose={this.onClose} inContainer={smallVersion} fullScreen={smallVersion}
             userSelect="none">

        <ModalHeader>
          <Heading h3>{headingTitle || strings.contactList}</Heading>
          <ContactSearchFragment onSearchInputChange={this.onSearchInputChange} onSearchChange={this.onSearchChange}
                                 query={query} inputRef={this.inputRef}/>
        </ModalHeader>

        <ModalBody threshold={5}
                   onScrollBottomThresholdCondition={contactsHasNext && !contactsPartialFetching}
                   onScrollBottomThreshold={this.onScrollBottomThreshold}>


          {contacts.length ?
            <Container relative>
              {selectiveMode ?
                <ContactListSelective activeWithTick
                                      avatarSize={avatarUrlGenerator.SIZES.SMALL}
                                      activeList={activeList}
                                      onDeselect={onDeselect}
                                      {...commonArgs}/>
                :
                <ContactList selection
                             avatarSize={avatarUrlGenerator.SIZES.SMALL}
                             {...commonArgs}/>
              }

              {contactsPartialFetching && <PartialLoadingFragment/>}
            </Container>
            :
            query && query.trim() ?
              <Container relative centerTextAlign>
                <Gap y={5}>
                  <Container>
                    <Text>{strings.thereIsNoContactWithThisKeyword(query)}</Text>
                  </Container>
                </Gap>
              </Container>
              :
              contactsFetching || !chatInstance ?
                <Container centerTextAlign className={style.ModalContactList__Loading}>
                  <Loading hasSpace><LoadingBlinkDots/></Loading>
                  <Text>{strings.waitingForContact}...</Text>
                </Container>
                :
                <Container centerTextAlign className={style.ModalContactList__Loading}>
                  <Text>{strings.noContactPleaseAddFirst}</Text>
                  <Button text onClick={this.onAdd.bind(this)}>{strings.add}</Button>
                </Container>
          }
        </ModalBody>

        <ModalFooter>
          {FooterFragment && <FooterFragment/>}
        </ModalFooter>

      </Modal>
    )
  }
}

export default withRouter(ModalContactList);