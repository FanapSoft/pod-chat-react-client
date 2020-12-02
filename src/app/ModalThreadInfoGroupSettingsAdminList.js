import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {avatarNameGenerator} from "../utils/helpers";

//strings
import strings from "../constants/localization";

//actions
import {
  threadAdminList, threadAdminRemove
} from "../actions/threadActions";
import {chatUploadImage} from "../actions/chatActions";

//UI components
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import Container from "../../../pod-chat-ui-kit/src/container";
import {InputText} from "../../../pod-chat-ui-kit/src/input";
import {PartialLoadingFragment} from "./ModalContactList";


//styling
import {MdArrowBack, MdBlock, MdCameraAlt, MdVerifiedUser} from "react-icons/md";
import styleVar from "../../styles/variables.scss";
import style from "../../styles/app/ModalThreadInfoGroupSettings.scss";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {ContactList} from "./_component/contactList";
import {ContactSearchFragment} from "./ModalContactList";
import {messageGetSeenList} from "../actions/messageActions";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import {Button} from "../../../pod-chat-ui-kit/src/button";


@connect(store => {
  return {
    threadAdminList: store.threadAdminList
  };
}, null, null, {forwardRef: true})
export default class ModalThreadInfoGroupSettingsAdminList extends Component {

  constructor(props) {
    super(props);
    this.onRemoveAdmin = this.onRemoveAdmin.bind(this);
    this.onAddAdminSelect = this.onAddAdminSelect.bind(this);
    this.onPrevious = this.onPrevious.bind(this);
    this.state = {
      adminRemoveList: []
    }
  }

  componentDidMount() {
    const {dispatch, thread, onClose, setHeaderFooterComponent} = this.props;
    const FooterComponent = () => {
      return (
        <Fragment>
          <Button text onClick={this.onAddAdminSelect}>
            {strings.addAdmin}
          </Button>
          <Button text onClick={onClose}>{strings.close}</Button>
          <Button text onClick={this.onPrevious}>
            <MdArrowBack/>
          </Button>
        </Fragment>
      )
    };
    const HeaderComponent = () => {
      return strings.adminList;
    };
    setHeaderFooterComponent(HeaderComponent, FooterComponent);
    dispatch(threadAdminList(thread.id));

  }

  onAddAdminSelect() {
    const {setStep, steps} = this.props;
    setStep(steps.ON_ADMIN_ADD);
  }

  onPrevious() {
    const {setStep, steps} = this.props;
    setStep(steps.ON_SETTINGS);
  }

  onRemoveAdmin(participant) {
    const {thread, dispatch} = this.props;
    this.setState({
      adminRemoveList: this.state.adminRemoveList.concat([participant.id])
    });
    dispatch(threadAdminRemove(participant.id, thread.id));
  }

  render() {
    const {threadAdminList, thread, user} = this.props;
    const {fetching, admins} = threadAdminList;
    if (fetching) {
      return (
        <Container relative>
          <Gap y={5}/>
          <PartialLoadingFragment/>
        </Container>
      )
    }
    const removeAdminFragment = ({contact: participant}) => {
      const {adminRemoveList} = this.state;
      if (user.id === participant.id) {
        return null;
      }
      if (adminRemoveList.includes(participant.id)) {
        return (
          <Container centerTextAlign>
            <Loading hasSpace><LoadingBlinkDots size="sm"/></Loading>
          </Container>
        )
      }
      return (
        <Container>
          <Button onClick={this.onRemoveAdmin.bind(this, participant)} text size="sm">
            {strings.remove}
          </Button>
        </Container>
      )
    };
    return (
      admins.length > 0 && <ContactList invert
                                        selection
                                        LeftActionFragment={removeAdminFragment}
                                        contacts={admins}/>
    )
  }
}
