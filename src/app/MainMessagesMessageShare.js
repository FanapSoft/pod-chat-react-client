// src/list/BoxSceneMessages
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import "moment/locale/fa";
import {
  getMessageMetaData,
  isMessageIsFile
} from "../utils/helpers";

import {showBlock} from "./MainFooterSpam";
import MainMessagesMessageFile from "./MainMessagesMessageFile";
import MainMessagesMessageText from "./MainMessagesMessageText";
import {MessageDeletePrompt, PinMessagePrompt} from "./_component/prompts";
import checkForPrivilege from "../utils/privilege";

//strings
import strings from "../constants/localization";

//actions
import {chatModalPrompt} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import {
  FaWhatsapp,
  FaTelegram,
  FaSkype
} from "react-icons/fa";
import {
  FiTwitter
} from "react-icons/fi";

import {Button} from "../../../pod-chat-ui-kit/src/button";
import ListItem from "../../../pod-chat-ui-kit/src/list/ListItem";
import List from "../../../pod-chat-ui-kit/src/list";
import style from "../../styles/app/MainMessagesMessageShare.scss";
import styleVar from "../../styles/variables.scss";
import Text from "../../../pod-chat-ui-kit/src/typography/Text";
import Gap from "../../../pod-chat-ui-kit/src/gap";


//styling
const iconsProperties = {
  size: styleVar.iconSizeMd,
  color: styleVar.colorAccentDark
};

const socialNetworks = {
  telegram: {
    link: (link, text) => `https://t.me/share/url?url=${link}${text ? `&text=${text}` : ""}`,
    icon: <FaTelegram {...iconsProperties}/>
  },
  whatsapp: {
    link: text => `https://api.whatsapp.com/send?text=${text}`,
    icon: <FaWhatsapp {...iconsProperties}/>
  },
  twitter: {
    link: text => `https://twitter.com/intent/tweet?text=${text}`,
    icon: <FiTwitter {...iconsProperties}/>

  },
  skype: {
    link: text => `https://web.skype.com/share?text=${text}`,
    icon: <FaSkype {...iconsProperties}/>
  }
};

@connect()
export default class MainMessagesMessageShare extends Component {

  constructor(props) {
    super(props);
    this.onConfirm = this.onConfirm.bind(this);
    this.onClose = this.onClose.bind(this);
    this.state = {
      selectedSocialNetwork: null
    }
  }

  onSocialIconSelect(socialNetworksObject, name) {
    this.setState({
      selectedSocialNetwork: {socialNetworksObject, name}
    });
  }

  onConfirm() {
    const {selectedSocialNetwork} = this.state;
    const {message, dispatch} = this.props;
    let messageText = message.message;
    const isMessageFile = isMessageIsFile(message);
    if (isMessageFile) {
      const metaData = message.metadata;
      try {
        messageText = `${getMessageMetaData(message).file.link}`;
      } catch (e) {

      }

    }
    window.open(selectedSocialNetwork.socialNetworksObject.link(messageText, isMessageFile && message.message), '_blank');
    dispatch(chatModalPrompt());
  }

  onClose() {
    this.props.dispatch(chatModalPrompt());
  }

  render() {
    const {selectedSocialNetwork} = this.state;
    let name;
    if (selectedSocialNetwork) {
      name = selectedSocialNetwork.name;
    }
    return (
      <Fragment>
        <List>
          {
            Object.keys(socialNetworks).map(key => (
              <ListItem selection invert activeWithTick active={name === key}
                        onSelect={this.onSocialIconSelect.bind(this, socialNetworks[key], key)}>
                <Container className={style.MainMessagesMessageShare__IconContainer}>
                  {socialNetworks[key].icon}
                  <Gap x={5}/>
                  <Text color="accent" dark bold size="xs">{strings.socialNetworks[key]}</Text>
                </Container>

              </ListItem>
            ))
          }
        </List>
        {
          name && <Button text onClick={this.onConfirm}>{strings.share}</Button>
        }
        <Button text onClick={this.onClose}>{strings.canceledIDontWant}</Button>

      </Fragment>
    )
  }
}