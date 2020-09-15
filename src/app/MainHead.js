// src/list/Avatar.scss.js
import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";

//strings
import strings from "../constants/localization";
import {THREAD_LEFT_ASIDE_SEARCH} from "../constants/actionTypes";

//actions
import {
  threadShowing,
  threadLeftAsideShowing,
  threadSelectMessageShowing,
  threadInit
} from "../actions/threadActions";
import {threadModalThreadInfoShowing, threadCheckedMessageList} from "../actions/threadActions";

//UI components
import {MdChevronLeft, MdSearch, MdCheck, MdClose} from "react-icons/md";
import Loading, {LoadingBlinkDots} from "../../../uikit/src/loading";
import Container from "../../../uikit/src/container";
import MainHeadThreadInfo from "./MainHeadThreadInfo";
import MainHeadBatchActions from "./MainHeadBatchActions";
import {Text} from "../../../uikit/src/typography";
import Gap from "../../../uikit/src/gap";

//styling
import style from "../../styles/app/MainHead.scss";
import styleVar from "../../styles/variables.scss";
import classnames from "classnames";


const statics = {};

@connect(store => {
  return {
    smallVersion: store.chatSmallVersion,
    thread: store.thread.thread,
    threadShowing: store.threadShowing,
    threadSelectMessageShowing: store.threadSelectMessageShowing,
    threadCheckedMessageList: store.threadCheckedMessageList,
    chatRouterLess: store.chatRouterLess
  };
})
class MainHead extends Component {

  constructor(props) {
    super(props);
    this.onShowInfoClick = this.onShowInfoClick.bind(this);
    this.onThreadHide = this.onThreadHide.bind(this);
    this.onLeftAsideShow = this.onLeftAsideShow.bind(this);
    this.onSelectMessagesHide = this.onSelectMessagesHide.bind(this);
    this.onSelectMessagesShow = this.onSelectMessagesShow.bind(this);
  }

  onShowInfoClick() {
    this.props.dispatch(threadModalThreadInfoShowing(true));
  }

  onThreadHide(e) {
    e.stopPropagation();
    const {dispatch, chatRouterLess, history} = this.props;
    dispatch(threadInit());
    if(!chatRouterLess){
      history.push("/");
    }
  }

  onLeftAsideShow(e) {
    e.stopPropagation();
    this.props.dispatch(threadLeftAsideShowing(true, THREAD_LEFT_ASIDE_SEARCH));
  }

  onSelectMessagesShow(e) {
    e.stopPropagation();
    this.props.dispatch(threadSelectMessageShowing(true));
  }

  onSelectMessagesHide(e) {
    e.stopPropagation();
    const {dispatch} = this.props;
    dispatch(threadSelectMessageShowing(false));
    dispatch(threadCheckedMessageList(null, null, true));
  }

  render() {
    const {thread, smallVersion, threadSelectMessageShowing, threadCheckedMessageList} = this.props;
    const showLoading = !thread.id;
    const classNames = classnames({
      [style.MainHead]: true,
      [style["MainHead--smallVersion"]]: smallVersion
    });
    return (
      <Container className={classNames} onClick={this.onShowInfoClick} relative>
        {
          showLoading ?
            <Container>
              <Gap y={15}>
                <Text color="gray" light inline>{strings.waitingForGettingContactInfo}</Text>
                <Loading inline><LoadingBlinkDots size="sm" invert/></Loading>
              </Gap>
            </Container>
            :
            threadSelectMessageShowing ? <MainHeadBatchActions thread={thread} threadCheckedMessageList={threadCheckedMessageList}/> : <MainHeadThreadInfo/>
        }
        {!showLoading &&
        <Container centerLeft>
          {
            threadSelectMessageShowing &&
            <Container>
              <Container inline>
                <Text color="gray" light>{strings.messagesCount(threadCheckedMessageList.length)}</Text>
              </Container>
              <Container className={style.MainHead__SearchContainer} inline onClick={this.onSelectMessagesHide}>
                <MdClose size={styleVar.iconSizeMd} color={styleVar.colorWhite}/>
              </Container>

            </Container>
          }

          {
            !threadSelectMessageShowing &&
            <Container>
              {thread.lastMessageVO &&
              <Container className={style.MainHead__SearchContainer} inline onClick={this.onSelectMessagesShow}>
                <MdCheck size={styleVar.iconSizeMd} color={styleVar.colorWhite}/>
              </Container>
              }
              <Container className={style.MainHead__SearchContainer} inline onClick={this.onLeftAsideShow}>
                <MdSearch size={styleVar.iconSizeMd} color={styleVar.colorWhite}/>
              </Container>
              <Container className={style.MainHead__BackContainer} inline onClick={this.onThreadHide}>
                <MdChevronLeft size={styleVar.iconSizeMd} color={styleVar.colorWhite}/>
              </Container>
            </Container>
          }

        </Container>
        }
      </Container>
    )
  }
}

export default withRouter(MainHead);