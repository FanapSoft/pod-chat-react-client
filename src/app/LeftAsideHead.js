// src/
import React, {Component} from "react";
import {connect} from "react-redux";
import classnames from "classnames";

//strings
import strings from "../constants/localization";
import {THREAD_LEFT_ASIDE_SEARCH} from "../constants/actionTypes";

//actions
import {threadLeftAsideShowing} from "../actions/threadActions";

//UI components
import {MdClose} from "react-icons/md";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Container from "../../../pod-chat-ui-kit/src/container";

//styling
import style from "../../styles/app/LeftAsideHead.scss";
import styleVar from "../../styles/variables.scss";
import utilsStlye from "../../styles/utils/utils.scss";


const statics = {
  headMenuSize: 59
};

@connect(store => {
  return {
    smallVersion: store.chatSmallVersion,
    leftAsideShowingType: store.threadLeftAsideShowing.type,
  }
})
export default class LeftAsideHead extends Component {

  constructor(props) {
    super(props);
    this.onLeftAsideHide = this.onLeftAsideHide.bind(this);
  }

  onLeftAsideHide() {
    this.props.dispatch(threadLeftAsideShowing(false));
  }

  render() {
    const {smallVersion, leftAsideShowingType} = this.props;
    const iconSize = styleVar.iconSizeMd.replace("px", "");
    const iconMargin = `${(statics.headMenuSize - iconSize) / 2}px`;
    const classNames = classnames({
      [style.LeftAsideHead]: true,
      [style["LeftAsideHead--smallVersion"]]: smallVersion
    });
    return (
      <Container className={classNames} ref={this.container} userSelect="none">
        <Container inline onClick={this.onLeftAsideHide}>
          <MdClose size={iconSize}
                   className={utilsStlye["u-clickable"]}
                   onClick={this.onLeftAsideHide}
                   style={{color: styleVar.colorWhite, margin: iconMargin}}/>
        </Container>
        <Container inline>
          <Text invert>{leftAsideShowingType === THREAD_LEFT_ASIDE_SEARCH ?  strings.searchMessages : strings.messageSeenList}</Text>
        </Container>
      </Container>
    )
  }
}
