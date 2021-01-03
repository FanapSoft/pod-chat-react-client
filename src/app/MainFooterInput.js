// src/list/BoxScene.js
import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import sanitizeHTML from "sanitize-html";
import {humanFileSize, mobileCheck} from "../utils/helpers";
import Cookies from "js-cookie";
import {clearHtml, getCursorMentionMatch} from "./_component/Input"

//strings
import strings from "../constants/localization";

//actions
import {
  messageEdit,
  messageEditing,
  messageForward, messageForwardOnTheFly,
  messageReply,
  messageSend,
  messageSendOnTheFly
} from "../actions/messageActions";
import {threadDraft, threadEmojiShowing, threadIsSendingMessage} from "../actions/threadActions";

//components
import MainFooterInputEditing, {messageEditingCondition} from "./MainFooterInputEditing";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Container from "../../../pod-chat-ui-kit/src/container";
import Input from "./_component/Input";
import {codeEmoji, emojiRegex} from "./_component/EmojiIcons.js";
import {chatAudioRecorder as chatAudioRecorderAction, startTyping, stopTyping} from "../actions/chatActions";
import ParticipantSuggestion from "./_component/ParticipantSuggestion";
import {MdClose} from "react-icons/md";

//styling
import style from "../../styles/app/MainFooterInput.scss";
import OutsideClickHandler from "react-outside-click-handler";
import {emojiCookieName} from "../constants/emoji";
import {MESSAGE_SHARE} from "../constants/cookie-keys";
import styleVar from "../../styles/variables.scss";

export const constants = {
  replying: "REPLYING",
  forwarding: "FORWARDING"
};

@connect(store => {
  return {
    messageEditing: store.messageEditing,
    isSendingText: store.threadIsSendingMessage,
    thread: store.thread.thread,
    threadMessages: store.threadMessages,
    user: store.user.user,
    threadShowing: store.threadShowing
  };
}, null, null, {forwardRef: true})
export default class MainFooterInput extends Component {

  constructor(props) {
    super(props);
    this.setInputText = this.setInputText.bind(this);
    this.onStartTyping = this.onStartTyping.bind(this);
    this.onText = this.onText.bind(this);
    this.onNonEmptyText = this.onNonEmptyText.bind(this);
    this.onEmptyText = this.onEmptyText.bind(this);
    this.onInputFocus = this.onInputFocus.bind(this);
    this.onInputKeyPress = this.onInputKeyPress.bind(this);
    this.onInputKeyDown = this.onInputKeyDown.bind(this);
    this.onShowParticipant = this.onShowParticipant.bind(this);
    this.onParticipantSelect = this.onParticipantSelect.bind(this);
    this.onEmojiShowing = this.onEmojiShowing.bind(this);
    this.onRecordingCancel = this.onRecordingCancel.bind(this);
    this.resetParticipantSuggestion = this.resetParticipantSuggestion.bind(this);
    this.participantSuggestionsRef = React.createRef();
    this.recorderTimerId = null;
    this.typingSet = false;
    this.forwardMessageSent = false;
    this.inputNode = React.createRef();
    this.inputClassNode = React.createRef();
    this.lastTypingText = null;
    this.state = {
      recorderTimer: 0,
      showParticipant: false,
      messageText: ""
    };
  }

  onEmojiShowing(showing) {
    this.props.dispatch(threadEmojiShowing(showing));
  }

  focus() {
    const current = this.inputClassNode.current;
    if (current) {
      current.focus();
    }
  }

  setInputText() {
    this.inputClassNode.current && this.inputClassNode.current.setInputText.apply(null, arguments);
  }

  componentDidMount() {
    const {thread, dispatch} = this.props;
    dispatch(messageEditing());
    let draftMessage;
    if (thread && thread.id) {
      draftMessage = Cookies.get(MESSAGE_SHARE) || Cookies.get(thread.id) || null;
      if (draftMessage) {
        draftMessage = this._analyzeDraft(draftMessage);
      }
    }
    this.setInputText(draftMessage);
    dispatch(threadIsSendingMessage(!!draftMessage));
  }

