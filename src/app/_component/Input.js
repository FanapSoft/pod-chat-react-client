// src/list/BoxScene.js
import React, {Component} from "react";
import classnames from "classnames";
import sanitizeHTML from "sanitize-html";
import {mobileCheck} from "../../utils/helpers";

//strings

//actions

//components
import Container from "../../../../pod-chat-ui-kit/src/container";
import {InputTextArea} from "../../../../pod-chat-ui-kit/src/input";
import InputEmojiTrigger from "./InputEmojiTrigger";
import InputVoice from "./InputVoice";

//styling

export const constants = {
  replying: "REPLYING",
  forwarding: "FORWARDING"
};

export function sanitizeRule(isSendingMessage) {
  return {
    allowedTags: isSendingMessage ? null : ["img", "br", "div"],
    allowedAttributes: {
      img: ["src", "style", "class", "alt"]
    },
    exclusiveFilter: function (frame) {
      if (frame.tag === "img") {
        if (!frame.attribs.class) {
          return true
        }
        if (!~frame.attribs.class.indexOf("emoji")) {
          return true;
        }
      }
    }
  }
}

export function clearHtml(html, clearTags) {
  if (!html) {
    return html;
  }
  const document = window.document.createElement("div");
  document.innerHTML = html;
  const children = Array.from(document.childNodes);
  const removingIndexes = [];
  const clonedChildren = [...children].reverse();
  for (let child of clonedChildren) {
    if (child.data) {
      break;
    }
    if (child.innerText === "\n") {
      removingIndexes.push(children.indexOf(child));
      continue;
    }
    break;
  }
  let filterChildren = [];
  if (removingIndexes.length) {
    let index = 0;
    for (const child of children) {
      if (removingIndexes.indexOf(index) === -1) {
        filterChildren.push(child);
      }
      index++;
    }
  } else {
    filterChildren = children;
  }
  const newText = window.document.createElement("div");

  filterChildren.map(e => {
    let node = e;
    if (clearTags) {
      if (e.tagName === "BR") {
        node = window.document.createTextNode("\n");
      } else if (e.tagName === "DIV") {
        let countOfN = "";
        if (e.children.length) {
          for (const child of e.children) {
            if (child.tagName === "BR") {
              countOfN += "\n";
            }
          }
        } else {
          countOfN = `\n${e.innerText}`
        }
        node = window.document.createTextNode(countOfN);
      }
    }
    newText.appendChild(node)
  });
  return sanitizeHTML(newText.innerHTML.trim(), sanitizeRule(clearTags)).trim();
}

function isEmptyTag(text) {
  if (text.indexOf("img") >= 0) {
    return false;
  }
  const elem = window.document.createElement("div");
  elem.innerHTML = text;
  return !(elem.innerText && elem.innerText.trim());
}

export function getCursorMentionMatch(messageText, inputNode, isSetMode, replaceText) {
  if (!messageText) {
    return false;
  }
  const cursorPosition = inputNode.getCaretPosition();
  const sliceMessage = messageText.slice(0, cursorPosition);

  function isBeforeAtSignValid(currentPosition) {
    let beforeAtSignChar = sliceMessage[currentPosition - 1];
    if (!beforeAtSignChar || beforeAtSignChar === " " || beforeAtSignChar === "\n") {
      return true;
    }
  }

  if (!isSetMode) {
    if (isBeforeAtSignValid(sliceMessage.length - 1) && sliceMessage[sliceMessage.length - 1] === "@") {
      return true;
    }
  }
  const mentionMatches = sliceMessage.match(/@[0-9a-z\u0600-\u06FF](\.?[0-9a-z\u0600-\u06FF])*/gm);
  if (!isSetMode) {
    if (!mentionMatches) {
      return false;
    }
  }
  const lastMentionIndex = sliceMessage.lastIndexOf("@");
  if (isSetMode) {
    let modifiedReplaceText = `@${replaceText}`;
    if (!messageText[cursorPosition + 1] || messageText[cursorPosition] !== " ") {
      modifiedReplaceText += " ";
    }
    return `${sliceMessage.substr(0, lastMentionIndex)}${modifiedReplaceText}${messageText.substr(cursorPosition)}`;
  }
  const lastMentionedSliceMessage = sliceMessage.slice(lastMentionIndex, sliceMessage.length);
  const matches = lastMentionedSliceMessage.match(/\s+/g);
  if (matches) {
    return false;
  }
  if (!isBeforeAtSignValid(lastMentionIndex)) {
    return false;
  }
  return mentionMatches[mentionMatches.length - 1].replace("@", "");
}

