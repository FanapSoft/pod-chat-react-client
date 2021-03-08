// src/list/BoxScene.js
import React, {Component} from "react";
import ReactDOM from "react-dom";
import {connect} from "react-redux";
//actions
import {
  threadParticipantList
} from "../../actions/threadActions";

//components
import Container from "../../../../pod-chat-ui-kit/src/container";
import Scroller from "../../../../pod-chat-ui-kit/src/scroller";
import List from "../../../../pod-chat-ui-kit/src/List";
import {Text} from "../../../../pod-chat-ui-kit/src/typography";
import {ContactListItem} from "./contactList";
import Loading, {LoadingBlinkDots} from "../../../../pod-chat-ui-kit/src/loading";
import Gap from "../../../../pod-chat-ui-kit/src/gap";

//styling
import style from "../../../styles/modules/ParticipantSuggestion.scss";


export function isElementVisible(el) {
  var rect = el.getBoundingClientRect(),
    vWidth = window.innerWidth || doc.documentElement.clientWidth,
    vHeight = window.innerHeight || doc.documentElement.clientHeight,
    efp = function (x, y) {
      return document.elementFromPoint(x, y)
    };

  // Return false if it's not in the viewport
  if (rect.right < 0 || rect.bottom < 0
    || rect.left > vWidth || rect.top > vHeight)
    return false;

  // Return true if any of its four corners are visible
  return (
    el.contains(efp(rect.left, rect.top))
    || el.contains(efp(rect.right, rect.top))
    || el.contains(efp(rect.right, rect.bottom))
    || el.contains(efp(rect.left, rect.bottom))
  );
}

export const constants = {
  count: 20
};

@connect(null, null, null, {forwardRef: true})
export default class extends Component {

  constructor(props) {
    super(props);
    this.hasNextParticipants = false;
    this.requesting = false;
    this.nextParticipantOffset = 0;
    this.searchParticipantTimeout = null;
    this.onScrollBottomThreshold = this.onScrollBottomThreshold.bind(this);
    this.onContactSelect = this.onContactSelect.bind(this);
    this.activeRef = React.createRef();
    this.state = {
      participants: [],
      participantsActiveIndex: 0,
    };
  }

  _reset() {
    this.hasNextParticipants = false;
    this.nextParticipantOffset = 0;
    this.setState({
      participants: [],
      participantsActiveIndex: 0
    });
  }

  componentDidMount() {
    this._reset();
    this.getParticipantList();
  }

  shouldComponentUpdate(nextProps) {
    const {filterString: newFilterString} = nextProps;
    const {filterString} = this.props;
    if (newFilterString !== filterString) {
      this._reset();
      this.requesting = true;
      clearTimeout(this.searchParticipantTimeout);
      this.searchParticipantTimeout = setTimeout(e => {
        this.requesting = false;
        clearTimeout(this.searchParticipantTimeout);
        this.getParticipantList(newFilterString);
      }, 750);
    }
    return true;
  }

  componentDidUpdate(prevProps, {participantsActiveIndex: oldParticipantsActiveIndex}) {
    const {participantsActiveIndex} = this.state;
    if (oldParticipantsActiveIndex !== participantsActiveIndex) {
      if (this.activeRef.current) {
        const node = ReactDOM.findDOMNode(this.activeRef.current);
        if (!isElementVisible(node)) {
          node.scrollIntoView();
        }
      }
    }
  }

  onScrollBottomThreshold() {
    if (this.hasNextParticipants) {
      this.getParticipantList();
    }
  }

  onContactSelect(contactId, contact) {
    const {onSelect} = this.props;
    if (onSelect) {
      onSelect(contact);
    }
  }

  getParticipantList(query) {
    if (this.requesting) {
      return;
    }
    const {thread, filterString, user, dispatch} = this.props;
    dispatch(threadParticipantList(thread.id, this.nextParticipantOffset, constants.count, query || filterString, true)).then(result => {
      this.requesting = false;
      const {participants} = this.state;
      const {participants: nextParticipants, hasNext, nextOffset} = result;
      this.nextParticipantOffset = nextOffset;
      this.hasNextParticipants = hasNext;
      this.setState({
        participantsActiveIndex: nextParticipants.length ? 0 : null,
        participants: participants.concat(nextParticipants).filter(e => e.id !== user.id)
      });
    });
    this.requesting = true;
  }

  keyDownSignal(evt) {
    const {keyCode} = evt;
    const {participants, participantsActiveIndex} = this.state;

    const setActiveList = isDown => {
      let isLast = participantsActiveIndex === participants.length - 1;
      let isFirst = participantsActiveIndex === 0;
      if (isFirst) {
        if (!isDown) {
          return;
        }
      } else if (isLast) {
        if (isDown) {
          return;
        }
      }
      if (isDown) {
        return this.setState({
          participantsActiveIndex: participantsActiveIndex + 1
        });
      }
      return this.setState({
        participantsActiveIndex: participantsActiveIndex - 1
      });
    };

    const actionMapping = {
        37: () => {
        },
        38: () => setActiveList(),
        39: () => {
        },
        40: () => setActiveList(true),
        13: () => {
          this.onContactSelect(null, participants[participantsActiveIndex]);
        },
        9: () => {
          if (participantsActiveIndex !== null) {
            this.onContactSelect(null, participants[participantsActiveIndex]);
          }
        }
      }
    ;
    if (keyCode in actionMapping) {
      evt.preventDefault();
      actionMapping[`${keyCode}`]()
    }
  }

  render() {
    const {participants, participantsActiveIndex} = this.state;
    const leftActionFragment = ({contact}) =>
      <Container inline>
        <Gap x={4}/>
        <Text wordWrap="breakWord" whiteSpace="preWrap" color="accent" dark inline size="sm">
          {contact.username}
        </Text>
      </Container>;

    return (
      <Scroller className={style.ParticipantSuggestion}
                threshold={5}
                onScrollBottomThresholdCondition={this.hasNextParticipants}
                onScrollBottomThreshold={this.onScrollBottomThreshold}>
        {this.requesting && <Container>
          <Loading hasSpace><LoadingBlinkDots size="sm"/></Loading>
        </Container>
        }
        <List>
          {participants.map(contact =>
            <ContactListItem contact={contact}
                                     onSelect={this.onContactSelect} AvatarNameFragment={leftActionFragment}
                                     maxAvatarNameWidth={"auto"}
                                     activeRef={this.activeRef}
                                     activeList={[participants[participantsActiveIndex] ? participants[participantsActiveIndex].id : null]}
                                     selection invert/>
          )}
        </List>

      </Scroller>
    );
  }
}