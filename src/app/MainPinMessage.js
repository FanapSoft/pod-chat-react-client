import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import checkForPrivilege from "../utils/privilege";

//actions
import {threadMessageUnpin} from "../actions/threadActions";

//components
import Container from "../../../uikit/src/container";
import {Text} from "../../../uikit/src/typography";
import Loading, {LoadingBlinkDots} from "../../../uikit/src/loading";
import {
  AiFillPushpin
} from "react-icons/ai";

//styling
import {
  MdClose,
  MdVideocam
} from "react-icons/md";
import style from "../../styles/app/MainPinMessage.scss";
import styleVar from "../../styles/variables.scss";
import {decodeEmoji} from "./_component/EmojiIcons.js";
import {messageInfo} from "../actions/messageActions";
import {getMessageEditingText} from "./MainFooterInputEditing";
import strings from "../constants/localization";
import {THREAD_ADMIN} from "../constants/privilege";



@connect(store => {
  return {
    user: store.user.user
  };
})
export default class MainPinMessage extends Component {

  constructor(props) {
    super(props);
    this.onMessageClick = this.onMessageClick.bind(this);
    this.onUnpinClick = this.onUnpinClick.bind(this);
    this.state = {
      message: null,
      loading: false
    };
  }

  componentDidMount() {
    this.requestForMessage();
  }

  componentDidUpdate({messageVo: oldMessageVo}) {
    if (oldMessageVo.messageId !== this.props.messageVo.messageId) {
      this.requestForMessage();
    } else {
      if (oldMessageVo.text !== this.props.messageVo.text) {
        this.requestForMessage();
      }
    }
  }

  requestForMessage() {
    this.setState({
      message: null
    });
    const {messageVo, thread, dispatch} = this.props;
    this.setState({
      loading: true
    });
    dispatch(messageInfo(thread.id, messageVo.messageId)).then(message => {this.setState({message, loading: false})});
  }

  onMessageClick() {
    const {message} = this.state;
    if(!message) {
      return;
    }
    const {mainMessageRef} = this.props;
    const {current} = mainMessageRef;
    if (current) {
      current.getWrappedInstance().goToSpecificMessage(message.time);
    }
  }

  onUnpinClick(e) {
    e.stopPropagation();
    const {messageVo, dispatch} = this.props;
    dispatch(threadMessageUnpin(messageVo.messageId));
  }

  render() {
    const {user, thread} = this.props;
    const {message, loading} = this.state;
    const messageDeleted = !message;
    const messageDetails = message ? getMessageEditingText(message) : {};
    const messageDetailsClassNames = classnames({
      [style.MainPinMessage__MessageDetails]: true,
      [style["MainPinMessage__MessageDetails--loading"]]: loading
    });
    return <Container className={style.MainPinMessage} onClick={this.onMessageClick}>

      <Container className={style.MainPinMessage__Message}>
        <Container className={style.MainPinMessage__MessageIcon}>
          <AiFillPushpin size={styleVar.iconSizeSm} color={styleVar.colorAccent}/>
        </Container>

        <Container className={messageDetailsClassNames}>
          {
            loading ?
              <Loading hasSpace><LoadingBlinkDots size="sm"/></Loading>
              :
              <Fragment>
                {messageDetails.image &&
                <Container className={style.MainPinMessage__ImageContainer} inline>
                  <Container className={style.MainPinMessage__Image}
                             style={{backgroundImage: `url(${messageDetails.image})`}}/>
                </Container>
                }
                {
                  messageDetails.isVideo &&
                  <MdVideocam size={styleVar.iconSizeSm} color={styleVar.colorAccent}
                              style={{marginLeft: "5px", marginTop: "3px"}}/>
                }
                <Text isHTML color={messageDeleted ? "gray" : null} italic={messageDeleted} dark={messageDeleted}>
                  {messageDeleted ? strings.messageDeleted : decodeEmoji(message.message || messageDetails.text)}
                </Text>
              </Fragment>
          }

        </Container>
      </Container>
      {checkForPrivilege(thread, THREAD_ADMIN) && <Container className={style.MainPinMessage__CloseIcon} onClick={this.onUnpinClick}>
        <MdClose size={styleVar.iconSizeMd} color={styleVar.colorTextLight}/>
      </Container>}

    </Container>
  }
}