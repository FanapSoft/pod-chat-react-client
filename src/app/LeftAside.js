// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";

//strings

//actions

//components
import LeftAsideHead from "./LeftAsideHead";
import LeftAsideMain from "./LeftAsideMain";
import Container from "../../../pod-chat-ui-kit/src/container";

//styling
import style from "../../styles/app/LeftAside.scss";

@connect()
export default class Aside extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container className={style.LeftAside}>
        <LeftAsideHead/>
        <LeftAsideMain/>
      </Container>
    );
  }
}