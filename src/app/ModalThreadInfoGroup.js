import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {getName} from "./_component/contactList";
import ModalContactList, {statics as modalContactListStatics} from "./ModalContactList";

//strings
import strings from "../constants/localization";
import {avatarNameGenerator} from "../utils/helpers";

//actions
import {
  threadAddParticipant,
  threadCreateOnTheFly,
  threadLeave,
  threadModalThreadInfoShowing,
  threadNotification,
  threadParticipantList,
  threadRemoveParticipant
} from "../actions/threadActions";
import {chatModalPrompt} from "../actions/chatActions";

//UI components
import {ContactList} from "./_component/contactList";
import {ContactSearchFragment, PartialLoadingFragment} from "./ModalContactList";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import ModalThreadInfoGroupSettings from "./ModalThreadInfoGroupSettings";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Heading, Text} from "../../../pod-chat-ui-kit/src/typography";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import Container from "../../../pod-chat-ui-kit/src/container";
import Modal from "../../../pod-chat-ui-kit/src/modal";
import ModalHeader from "../../../pod-chat-ui-kit/src/modal/ModalHeader";
import ModalBody from "../../../pod-chat-ui-kit/src/modal/ModalBody";
import ModalFooter from "../../../pod-chat-ui-kit/src/modal/ModalFooter";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";

//styling
import {MdGroupAdd, MdArrowBack, MdSettings, MdBlock, MdNotifications, MdPersonAdd} from "react-icons/md";
import style from "../../styles/app/ModalThreadInfoGroupMain.scss";
import styleVar from "../../styles/variables.scss";
import utilsStyle from "../../styles/utils/utils.scss";
import ModalThreadInfoGroupMain from "./ModalThreadInfoGroupMain";
import ModalThreadInfoGroupSettingsAdminList from "./ModalThreadInfoGroupSettingsAdminList";
import ModalThreadInfoGroupSettingsAdminAdd from "./ModalThreadInfoGroupSettingsAdminAdd";


const constants = {
  steps: {
    ON_GROUP_INFO: "GROUP_INFO",
    ON_SETTINGS: "ON_SETTINGS",
    ON_ADMIN_LIST: "ON_ADMIN_LIST",
    ON_ADMIN_ADD: "ON_ADMIN_ADD",
  }
};

@connect(null, null, null, {forwardRef: true})
class ModalThreadInfoGroup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      step: constants.steps.ON_GROUP_INFO,
      HeaderComponent: () => "",
      FooterComponent: () => "",
    };
    this.setHeaderFooterComponent = this.setHeaderFooterComponent.bind(this);
    this.setScrollBottomThresholdCondition = this.setScrollBottomThresholdCondition.bind(this);
    this.setOnScrollBottomThreshold = this.setOnScrollBottomThreshold.bind(this);
    this.setFooterComponent = this.setFooterComponent.bind(this);
    this.setStep = this.setStep.bind(this);
  }

  onClose(dontGoBack) {
    this.props.onClose(dontGoBack);
  }

  setStep(step) {
    this.setState({
      step,
    })
  }

  setHeaderFooterComponent(HeaderComponent, FooterComponent) {
    this.setState({HeaderComponent, FooterComponent});
  }

  setScrollBottomThresholdCondition(scrollBottomThresholdCondition) {
    this.setState({scrollBottomThresholdCondition});
  }

  setOnScrollBottomThreshold(scrollBottomThreshold) {
    this.setState({scrollBottomThreshold});
  }

  setFooterComponent(FooterComponent) {
    this.setState({FooterComponent});
  }

  render() {
    const {thread, user, isShow, smallVersion, GapFragment, onClose, AvatarModalMediaFragment} = this.props;
    const {step, HeaderComponent, FooterComponent, scrollBottomThresholdCondition, scrollBottomThreshold} = this.state;
    const steps = constants.steps;
    const commonArguments = {
      onClose,
      user,
      GapFragment,
      thread,
      step,
      steps,
      setStep: this.setStep,
      setHeaderFooterComponent: this.setHeaderFooterComponent,
      setFooterComponent: this.setFooterComponent,
      setScrollBottomThresholdCondition: this.setScrollBottomThresholdCondition,
      setOnScrollBottomThreshold: this.setOnScrollBottomThreshold,
    };

    return (
      <Modal isOpen={isShow}
             onClose={onClose}
             inContainer={smallVersion}
             fullScreen={smallVersion}
             userSelect="none">

        <ModalHeader>
          <Heading h3><HeaderComponent/></Heading>
        </ModalHeader>

        <ModalBody threshold={5}
                   onScrollBottomThresholdCondition={scrollBottomThresholdCondition}
                   onScrollBottomThreshold={scrollBottomThreshold}>
          {step === steps.ON_GROUP_INFO ?
            <ModalThreadInfoGroupMain {...commonArguments} AvatarModalMediaFragment={AvatarModalMediaFragment}/>
            : step === steps.ON_SETTINGS ?
              <ModalThreadInfoGroupSettings  {...commonArguments}/>
              : step === steps.ON_ADMIN_ADD ?
                <ModalThreadInfoGroupSettingsAdminAdd  {...commonArguments}/>
                : <ModalThreadInfoGroupSettingsAdminList  {...commonArguments}/>
          }
        </ModalBody>

        <ModalFooter>
          <FooterComponent/>
        </ModalFooter>

      </Modal>
    );
  }
}

export default withRouter(ModalThreadInfoGroup);
