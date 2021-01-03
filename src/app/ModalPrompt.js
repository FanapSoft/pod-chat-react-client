import React, {Component} from "react";
import {connect} from "react-redux";

//strings
import strings from "../constants/localization";

//actions
import {chatModalPrompt} from "../actions/chatActions";

//UI components
import Modal, {ModalBody, ModalFooter} from "../../../pod-chat-ui-kit/src/modal";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Container from "../../../pod-chat-ui-kit/src/container";

//styling

@connect(store => {
  return {
    chatModalPrompt: store.chatModalPrompt
  };
}, null, null, {forwardRef: true})
export default class ModalPrompt extends Component {

  constructor(props) {
    super(props);
  }

  onClose() {
    const {dispatch, onCancel} = this.props;
    dispatch(chatModalPrompt());
    if (onCancel) {
      onCancel();
    }
  }

  render() {
    const {isShowing, smallVersion, message, extraMessage, onApply, confirmText, customBody, NoConfirmButton} = this.props.chatModalPrompt;
    return (
      <Modal isOpen={isShowing} onClose={this.onClose.bind(this)} inContainer={smallVersion} fullScreen={smallVersion}
             userSelect="none" wrapContent>

        <ModalBody>
          {!customBody &&
          <Container centerTextAlign>
            <Text bold
                  size="lg">
              {message}
            </Text>
          </Container>
          }
          {!customBody && extraMessage && extraMessage}
          {customBody && customBody}
        </ModalBody>
        {!customBody &&
          <ModalFooter>
            <Button text onClick={onApply}>{confirmText || strings.remove}</Button>
            <Button text onClick={this.onClose.bind(this)}>{strings.cancel}</Button>
          </ModalFooter>
        }

      </Modal>
    )
  }
}
