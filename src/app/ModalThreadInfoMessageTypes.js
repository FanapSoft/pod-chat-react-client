import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {types} from "../constants/messageTypes";

//actions
import {
  threadGoToMessageId,
  threadMessageGetListByTypes, threadModalThreadInfoShowing,
} from "../actions/threadActions";

//UI components
import Container from "../../../pod-chat-ui-kit/src/container";

//UI components

//styling
import style from "../../styles/app/ModalThreadInfoMessageTypes.scss";
import Text from "../../../pod-chat-ui-kit/src/typography/Text";
import strings from "../constants/localization";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import Image from "../../../pod-chat-ui-kit/src/image";
import Shape, {ShapeCircle} from "../../../pod-chat-ui-kit/src/shape";
import styleVar from "../../styles/variables.scss";
import {
  MdArrowDownward,
  MdPlayArrow,
  MdClose
} from "react-icons/md";
import {IndexModalMediaFragment} from "./index";
import {
  getFileDownloadingFromHashMap,
  getFileFromHashMap,
  getImageFromHashMapWindow, getMessageMetaData,
  humanFileSize, mobileCheck
} from "../utils/helpers";

@connect()
export default class ModalThreadInfoMessageTypes extends Component {

  constructor(props) {
    super(props);
    const keys = Object.keys(types);
    const {selectedTab} = props;
    if (keys.indexOf(selectedTab) > -1) {
      this.initRequest(selectedTab, true);
    }
    this.onEndReached = this.onEndReached.bind(this);
    const {setOnEndReached, setEndReachCondition} = props;
    setOnEndReached(this.onEndReached);
    setEndReachCondition(false);
    this.state = {
      loading: true,
      messages: [],
      hasNext: true
    }
  }

  initRequest(tab, isJustConstructed) {
    const {selectedTab, thread, dispatch, setEndReachCondition, onTabSelect, defaultTab, setMessageTypesData} = this.props;
    const initRequestTime = this.initRequestTime = Date.now();
    const keys = Object.keys(types);
    if (keys.indexOf(tab) === -1) {
      return onTabSelect(tab);
    }
    if (isJustConstructed !== true) {
      if (selectedTab === tab) {
        return;
      }
      if (onTabSelect) {
        onTabSelect(tab);
      }
      setEndReachCondition(false);
      const state = {
        partialLoading: false,
        loading: true,
        hasNext: false,
        nextOffset: 0,
        messages: []
      };
      setMessageTypesData(state);
      this.setState(state);
    }
    if (defaultTab === tab) {
      return
    }
    dispatch(threadMessageGetListByTypes(thread.id, types[tab], 25, 0)).then(result => {
      if (this.initRequestTime && initRequestTime < this.initRequestTime) {
        return;
      }
      setEndReachCondition(result.hasPrevious);
      this.setState({
        loading: false,
        messages: result.messages,
        nextOffset: result.nextOffset,
        hasNext: result.hasPrevious
      });
      const state = {
        loading: false,
        messages: result.messages,
        nextOffset: result.nextOffset,
        hasNext: result.hasPrevious
      };
      setMessageTypesData(state);
      if (isJustConstructed !== true) {
        document.getElementById("message-types-tab").scrollIntoView();
      }
    });
  }

  onEndReached() {
    const {messages, nextOffset, hasNext, partialLoading} = this.state;
    const {selectedTab, thread, setEndReachCondition, setMessageTypesData, dispatch} = this.props;
    const keys = Object.keys(types);
    if (keys.indexOf(selectedTab) === -1) {
      return;
    }
    if (!hasNext) {
      return;
    }
    if (partialLoading) {
      return;
    }
    const state = {
      partialLoading: true
    };
    setMessageTypesData(state);
    this.setState(state);
    dispatch(threadMessageGetListByTypes(thread.id, types[selectedTab], 25, nextOffset)).then(result => {
      setEndReachCondition(result.hasPrevious);
      const state = {
        partialLoading: false,
        messages: messages.concat(result.messages),
        nextOffset: result.nextOffset,
        hasNext: result.hasPrevious
      };
      setMessageTypesData(state);
      this.setState(state);
    });
  }

  render() {
    const {selectedTab, extraTabs} = this.props;
    let tabs = Object.keys(types);
    if (extraTabs) {
      tabs = extraTabs.concat(tabs);
    }
    const tabItemClassNames = activeTabItem => classnames({
      [style["ModalThreadInfoMessageTypes__TabItem"]]: true,
      [style["ModalThreadInfoMessageTypes__TabItem--mobileVersion"]]: mobileCheck(),
      [style["ModalThreadInfoMessageTypes__TabItem--active"]]: activeTabItem === selectedTab,
    });

    return (
      <Container className={style.ModalThreadInfoMessageTypes}>
        <Container className={style.ModalThreadInfoMessageTypes__Tab} id="message-types-tab">
          {
            tabs.map(key => (
              <Container className={tabItemClassNames(key)} onClick={this.initRequest.bind(this, key)} key={key}>
                <Text>{strings.messageTypes[key]}</Text>
              </Container>
            ))
          }
        </Container>
      </Container>
    )
  }
}