export default class MainFooterInput extends Component {

  constructor(props) {
    super(props);
    this.onTextChange = this.onTextChange.bind(this);
    this.setInputText = this.setInputText.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.typingTimeOut = null;
    this.typingSet = false;
    this.inputNode = React.createRef();
    this.lastTypingText = null;
  }

  setInputText(text, append) {
    const {onNonEmptyText, onEmptyText, onText, value, inputNode} = this.props;
    let newText = text;
    if (append) {
      if (value) {
        const caretPosition = inputNode.current.getLastCaretPosition();
        const div = document.createElement("div");
        div.innerHTML = value;
        newText = div.innerHTML.slice(0, caretPosition) + newText + div.innerHTML.slice(caretPosition);
      }
    }
    onText && onText(newText);
    if (newText) {
      if (newText.trim()) {
        if (clearHtml(newText) && !isEmptyTag(newText)) {
          return onNonEmptyText && onNonEmptyText(newText);
        }
      }
    }
    onEmptyText && onEmptyText()
  }

  focus() {
    const current = this.props.inputNode.current;
    if (current) {
      current.focus();
    }
  }

  onTextChange(event, isOnBlur) {
    const {onStartTyping} = this.props;
    if (!isOnBlur) {
      if (onStartTyping) {
        clearTimeout(this.typingTimeOut);
        if (!this.typingSet) {
          this.typingSet = true;
          onStartTyping(true);
        }
        this.typingTimeOut = setTimeout(e => {
          this.typingSet = false;
          onStartTyping();
        }, 1500);
      }
      this.showParticipant(event);
      this.setInputText(event);
    }
  }

  showParticipant(messageText) {
    const {onShowParticipant, showParticipant, inputNode} = this.props;
    const lastMentionedMan = getCursorMentionMatch(messageText, inputNode.current);
    if (!lastMentionedMan) {
      if (showParticipant) {
        return onShowParticipant && onShowParticipant(false);
      }
      return;
    }
    onShowParticipant && onShowParticipant(true, lastMentionedMan === true ? null : lastMentionedMan);
  }

  onKeyPress(evt) {
    const {onStartTyping, onKeyPress} = this.props;
    if (!mobileCheck()) {
      if (evt.which === 13 && !evt.shiftKey) {
        onStartTyping();
        evt.preventDefault();
        onKeyPress(evt)
      }
    }
  }

  onKeyDown(evt) {
    const {onKeyDown, sendByEnter} = this.props;
    onKeyDown && onKeyDown(evt);
    if(!sendByEnter) {
      if (event.key === "Enter") {
        document.execCommand("insertLineBreak");
        event.preventDefault()
      }
    }
    onKeyDown(evt);
  }

  onKeyUp(evt) {

    this.onTextChange(evt.target.innerHTML);
  }

  onPaste(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  onFocus(e) {
    const {onFocus} = this.props;
    onFocus && onFocus(e);
  }

  render() {
    const {inputNode, containerClassName, editBoxClassName, inputContainerClassName, inputClassName, value, placeholder, onEmojiShowing, emojiShowing, chatAudioRecorder, voiceRecorderEnable} = this.props;

    const containerClassNames = classnames({
      [containerClassName]: true
    });
    const editBoxClassNames = classnames({
      [editBoxClassName]: true
    });
    const inputContainerClassNames = classnames({
      [inputContainerClassName]: true
    });
    const inputClassNames = classnames({
      [inputClassName]: true
    });

    return (
      <Container relative className={containerClassNames}>
        <Container className={editBoxClassNames}>
          <InputTextArea
            ref={inputNode}
            className={inputContainerClassNames}
            inputClassName={inputClassNames}
            sanitizeRule={sanitizeRule()}
            placeholder={placeholder}
            onFocus={this.onFocus}
            onChange={this.onTextChange}
            onKeyPress={this.onKeyPress}
            onKeyDown={this.onKeyDown}
            onKeyUp={this.onKeyUp}
            value={value}/>
        </Container>
        <Container centerLeft>
          <InputEmojiTrigger inputNode={this.inputNode} emojiShowing={emojiShowing} onEmojiShowing={onEmojiShowing}/>
          {voiceRecorderEnable &&
          <InputVoice inputNode={this.inputNode} chatAudioRecorder={chatAudioRecorder}/>
          }

        </Container>
      </Container>
    );
  }
}