  componentDidUpdate(prevProps) {
    const {dispatch, thread, messageEditing: msgEditing, threadMessages, threadShowing, chatAudioRecorder} = this.props;
    const {threadMessages: oldThreadMessages, threadShowing: oldThreadShowing, chatAudioRecorder: oldChatAudioRecorder} = prevProps;
    if (chatAudioRecorder !== oldChatAudioRecorder) {
      if (chatAudioRecorder === true) {
        this.recorderTimerId = setInterval(e => {
          const {recorderTimer} = this.state;
          this.setState({
            recorderTimer: recorderTimer === null ? 0 : recorderTimer + 1
          })
        }, 1000);
      } else {
        this.setState({
          recorderTimer: 0
        });
        this.recorderTimerId = clearInterval(this.recorderTimerId);
      }
    }
    const threadId = thread.id;
    const {id: oldThreadId} = prevProps.thread;
    const isThreadHide = oldThreadShowing && !threadShowing;
    const storeDraftCondition = oldThreadId !== threadId || isThreadHide;
    if (msgEditing !== prevProps.messageEditing) {
      if (this.state.messageText) {
        this._setDraft(threadId, this.state.messageText);
      }
      this.focus();
    }
    if (storeDraftCondition) {
      if (this.lastTypingText) {
        dispatch(threadDraft(isThreadHide ? threadId : oldThreadId, this.lastTypingText));
      } else {
        dispatch(threadDraft(isThreadHide ? threadId : oldThreadId));
      }
      let draftMessage = threadId ? Cookies.get(threadId) ? Cookies.get(threadId) : null : null;
      if (draftMessage) {
        draftMessage = this._analyzeDraft(draftMessage);
      }
      if (msgEditing) {
        let emptyEditingCondition = msgEditing.type !== constants.forwarding || msgEditing.threadId ? msgEditing.threadId !== threadId : false;
        if (emptyEditingCondition) {
          dispatch(messageEditing());
          this.setInputText(draftMessage);
          dispatch(threadIsSendingMessage(!!draftMessage));
        }
      } else {
        this.setInputText(draftMessage);
        dispatch(threadIsSendingMessage(!!draftMessage));
      }
      if (!mobileCheck()) {
        this.focus();
      }
    } else {
      if (!mobileCheck()) {
        const {fetching, threadId: threadMessagesThreadId} = threadMessages;
        if (threadMessagesThreadId === threadId) {
          if (oldThreadMessages.fetching) {
            if (!fetching) {
              this.focus();
            }
          }
        }
      }
    }
  }

  componentWillUnmount() {
    const {dispatch, thread} = this.props;
    const threadId = thread.id;
    if (this.lastTypingText) {
      dispatch(threadDraft(threadId, this.lastTypingText));
    } else {
      dispatch(threadDraft(threadId));
    }
  }

  frequentlyEmojiUsed(text) {
    let emoji = text.match(emojiRegex());
    if (emoji) {
      const lastArray = Cookies.get(emojiCookieName);
      let parsedArray = lastArray ? JSON.parse(lastArray) : [];

      function buildText(count, char) {
        return `${count}|${char}`;
      }

      const newArray = [];

      function increaseCount(array, index) {
        const countAndChar = array[index].split("|");
        array[index] = buildText(++countAndChar[0], countAndChar[1]);
        array = parsedArray.sort(((a, b) => b.split('|')[0] - a.split('|')[0]));
      }

      for (let emoj of emoji) {
        const indexInArray = parsedArray.findIndex(e => e.indexOf(emoj) > -1);
        const indexInNewArray = newArray.findIndex(e => e.indexOf(emoj) > -1);
        if (indexInArray > -1) {
          increaseCount(parsedArray, indexInArray);
        } else {
          if (indexInNewArray > -1) {
            increaseCount(newArray, indexInNewArray);
          } else {
            if (parsedArray.length + newArray.length >= 36) {
              const lastEmoji = parsedArray[parsedArray.length - 1];
              parsedArray.splice(parsedArray.length - 1, 1);
              newArray.push(buildText(1, emoj));
            } else {
              newArray.push(buildText(1, emoj));
            }
          }

        }
      }
      Cookies.set(emojiCookieName, JSON.stringify(parsedArray.concat(newArray).sort(((a, b) => b.split('|')[0] - a.split('|')[0]))), {expires: 9999999999});
    }

  }

