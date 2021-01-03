import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";

//strings
import strings from "../constants/localization";

//actions
import {threadFilesToUpload, threadModalImageCaptionShowing} from "../actions/threadActions";
import {messageSend} from "../actions/messageActions";

//UI components
import Modal, {ModalBody, ModalHeader, ModalFooter} from "../../../pod-chat-ui-kit/src/modal";
import ParticipantSuggestion from "./_component/ParticipantSuggestion";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import {Heading} from "../../../pod-chat-ui-kit/src/typography";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Container from "../../../pod-chat-ui-kit/src/container";
import Image from "../../../pod-chat-ui-kit/src/image";
import Paper from "../../../pod-chat-ui-kit/src/paper";
import {
  MdInsertDriveFile
} from "react-icons/md";

//styling
import style from "../../styles/app/ModalImageCaption.scss";
import {codeEmoji} from "./_component/EmojiIcons.js";
import {clearHtml} from "./_component/Input";
import {humanFileSize, mobileCheck} from "../utils/helpers";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";
import styleVar from "../../styles/variables.scss";
import Input, {getCursorMentionMatch} from "./_component/Input";
import EmojiIcons from "./_component/EmojiIcons";

@connect(store => {
  return {
    isShow: store.threadModalImageCaptionShowing.isShowing,
    user: store.user.user,
    inputNode: store.threadModalImageCaptionShowing.inputNode,
    files: store.threadImagesToCaption || [],
    thread: store.thread.thread
  };
}, null, null, {forwardRef: true})
export default class ModalImageCaption extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showParticipant: false,
      emojiShowing: false,
      filterString: null,
      comment: ""
    };
    this.setInputText = this.setInputText.bind(this);
    this.focusInputNode = this.focusInputNode.bind(this);
    this.onText = this.onText.bind(this);
    this.onInputFocus = this.onInputFocus.bind(this);
    this.onInputKeyDown = this.onInputKeyDown.bind(this);
    this.onShowParticipant = this.onShowParticipant.bind(this);
    this.onParticipantSelect = this.onParticipantSelect.bind(this);
    this.onEmojiShowing = this.onEmojiShowing.bind(this);
    this.onSend = this.onSend.bind(this);
    this.onClose = this.onClose.bind(this);
    this.participantSuggestionsRef = React.createRef();
    this.inputClassNode = React.createRef();
    this.inputNode = React.createRef();
  }

  setInputText() {
    this.inputClassNode.current && this.inputClassNode.current.setInputText.apply(null, arguments);
  }

  focusInputNode() {
    this.inputClassNode.current && this.inputClassNode.current.focus();
  }

  onParticipantSelect(contact) {
    const {comment} = this.state;
    if (!contact) {
      return;
    }
    const newMessageText = getCursorMentionMatch(comment, this.inputNode.current, true, contact.username);
    this.setInputText(newMessageText);
    setTimeout(() => this.focus(), 100);
    this.resetParticipantSuggestion();
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

  onInputFocus(e) {
    const {emojiShowing, dispatch} = this.props;
    if (mobileCheck()) {
      if (emojiShowing) {
        this.setState({
          emojiShowing: false
        })
      }
    }
  }

  onText(newText) {
    this.setState({
      comment: newText
    });
  }

  resetParticipantSuggestion() {
    this.setState({
      showParticipant: false,
      filterString: null
    });
  }

  onInputKeyDown(evt) {
    if (this.props.thread.group) {
      const {showParticipant} = this.state;
      const {keyCode} = evt;
      if (evt.keyCode === 13 && evt.shiftKey) {
        return;
      } else if (keyCode === 27) {
        if (!showParticipant) {
          return;
        }
      }
      if (showParticipant) {
        if (keyCode === 27) {
          this.resetParticipantSuggestion();
        }
        this.participantSuggestionsRef.current.keyDownSignal(evt);
      }
    }
  }

  onEmojiShowing(emojiShowing) {
    this.setState({
      emojiShowing
    });
  }

  onSend(imagesArray) {
    const {thread, dispatch, inputNode} = this.props;
    const {comment} = this.state;
    const isBiggerThanOne = imagesArray.length > 1;
    const clearMessageText = codeEmoji(clearHtml(comment, true));
    let isEmptyMessage = false;
    if (!clearMessageText) {
      isEmptyMessage = true;
    }
    if (!isEmptyMessage) {
      if (!clearMessageText.trim()) {
        isEmptyMessage = true;
      }
    }
    if (isBiggerThanOne) {
      if (!isEmptyMessage) {
        dispatch(messageSend(clearMessageText, thread.id));
      }
    }
    dispatch(threadFilesToUpload(imagesArray, true, inputNode, !isBiggerThanOne && !isEmptyMessage ? clearMessageText : null));
    this.onClose();
  }

  onClose() {
    this.setState({
      showParticipant: false,
      emojiShowing: false,
      filterString: null,
      comment: ""
    });
    this.props.dispatch(threadModalImageCaptionShowing(false));
  }

  render() {
    const {files, isShow, smallVersion, user, thread} = this.props;
    const {comment, filterString, showParticipant, emojiShowing} = this.state;
    const editBoxClassNames = classnames({
      [style.ModalImageCaption__EditBox]: true
    });
    const participantsPositionContainerClassNames =
      classnames({
        [style.ModalImageCaption__ParticipantPositionContainer]: true,
        [style["ModalImageCaption__ParticipantPositionContainer--mobile"]]: mobileCheck()
      });
    let isAllImage = true;
    let isMultiple = false;

    if (files) {
      isMultiple = files.length > 1;
      for (let file of files) {
        if (!~file.type.indexOf("image")) {
          isAllImage = false;
          break;
        }
      }
    } else {
      isAllImage = false;
    }
    const fileArray = files && Array.from(files);
    const checkForModalBody = !isMultiple || (isMultiple && isAllImage);
    return (

      <Modal isOpen={isShow} onClose={this.onClose.bind(this)} inContainer={smallVersion} fullScreen={smallVersion}
             userSelect="none">

        <ModalHeader>
          <Heading h3>{strings.sendFiles(fileArray.length, isAllImage)}</Heading>
        </ModalHeader>
        {checkForModalBody &&
        <ModalBody>
          {isAllImage ?
            <List>
              {fileArray.map(el => (
                <ListItem key={el.id || (el.name + el.size)} invert multiple>
                  <Container centerTextAlign>

                    <Image className={style.ModalImageCaption__Image} src={URL.createObjectURL(el)}/>

                  </Container>
                </ListItem>
              ))}
            </List>
            : !isMultiple ?
              <Container>
                <Paper hasShadow style={{borderRadius: "5px", backgroundColor: "#effdde"}}>
                  <Container display="flex" alignItems="center">
                    <Container flex="1 1 0">
                      <Text wordWrap="breakWord" bold>
                        {fileArray[0].name}
                      </Text>
                      <Text size="xs" color="gray" dark>
                        {humanFileSize(fileArray[0].size, true)}
                      </Text>
                    </Container>
                    <Container flex="none">
                      <Shape color="accent" size="lg">
                        <ShapeCircle>
                          <MdInsertDriveFile size={styleVar.iconSizeSm}/>
                        </ShapeCircle>
                      </Shape>
                    </Container>
                  </Container>
                </Paper>

              </Container> : ""
          }
        </ModalBody>
        }
        <ModalFooter>
          {
            isMultiple && !isAllImage &&
            <Container>

              <Text bold>
                {strings.fileSelected(files.length)}
              </Text>

            </Container>
          }
          {showParticipant &&

          <Container className={style.ModalImageCaption__ParticipantContainer}>
            <Container className={participantsPositionContainerClassNames}>
              <ParticipantSuggestion filterString={filterString} onSelect={this.onParticipantSelect} user={user}
                                     ref={this.participantSuggestionsRef}
                                     thread={thread}/>
            </Container>
          </Container>

          }

          <Input
            ref={this.inputClassNode}
            inputNode={this.inputNode}
            containerClassName={editBoxClassNames}
            editBoxClassName={style.ModalImageCaption__EditBoxInputContainer}
            inputContainerClassName={style.ModalImageCaption__InputContainer}
            inputClassName={style.ModalImageCaption__Input}
            showParticipant={showParticipant}
            onShowParticipant={this.onShowParticipant}
            placeholder={`${strings.comment}...`}
            emojiShowing={emojiShowing}
            onText={this.onText}
            onEmojiShowing={this.onEmojiShowing}
            onFocus={this.onInputFocus}
            onKeyDown={this.onInputKeyDown}
            value={comment}/>

          {emojiShowing &&
          <Container className={style.ModalImageCaption__EmojiIconsContainer}>
            <EmojiIcons setInputText={this.setInputText} focusInputNode={this.focusInputNode}/>
          </Container>
          }
          <Button text onClick={this.onSend.bind(this, fileArray)}>{strings.send}</Button>
          <Button text onClick={this.onClose}>{strings.cancel}</Button>

        </ModalFooter>

      </Modal>
    )
  }
}
