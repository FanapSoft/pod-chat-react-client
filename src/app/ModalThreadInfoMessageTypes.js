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
import Container from "../../../uikit/src/container";

//UI components

//styling
import style from "../../styles/app/ModalThreadInfoMessageTypes.scss";
import Text from "../../../uikit/src/typography/Text";
import strings from "../constants/localization";
import Loading, {LoadingBlinkDots} from "../../../uikit/src/loading";
import Image from "../../../uikit/src/image";
import Shape, {ShapeCircle} from "../../../uikit/src/shape";
import styleVar from "../../styles/variables.scss";
import {
  MdArrowDownward,
  MdPlayArrow,
  MdClose
} from "react-icons/md";
import {BoxModalMediaFragment} from "./index";
import ReactDOMServer from "react-dom/server";
import {
  getFileDownloadingFromHashMap,
  getFileFromHashMap,
  getImageFromHashMapWindow,
  humanFileSize
} from "../utils/helpers";
import {getImage, isImage} from "./MainMessagesMessageFile";

@connect(store => {
  return {
    chatFileHashCodeMap: store.chatFileHashCodeUpdate.hashCodeMap
  };
})
export default class ModalThreadInfoMessageTypes extends Component {

  constructor(props) {
    super(props);
    if (!props.defaultTab) {
      this.initRequest("picture", true);
    }
    this.createButton();
    this.onScrollBottomThreshold = this.onScrollBottomThreshold.bind(this);
    const {setOnScrollBottomThreshold, setScrollBottomThresholdCondition} = props;
    setOnScrollBottomThreshold(this.onScrollBottomThreshold);
    setScrollBottomThresholdCondition(false);
    this.state = {
      activeTab: props.defaultTab || "picture",
      defaultTab: props.defaultTab,
      loading: true,
      messages: [],
      hasNext: true
    }
  }

  createButton() {
    window.modalMediaRef.getFancyBox().defaults.btnTpl.goto =
      `<button data-fancybox-fb class="fancybox-button fancybox-button--goto" title="${strings.gotoMessage}">
        <svg viewBox="0 0 28 28">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
      </button>`
  }

  initRequest(tab, isJustConstructed) {
    const {thread, dispatch, setScrollBottomThresholdCondition, onTabSelect, defaultTab} = this.props;
    const initRequestTime = this.initRequestTime = Date.now();
    if (isJustConstructed !== true) {
      if (this.state.activeTab === tab) {
        return;
      }
      if (onTabSelect) {
        onTabSelect(tab);
      }
      setScrollBottomThresholdCondition(false);
      this.setState({
        activeTab: tab,
        partialLoading: false,
        loading: true,
        hasNext: false,
        nextOffset: 0,
        thumb: null,
        blurryThumb: null,
        messages: []
      });
    }
    if (defaultTab === tab) {
      return
    }
    dispatch(threadMessageGetListByTypes(thread.id, types[tab], 25, 0)).then(result => {
      if (this.initRequestTime && initRequestTime < this.initRequestTime) {
        return;
      }
      setScrollBottomThresholdCondition(result.hasPrevious);
      this.setState({
        loading: false,
        messages: result.messages,
        nextOffset: result.nextOffset,
        hasNext: result.hasPrevious
      });
      if (isJustConstructed !== true) {
        document.getElementById("message-types-tab").scrollIntoView();
      }
    });
  }

  onScrollBottomThreshold() {
    const {activeTab, messages, nextOffset, hasNext, partialLoading} = this.state;
    const {thread, setScrollBottomThresholdCondition, dispatch} = this.props;
    if (!hasNext) {
      return;
    }
    if (partialLoading) {
      return;
    }
    this.setState({
      partialLoading: true
    });
    dispatch(threadMessageGetListByTypes(thread.id, types[activeTab], 25, nextOffset)).then(result => {
      setScrollBottomThresholdCondition(result.hasPrevious);
      this.setState({
        partialLoading: false,
        messages: messages.concat(result.messages),
        nextOffset: result.nextOffset,
        hasNext: result.hasPrevious
      });
    });
  }