  sendMessage() {
    const {thread, dispatch, messageEditing: msgEditing, emojiShowing} = this.props;
    const {messageText} = this.state;
    const {id: threadId} = thread;
    const clearMessageText = codeEmoji(clearHtml(messageText, true));
    let isEmptyMessage = false;
    if (!clearMessageText) {
      isEmptyMessage = true;
    }
    if (!isEmptyMessage) {
      if (!clearMessageText.trim()) {
        isEmptyMessage = true;
      }
    }

    if (!isEmptyMessage) {
      if (clearMessageText.length > 4096) {
        return
      }
      this.frequentlyEmojiUsed(clearMessageText);
    }
    if (msgEditing) {
      const msgEditingId = msgEditing.message instanceof Array ? msgEditing.message.map(e => e.id) : msgEditing.message.id;
      if (msgEditing.type === constants.replying) {
        if (isEmptyMessage) {
          return;
        }
        dispatch(messageReply(clearMessageText, msgEditingId, threadId, msgEditing.message));
      } else if (msgEditing.type === constants.forwarding) {
        if (clearMessageText) {
          if (thread.onTheFly) {
            dispatch(messageForwardOnTheFly(msgEditingId, clearMessageText));
          } else {
            dispatch(messageSend(clearMessageText, threadId));
            dispatch(messageForward(threadId, msgEditingId));
          }
        } else {
          if (thread.onTheFly) {
            dispatch(messageForwardOnTheFly(msgEditingId));
          } else {
            dispatch(messageForward(threadId, msgEditingId));
          }
        }
        this.forwardMessageSent = true;
      } else {
        if (isEmptyMessage) {
          return;
        }
        dispatch(messageEdit(clearMessageText, msgEditingId));
      }
    } else {
      if (isEmptyMessage) {
        return;
      }
      if (thread.onTheFly) {
        dispatch(messageSendOnTheFly(clearMessageText));
      } else {
        dispatch(messageSend(clearMessageText, threadId));
      }
    }
    dispatch(threadDraft(threadId));
    dispatch(messageEditing());
    if (mobileCheck()) {
      if (!emojiShowing) {
        this.focus();
      }
    } else {
      this.focus();
    }
    this.resetParticipantSuggestion();
    this.setInputText("");
  }

  _clearDraft(threadId) {
    Cookies.remove(threadId);
    Cookies.remove(MESSAGE_SHARE);
    this.lastTypingText = null;
  }

  _analyzeDraft(text = "") {
    const splitedText = text.split("|");
    setTimeout(() => {
      if (splitedText.length > 1) {
        const message = JSON.parse(splitedText[1]);
        let type = splitedText[2];
        if (type === "undefined" || type === "null") {
          type = null;
          message.draftMode = true;
        }
        this.props.dispatch(messageEditing(message, type));
      }
    }, 200);
    return splitedText[0];
  }

  _setDraft(threadId, text) {
    const {messageEditing, thread} = this.props;
    let concatText = "";
    if (messageEditing) {
      if (messageEditing.type !== constants.forwarding) {
        if (messageEditing.message.threadId === thread.id) {
          concatText += `|${JSON.stringify(messageEditing.message)}|${messageEditing.type}`;
        }
      }
    }
    const finalText = `${text}${concatText}`;
    Cookies.set(threadId, finalText);
    this.lastTypingText = text;
  }

  onParticipantSelect(contact) {
    const {messageText} = this.state;
    if (!contact) {
      return this.sendMessage();
    }
    const newMessageText = getCursorMentionMatch(messageText, this.inputNode.current, true, contact.username);
    this.setInputText(newMessageText);
    setTimeout(() => this.focus(), 100);
    this.resetParticipantSuggestion();
  }

  removeBluish() {
    /*    const {messageText} = this.state;
        const lastMentionedMan = getCursorMentionMatch(messageText, this.inputNode.current);*/
  }

  onInputKeyPress(evt) {
    if (!mobileCheck()) {
      if (evt.which === 13 && !evt.shiftKey) {
        this.sendMessage();
      }
    }
  }

  onInputKeyDown(evt) {
    if (this.props.thread.group) {
      const {showParticipant} = this.state;
      const {keyCode} = evt;
      if (evt.keyCode === 13 && evt.shiftKey) {
        return;
      } else if (keyCode === 27) {
        if (!showParticipant) {
          return this.resetParticipantSuggestion();
        }
      }
      if (showParticipant) {
        if (keyCode === 27) {
          return this.resetParticipantSuggestion();
        }
        this.participantSuggestionsRef.current.keyDownSignal(evt);
      }
    }
  }

  onInputFocus(e) {
    const {emojiShowing, dispatch} = this.props;
    if (mobileCheck()) {
      if (emojiShowing) {
        dispatch(threadEmojiShowing(false));
      }
    }
  }

  resetParticipantSuggestion() {
    this.setState({
      showParticipant: false,
      filterString: null
    });
  }

  onStartTyping(isTyping) {
    const {thread, dispatch} = this.props;
    const threadId = thread.id;
    if (isTyping) {
      return dispatch(startTyping(threadId));
    }
    dispatch(stopTyping());
  }

