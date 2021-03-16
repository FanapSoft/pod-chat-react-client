import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {avatarNameGenerator, avatarUrlGenerator, getMessageMetaData} from "../utils/helpers";
import {Virtuoso} from "./_component/Virtuoso";

//strings
import strings from "../constants/localization";

//actions
import {
  threadCreateOnTheFly,
  threadCreateWithExistThread,
  threadGetList,
  threadModalListShowing
} from "../actions/threadActions";
import {messageEditing} from "../actions/messageActions";

//UI components
import Modal, {ModalBody, ModalHeader, ModalFooter} from "../../../pod-chat-ui-kit/src/modal";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import {Heading} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Container from "../../../pod-chat-ui-kit/src/container";
import {ContactSearchFragment, NoResultFragment, PartialLoadingFragment} from "./ModalContactList";
import {contactGetList} from "../actions/contactActions";
import {ContactList} from "./_component/contactList";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";


//styling

const constants = {
  forwarding: "FORWARDING",
  count: 50
};

@connect(store => {
  return {
    threads: store.threads.threads,
    threadsNextOffset: store.threads.nextOffset,
    threadsHasNext: store.threads.hasNext,
    isShow: store.threadModalListShowing.isShowing,
    message: store.threadModalListShowing.message,
    user: store.user.user
  };
}, null, null, {forwardRef: true})
export default class ModalThreadList extends Component {

  constructor(props) {
    super(props);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onScrollBottomThreshold = this.onScrollBottomThreshold.bind(this);
    this.state = {
      remainingThreadsNextOffset: 0,
      remainingThreadsHasNext: false,
      remainingThreadsPartialFetching: false,
      remainingThreads: [],
      query: null,
      avatar: null,
    }
  }

  componentDidUpdate({threadsNextOffset: oldThreadsNextOffset, isShow: oldIsShow}) {
    const {threadsHasNext, threadsNextOffset, threads, isShow} = this.props;
    if (oldThreadsNextOffset !== threadsNextOffset || isShow !== oldIsShow) {
      this.setState({
        remainingThreadsHasNext: threadsHasNext,
        remainingThreadsNextOffset: threadsNextOffset,
        remainingThreads: threads
      });
    }
  }

  onClose() {
    this.props.dispatch(threadModalListShowing(false));
    this.setState({
      remainingThreadsNextOffset: 0,
      remainingThreadsHasNext: false,
      remainingThreadsPartialFetching: false,
      remainingThreads: [],
      query: null
    });
  }

  _directThreadListRequest(contactsNextOffset) {
    const {dispatch} = this.props;
    dispatch(threadGetList(contactsNextOffset || 0, constants.count, null, true, {cache: false}))
      .then(({threads, nextOffset, hasNext}) => {
        const {remainingThreads} = this.state;
        let realThreads = remainingThreads.concat(threads);
        this.setState({
          remainingThreadsNextOffset: nextOffset,
          remainingThreadsHasNext: hasNext,
          remainingThreads: realThreads,
          remainingThreadsPartialFetching: false
        });
      });
  }

  onScrollBottomThreshold() {
    const {remainingThreadsNextOffset} = this.state;
    this.setState({
      remainingThreadsPartialFetching: true
    });
    this._directThreadListRequest(remainingThreadsNextOffset, false, this.state.query);
  }

  onSearchChange(query) {
    if (query) {
      const {dispatch} = this.props;
      this.setState({
        queryThreadsSearching: true,
        queryContactsSearching: true,
      });
      dispatch(threadGetList(0, 3, query, true)).then(result => {
        this.setState({
          queryThreads: result.threads,
          queryThreadsSearching: false
        })
      });
      dispatch(contactGetList(0, 3, query, false, true)).then(result => {
        this.setState({
          queryContacts: result.contacts,
          queryContactsSearching: false
        })
      });
      return;
    }
    this._directThreadListRequest(0, true);
  }

  onSelect(thread, isContact) {
    const {dispatch, message} = this.props;
    if (isContact && isContact.id) {
      const user = {
        id: isContact.id,
        isMyContact: true,
        coreUserId: isContact.linkedUser.coreUserId,
        image: isContact.linkedUser.image,
        name: `${isContact.firstName}${isContact.lastName ? ` ${isContact.lastName}` : ''}`
      };
      dispatch(threadCreateOnTheFly(user.coreUserId, user)).then(thread => {
        dispatch(messageEditing(message, constants.forwarding, thread ? thread.id : `ON_THE_FLY_${user.id}`));
      });
    } else {
      dispatch(threadCreateWithExistThread(thread));
      dispatch(messageEditing(message, constants.forwarding, thread.id));
    }
    this.onClose();
  }