  buildComponent(type, message) {
    const {dispatch} = this.props;
    const idMessage = `${message.id}-message-types-${type}`;
    const idMessageTrigger = `${idMessage}-trigger`;
    const metaData = typeof message.metadata === "string" ? JSON.parse(message.metadata).file : message.metadata.file;
    const {originalName, size} = metaData;
    const gotoMessage = () => {
      dispatch(threadModalThreadInfoShowing());
      window.modalMediaRef.close();
      dispatch(threadGoToMessageId(message.time));
    };
    const setOrGetAttributeFromLinkTrigger = value => {
      const elem = document.getElementById(idMessageTrigger);
      if (value === true) {
        if (elem) {
          return elem;
        }
        return {
          click: e => {
          }
        };
      }
      if (elem) {
        if (value) {
          return elem.setAttribute("play", value);
        }
        return elem.getAttribute("play");
      }
    };
    const onPlayClick = result => {
      if (result) {
        return document.getElementById(idMessageTrigger).click();
      }
      setOrGetAttributeFromLinkTrigger("true");
      getFileFromHashMap.apply(this, [metaData.fileHash])
    };

    if (type === "picture") {
      const thumb = getImageFromHashMapWindow(metaData.fileHash, 3, null, "thumb", this);
      const blurryThumb = getImageFromHashMapWindow(metaData.fileHash, 1, 0.01, "blurryThumb", this);
      const isBlurry = blurryThumb && (!thumb || thumb === true);
      const onFancyBoxClick = e => {
        //window.modalMediaRef.getFancyBox().open()
        setTimeout(e => {
          document.getElementsByClassName("fancybox-button--goto")[0].addEventListener("click", gotoMessage);
        }, 200)
      };
      return (
        <Container className={style.ModalThreadInfoMessageTypes__ImageContainer} data-fancybox key={idMessage}
                   onClick={onFancyBoxClick}>
          <BoxModalMediaFragment
            options={{buttons: ["goto", "slideShow", "close"], caption: message.message}}
            link={thumb}>
            <Image className={style.ModalThreadInfoMessageTypes__Image}
                   setOnBackground
                   style={{
                     filter: isBlurry ? "blur(8px)" : "none"
                   }}
                   src={isBlurry ? blurryThumb : thumb}/>
          </BoxModalMediaFragment>

        </Container>
      )
    } else if (type === "file" || type === "sound" || type === "video" || type === "voice") {
      const fileResult = getFileDownloadingFromHashMap.apply(this, [metaData.fileHash]);
      const result = typeof fileResult === "string" && fileResult.indexOf("blob") > -1 ? fileResult : null;
      const isDownloading = fileResult === true;
      const isPlaying = result && setOrGetAttributeFromLinkTrigger() === "true";
      if (isPlaying) {
        setTimeout(e => {
          setOrGetAttributeFromLinkTrigger(true).click();
          setOrGetAttributeFromLinkTrigger("false");
        }, 300);
      }
      return (
        <Container className={style.ModalThreadInfoMessageTypes__FileContainer} onClick={gotoMessage} key={idMessage}>
          <Container maxWidth="calc(100% - 30px)">

            <Container className={style.ModalThreadInfoMessageTypes__FileNameContainer}>
              <Text whiteSpace="noWrap" bold>
                {originalName}
              </Text>
            </Container>

            <Text size="xs" color="gray">{humanFileSize(size, true)}</Text>
          </Container>
          <Container centerLeft onClick={e => e.stopPropagation()}>
            {type === "file" ?
              <Text id={idMessageTrigger} link={`#${idMessage}`} download={originalName} href={result} linkClearStyle/>
              :
              <Text id={idMessageTrigger} link={`#${idMessage}`} linkClearStyle data-fancybox/>
            }
            {type === "video" ?
              <video controls id={idMessage} style={{display: "none"}}
                     src={result}/> :
              type === "sound" || type === "voice" ? <audio controls id={idMessage} style={{display: "none"}}
                                        src={result}/> : ""
            }
            {
              isDownloading ?
                <Loading><LoadingBlinkDots size="sm"/></Loading>
                :
                type === "file" ?
                  <MdArrowDownward style={{cursor: "pointer"}} color={styleVar.colorAccent} size={styleVar.iconSizeSm}
                                   onClick={onPlayClick.bind(this, result)}/>
                  :
                  <MdPlayArrow style={{cursor: "pointer"}} color={styleVar.colorAccent} size={styleVar.iconSizeSm}
                               onClick={onPlayClick.bind(this, result)}/>
            }
          </Container>
        </Container>
      )
    }
    return 1;
  }

  render() {
    const {activeTab, loading, messages, partialLoading} = this.state;
    const {defaultTab, children} = this.props;
    const tabs = Object.keys(types);
    if (defaultTab) {
      tabs.unshift(defaultTab);
    }
    const tabItemClassNames = activeTabItem => classnames({
      [style["ModalThreadInfoMessageTypes__TabItem"]]: true,
      [style["ModalThreadInfoMessageTypes__TabItem--active"]]: activeTabItem === activeTab,
    });

    const messageContainerClassNames = mode => classnames({
      [style["ModalThreadInfoMessageTypes__MessageContainer"]]: true,
      [style[`ModalThreadInfoMessageTypes__MessageContainer--${mode}`]]: true,
    });

    return (
      <Container className={style.ModalThreadInfoMessageTypes}>
        <Container className={style.ModalThreadInfoMessageTypes__Tab} id="message-types-tab">
          {
            tabs.map(key => (
              <Container className={tabItemClassNames(key)} onClick={this.initRequest.bind(this, key)}>
                <Text>{strings.messageTypes[key]}</Text>
              </Container>
            ))
          }
        </Container>

        {defaultTab && defaultTab === activeTab ? children :
          <Container className={style.ModalThreadInfoMessageTypes__Content} relative>
            {loading ?
              <Container center>
                <Loading><LoadingBlinkDots size="sm"/></Loading>
              </Container> :
              <Fragment>
                <Container className={messageContainerClassNames(activeTab)}>
                  {
                    messages.length > 0 ?
                      messages.map(message => (
                        this.buildComponent(activeTab, message)
                      ))
                      :
                      <Container center>
                        <Text size="sm">{strings.noResult}</Text>
                      </Container>
                  }

                </Container>
                {
                  partialLoading &&
                  <Container centerTextAlign>
                    <Loading><LoadingBlinkDots size="sm"/></Loading>
                  </Container>
                }
              </Fragment>

            }
          </Container>}

      </Container>
    )
  }
}