  onShowParticipant(showParticipant, filterString) {
    if (this.props.thread.group) {
      if (showParticipant) {
        return this.setState({
          showParticipant: true,
          filterString: filterString
        });
      }
      this.setState({
        showParticipant: false,
        filterString: null
      });
    }
  }

  onText(newText) {
    this.setState({
      messageText: newText
    });
  }

  onNonEmptyText(newText) {
    const {dispatch, thread} = this.props;
    this._setDraft(thread.id, newText);
    dispatch(threadIsSendingMessage(true));
  }

  onEmptyText() {
    const {dispatch, messageEditing, thread} = this.props;
    if (!this.forwardMessageSent && messageEditing) {
      if (messageEditing.type === constants.forwarding) {
        return;
      }
    }
    if (this.forwardMessageSent) {
      this.forwardMessageSent = false;
    }
    this._clearDraft(thread.id);
    dispatch(threadIsSendingMessage(false));
  }

  onRecordingCancel() {
    this.props.dispatch(chatAudioRecorderAction("CANCELED"));
  }

  render() {
    const {messageEditing, thread, user, emojiShowing, chatAudioRecorder, isSendingText} = this.props;
    const {messageText, showParticipant, filterString, recorderTimer} = this.state;
    const voiceIsPresent = (!messageEditing || messageEditing.type === constants.replying) && !isSendingText;
    const editBoxClassNames = classnames({
      [style.MainFooterInput__EditBox]: true,
      [style["MainFooterInput__EditBox--halfBorder"]]: messageEditingCondition(messageEditing)
    });
    const participantsPositionContainerClassNames =
      classnames({
        [style.MainFooterInput__ParticipantPositionContainer]: true,
        [style["MainFooterInput__ParticipantPositionContainer--mobile"]]: mobileCheck()
      });
    const editBoxInputContainerClassNames = classnames({
      [style.MainFooterInput__EditBoxInputContainer]: true,
      [style["MainFooterInput__EditBoxInputContainer--voiceIsPresent"]]: voiceIsPresent
    });


    return (
      <Container className={style.MainFooterInput}>
        <OutsideClickHandler onOutsideClick={this.resetParticipantSuggestion}>
          {(showParticipant && !chatAudioRecorder ) &&

          <Container className={style.MainFooterInput__ParticipantContainer}>
            <Container className={participantsPositionContainerClassNames}>
              <ParticipantSuggestion filterString={filterString} onSelect={this.onParticipantSelect} user={user}
                                     ref={this.participantSuggestionsRef}
                                     thread={thread}/>
            </Container>
          </Container>
          }

          <Container>
            <MainFooterInputEditing messageEditing={messageEditing} setInputText={this.setInputText}/>
          </Container>
          {
            chatAudioRecorder &&
            <Container className={style.MainFooterInput__RecordingTimer}>
              <Container className={style.MainFooterInput__RecordingTimerCountDown}>
                <Text color="accent" dark bold inline>
                  {new Date(recorderTimer * 1000).toISOString().substr(14, 5)}
                </Text>
                <Container className={style.MainFooterInput__RecordingCancel} onClick={this.onRecordingCancel}>
                  <MdClose size={styleVar.iconSizeMd}
                           color={styleVar.colorWhite}/>
                </Container>
              </Container>
              <Container className={style.MainFooterInput__RecordingTimerText}>
                <Text color="accent" dark bold>
                  {strings.recordingVoice}...
                </Text>
              </Container>
            </Container>
          }

          <Input
            ref={this.inputClassNode}
            inputNode={this.inputNode}
            containerClassName={editBoxClassNames}
            editBoxClassName={editBoxInputContainerClassNames}
            inputContainerClassName={style.MainFooterInput__InputContainer}
            inputClassName={style.MainFooterInput__Input}
            showParticipant={showParticipant}
            onShowParticipant={this.onShowParticipant}
            placeholder={strings.pleaseWriteHere}
            emojiShowing={emojiShowing}
            chatAudioRecorder={chatAudioRecorder}
            voiceRecorderEnable={voiceIsPresent}
            onStartTyping={this.onStartTyping}
            sendByEnter
            onText={this.onText}
            onNonEmptyText={this.onNonEmptyText}
            onEmptyText={this.onEmptyText}
            onEmojiShowing={this.onEmojiShowing}
            onFocus={this.onInputFocus}
            onKeyPress={this.onInputKeyPress}
            onKeyDown={this.onInputKeyDown}
            value={messageText}/>
        </OutsideClickHandler>
      </Container>
    );
  }
}