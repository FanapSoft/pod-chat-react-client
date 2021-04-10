// app/index.js
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {Route, withRouter} from "react-router-dom";
import {statics as contactListStatics} from "./ModalContactList";
import classnames from "classnames";
import checkForPrivilege from "./../utils/privilege";

//strings

//actions

//components
import Container from "../../../pod-chat-ui-kit/src/container";

//styling
import style from "../../styles/app/SupportModule.scss";
import SupportModuleBadge from "./SupportModuleBadge";


@connect(store => {
  return {
    chatSupportModuleBadgeShowing: store.chatSupportModuleBadgeShowing
  };
}, null, null, {forwardRef: true})
export default class SupportModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatShowing: false
    }
  }


  render() {
    const {children, chatSupportModuleBadgeShowing, supportMode} = this.props;
    if (!supportMode) {
      return children;
    }
    const classNames = classnames({
      [style.SupportModule]: true
    });
    return <Fragment>
      <Container style={chatSupportModuleBadgeShowing ? null : {display: "none"}}>
        <SupportModuleBadge chatSupportModuleBadgeShowing={chatSupportModuleBadgeShowing}/>
      </Container>

      <Container className={classNames}
                 style={{
                   opacity: chatSupportModuleBadgeShowing ? 0 : 1,
                   zIndex: chatSupportModuleBadgeShowing ? -99999999999 : 0
                 }}>
        {children && children}
      </Container>
    </Fragment>
  }

}
