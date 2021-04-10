// src/
import React, {Component} from "react";
import {connect} from "react-redux";
import date from "../utils/date";
import {messageDatePetrification, mobileCheck} from "../utils/helpers";

//strings
import strings from "../constants/localization";

//actions
import {threadLeftAsideShowing, threadSearchMessage, threadGoToMessageId} from "../actions/threadActions";

//UI components
import {InputText} from "../../../pod-chat-ui-kit/src/input";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Container from "../../../pod-chat-ui-kit/src/container";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import Message from "../../../pod-chat-ui-kit/src/message";
import {sanitizeRule} from "./AsideThreads";
import {decodeEmoji} from "./_component/EmojiIcons.js";

//styling
import style from "../../styles/app/LeftAsideMainSearch.scss";

@connect(store => {
  return {
    leftAsideShowing: store.threadLeftAsideShowing,
    thread: store.thread.thread,
    threadSearchMessagePending: store.threadSearchMessage.fetching,
    threadSearchMessages: store.threadSearchMessage.messages.messages,
    threadSearchMessagesReset: store.threadSearchMessage.messages.reset
  }
})
export default class LeftAsideMainSearch extends Component {

  constructor(props) {
    super(props);
    this.onSearchQueryChange = this.onSearchQueryChange.bind(this);
    this.inputRef = React.createRef();
    this.state = {
      query: ""
    }
  }

  componentDidMount(oldProps) {
    this.setState({query: ""});
    this.search("");
    this.inputRef.current.focus();
  }

  onSearchQueryChange(event) {
    const value = event.target.value;
    this.setState({
      query: value
    });
    clearTimeout(this.toSearchTimoutId);
    if (!value.slice()) {
      return this.search(value);
    }
    this.toSearchTimoutId = setTimeout(e => {
      clearTimeout(this.toSearchTimoutId);
      this.search(value);
    }, 750);
  }

  search(query) {
    const {thread} = this.props;
    if (query && query.slice()) {
      return this.props.dispatch(threadSearchMessage(thread.id, query));
    } else {
      return this.props.dispatch(threadSearchMessage());
    }
  }

  onSearchItemClicked(messageTime) {
    const {smallVersion, dispatch} = this.props;
    if (smallVersion || mobileCheck()) {
      dispatch(threadLeftAsideShowing(false));
    }
    dispatch(threadGoToMessageId(messageTime));
  }

  render() {
    const {query} = this.state;
    const {threadSearchMessages, threadSearchMessagePending, threadSearchMessagesReset} = this.props;
    return (
      <Container>
        <InputText onChange={this.onSearchQueryChange} value={query} placeholder={strings.search} ref={this.inputRef}/>
        {threadSearchMessagePending ?
          (
            <Container relative userSelect="none">
              <Container topCenter>
                <Loading hasSpace><LoadingBlinkDots size="sm"/></Loading>
              </Container>
            </Container>
          )
          :
          threadSearchMessages && threadSearchMessages.length ? (
              <List>
                {threadSearchMessages.map(el => (
                  <ListItem key={el.id} onSelect={this.onSearchItemClicked.bind(this, el.time, el.id)} selection invert>
                    <Container relative userSelect="none">
                      <Container inline className={style.LeftAsideMainSearch__TextContainer}>
                        <Container className={style.LeftAsideMainSearch__MessageContainer}>
                          <Text isHTML
                                size="sm"
                                sanitizeRule={sanitizeRule}>{decodeEmoji(el.message)}</Text>
                        </Container>
                        <Container className={style.LeftAsideMainSearch__MessageTimeContainer}>
                          <Text wordWrap="breakWord"
                                color="gray"
                                dark
                                size="sm">{messageDatePetrification(el.time)}</Text>
                        </Container>
                      </Container>
                      <Container inline centerLeft>
                        <Text wordWrap="breakWord"
                              size="sm">{el.participant.contactName || el.participant.name}</Text>
                      </Container>
                    </Container>
                  </ListItem>
                ))}
              </List>
            ) :
            <Container relative>
              <Container topCenter>
                <Message>{!threadSearchMessagesReset ? strings.noResult : strings.searchSomething}</Message>
              </Container>
            </Container>
        }

      </Container>
    )
  }
}
