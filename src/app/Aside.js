// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";

//strings

//actions

//components
import AsideHead from "./AsideHead";
import AsideSearch from "./AsideSearch";
import AsideThreads from "./AsideThreads";
import Container from "../../../pod-chat-ui-kit/src/container";

//styling
import style from "../../styles/app/Aside.scss";

@connect()
export default class Aside extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container className={style.Aside}>
        <AsideHead/>
        <AsideSearch/>
        <AsideThreads/>
      </Container>
    );
  }
}