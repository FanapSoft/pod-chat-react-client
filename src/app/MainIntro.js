// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";

//strings
import {
  ROUTE_ADD_CONTACT,
  ROUTE_CONTACTS,
} from "../constants/routes";
import strings from "../constants/localization";

//actions
import {contactAdding, contactListShowing} from "../actions/contactActions";

//components
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import Container from "../../../pod-chat-ui-kit/src/container";
import {MdChat} from "react-icons/md";

//styling
import styleVar from "../../styles/variables.scss";

@connect()
export default class MainIntro extends Component {

  constructor(props) {
    super(props);
    this.onContactListShow = this.onContactListShow.bind(this);
    this.onAddMember = this.onAddMember.bind(this);
  }

  onContactListShow() {
    const {history, chatRouterLess, dispatch} = this.props;
    dispatch(contactListShowing(true));
    if (!chatRouterLess) {
      history.push(ROUTE_CONTACTS);
    }
  }

  onAddMember() {
    const {history, chatRouterLess, dispatch} = this.props;
    dispatch(contactAdding(true));
    if (!chatRouterLess) {
      history.push(ROUTE_ADD_CONTACT);
    }
  }

  render() {
    return (
      <Container center centerTextAlign>
        <Text size="lg">{strings.pleaseStartAThreadFirst}</Text>
        <Gap y={10} block/>
        <MdChat size={48} style={{color: styleVar.colorAccent}}/>
        <Container>
          <Button outlined onClick={this.onAddMember}>{strings.addContact}</Button>
          <Button outlined onClick={this.onContactListShow}>{strings.contactList}</Button>
        </Container>
      </Container>
    );
  }
}