  render() {
    const {isShow, smallVersion, user} = this.props;
    const {query, remainingThreadsHasNext, remainingThreadsPartialFetching, remainingThreads, queryThreads, queryContacts, queryThreadsSearching, queryContactsSearching} = this.state;
    const realThreads = remainingThreads.filter(thread => !thread.group || thread.type !== 8 || thread.inviter.id === user.id);
    const isQueriedResult = query;
    const isThreadQueriedHasResult = isQueriedResult && queryThreads && queryThreads.length;
    const isContactsQueriedHasResult = isQueriedResult && queryContacts && queryContacts.length;
    const threadsHasResult = (!isQueriedResult && realThreads.length) || isThreadQueriedHasResult;
    return (
      <Modal isOpen={isShow} onClose={this.onClose.bind(this)} inContainer={smallVersion} fullScreen={smallVersion}
             userSelect="none">

        <ModalHeader>
          <Heading h3>{strings.forwardTo}</Heading>
          <Container relative>
            <ContactSearchFragment
              onSearchInputChange={query => this.setState({
                query,
                queryThreads: null,
                queryContacts: null,
                queryThreadsSearching: !!query,
                queryContactsSearching: !!query
              })}
              onSearchChange={this.onSearchChange} query={query}/>
            {(queryThreadsSearching || queryThreadsSearching) &&
            <Container centerLeft>
              <Gap x={35}>
                <Loading><LoadingBlinkDots size="sm"/></Loading>
              </Gap>
            </Container>
            }
          </Container>
        </ModalHeader>

        <ModalBody>
          {isQueriedResult &&
          <Fragment>
            <Text bold color="accent">{strings.conversations}</Text>
          </Fragment>
          }

          {
            threadsHasResult ?
              <Container relative>
                <List>
                  <Virtuoso style={{height: isQueriedResult ? "195px" : `calc(100vh - 300px)`}}
                            data={isQueriedResult ? queryThreads : realThreads}
                            endReached={e => (!query && (remainingThreadsHasNext && !remainingThreadsPartialFetching)) && this.onScrollBottomThreshold()}
                            itemContent={(idx, el) => {
                              return <ListItem key={el.id} selection invert onSelect={this.onSelect.bind(this, el)}>
                                <Container relative>

                                  <Avatar>
                                    <AvatarImage
                                      src={avatarUrlGenerator.apply(this, [el.image, avatarUrlGenerator.SIZES.SMALL, getMessageMetaData(el)])}
                                      text={avatarNameGenerator(el.title).letter}
                                      textBg={avatarNameGenerator(el.title).color}/>
                                    <AvatarName>{el.title}</AvatarName>
                                  </Avatar>

                                </Container>
                              </ListItem>
                            }}>

                  </Virtuoso>
                </List>
                {remainingThreadsPartialFetching && <PartialLoadingFragment/>}
              </Container>
              :
              <NoResultFragment>{queryThreadsSearching ? `${strings.searchingForThreads}...` : strings.thereIsNoThreadsWithThisKeyword()}</NoResultFragment>
          }
          {isQueriedResult &&
          <Fragment>
            <Text bold color="accent">{strings.contacts}</Text>
          </Fragment>
          }
          {
            isContactsQueriedHasResult ?
              <Container relative>
                <ContactList selection
                             height="195px"
                             invert
                             avatarSize={avatarUrlGenerator.SIZES.SMALL}
                             onSelect={this.onSelect.bind(this)}
                             contacts={queryContacts}/>
              </Container>
              :
              isQueriedResult ?
                <NoResultFragment>{queryContactsSearching ? `${strings.searchingForContacts}...` : strings.thereIsNoContactWithThisKeyword()}</NoResultFragment>
                :
                ""
          }

        </ModalBody>

        <ModalFooter>
          <Button text onClick={this.onClose.bind(this)}>{strings.close}</Button>
        </ModalFooter>

      </Modal>
    )
  }
}
