import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {avatarNameGenerator, avatarUrlGenerator} from "../utils/helpers";

//strings
import strings from "../constants/localization";

//actions
import {
  threadMetaUpdate
} from "../actions/threadActions";
import {chatUploadImage} from "../actions/chatActions";

//UI components
import Avatar, {AvatarImage, AvatarName} from "../../../uikit/src/avatar";
import Container from "../../../uikit/src/container";
import {InputText} from "../../../uikit/src/input";

//styling
import {MdArrowBack, MdBlock, MdCameraAlt, MdVerifiedUser} from "react-icons/md";
import styleVar from "../../styles/variables.scss";
import style from "../../styles/app/ModalThreadInfoGroupSettings.scss";
import List, {ListItem} from "../../../uikit/src/list";
import Gap from "../../../uikit/src/gap";
import {Text} from "../../../uikit/src/typography";
import {ContactList} from "./_component/contactList";
import ModalThreadInfoGroupSettingsAdminList from "./ModalThreadInfoGroupSettingsAdminList";
import {ContactSearchFragment} from "./ModalContactList";
import {Button} from "../../../uikit/src/button";
import ModalFooter from "../../../uikit/src/modal/ModalFooter";
import {isChannel} from "./Main";
import checkForPrivilege, {isOwner} from "../utils/privilege";
import {THREAD_ADMIN} from "../constants/privilege";

const statics = {
  ADMIN_MANAGE: "ADMIN_MANGE",
  MAIN: "MAIN"
};

@connect(null, null, null, {withRef: true})
export default class ModalThreadInfoGroupSettings extends Component {

  constructor(props) {
    super(props);
    this.onGroupImageChange = this.onGroupImageChange.bind(this);
    this.onSelectAdminList = this.onSelectAdminList.bind(this);
    this.groupNameChange = this.groupNameChange.bind(this);
    this.onSaveSettings = this.onSaveSettings.bind(this);
    this.onPrevious = this.onPrevious.bind(this);
    this.state = {
      state: statics.MAIN,
      groupName: ""
    };
  }

  componentDidMount() {
    const {thread, setHeaderFooterComponent, onClose} = this.props;
    const isChannel = thread.type === 8;
    const FooterComponent = () => {
      return (
        <Fragment>
          <Button text onClick={this.onSaveSettings}>
            {strings.saveSettings}
          </Button>
          <Button text onClick={onClose}>{strings.close}</Button>
          <Button text onClick={this.onPrevious}>
            <MdArrowBack/>
          </Button>
        </Fragment>
      )
    };
    const HeaderComponent = () => {
      return strings.groupSettings(isChannel);
    };

    setHeaderFooterComponent(HeaderComponent, FooterComponent);
    this.setState({
      groupName: thread.title,
      groupDesc: thread.description,
      image: thread.image
    });
  }

  onPrevious() {
    const {setStep, steps} = this.props;
    setStep(steps.ON_GROUP_INFO);
  }

  onGroupImageChange(evt) {
    this.props.dispatch(chatUploadImage(evt.target.files[0], this.props.thread.id, image =>
      this.setState({
        image
      })
    ));
  }

  groupNameChange(event) {
    this.setState({
      groupName: event.target.value
    });
  }

  groupDescChange(event) {
    this.setState({
      groupDesc: event.target.value
    });
  }

  onSaveSettings() {
    const {groupDesc, image, groupName} = this.state;
    const {setStep, steps, thread, dispatch,} = this.props;
    const baseObject = {
      description: groupDesc, image, title: groupName
    };
    if (image) {
      baseObject.image = image;
    }
    dispatch(threadMetaUpdate(baseObject, thread.id));
    setStep(steps.ON_GROUP_INFO);
  }

  onSelectAdminList() {
    const {setStep, steps} = this.props;
    setStep(steps.ON_ADMIN_LIST);
  }

  render() {
    const {groupName, groupDesc, image} = this.state;
    const {thread, GapFragment, user} = this.props;
    return (
      <Container>
        <Container relative>

          <Container>
            <Avatar>
              <Container relative inline
                         className={style.ModalThreadInfoGroupSettings__ImageContainer}>
                <Container className={style.ModalThreadInfoGroupSettings__ImageOverlay}>
                  <input className={style.ModalThreadInfoGroupSettings__FileInput} type="file"
                         onChange={this.onGroupImageChange}
                         accept="image/*"/>
                  <Container center>
                    <MdCameraAlt size={styleVar.iconSizeLg} color={styleVar.colorWhite}
                                 className={style.ModalThreadInfoGroupSettings__ImageIcon}/>
                  </Container>
                </Container>
                <AvatarImage src={avatarUrlGenerator(image, avatarUrlGenerator.SIZES.MEDIUM)} size="xlg"
                             text={avatarNameGenerator(thread.title).letter}
                             textBg={avatarNameGenerator(thread.title).color}/>
              </Container>
              <AvatarName>
                <InputText onChange={this.groupNameChange.bind(this)}
                           max={40}
                           value={groupName}
                           placeholder={strings.groupName(isChannel(thread))}/>
              </AvatarName>
            </Avatar>
          </Container>
          <InputText onChange={this.groupDescChange.bind(this)}
                     value={groupDesc}
                     placeholder={strings.groupDescription(isChannel(thread))}/>
        </Container>


        {
          checkForPrivilege(thread, THREAD_ADMIN) &&
          <Fragment>
            <GapFragment/>
            <List>
              <ListItem selection invert onSelect={this.onSelectAdminList}>
                <Container relative display="inline-flex">
                  <MdVerifiedUser size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                  <Gap x={20}>
                    <Text>{strings.admins}</Text>
                  </Gap>
                </Container>
              </ListItem>
            </List>
          </Fragment>
        }

      </Container>
    )
  }
}
