import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import queryString from "query-string";
import Cookies from "js-cookie";

//strings
import strings from "../constants/localization";
import {MESSAGE_SHARE} from "../constants/cookie-keys";

//actions
import {chatModalPrompt} from "../actions/chatActions";

//UI components
import {ROUTE_ADD_CONTACT, ROUTE_INDEX, ROUTE_SHARE} from "../constants/routes";
import {withRouter} from "react-router-dom";
import {threadModalListShowing} from "../actions/threadActions";
import Text from "../../../pod-chat-ui-kit/src/typography/Text";
import Container from "../../../pod-chat-ui-kit/src/container";
import Paper from "../../../pod-chat-ui-kit/src/paper";
import Gap from "../../../pod-chat-ui-kit/src/gap";

//styling

@connect(null, null, null, {forwardRef: true})
class ModalShare extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {match, location, history, dispatch} = this.props;
    if (match.path === ROUTE_SHARE) {
      const {text} = queryString.parse(location.search, {ignoreQueryPrefix: true});
      if (text) {
        const extraMessage = (
          <Fragment>
            <Gap y={5} block/>
            <Paper colorBackground style={{borderRadius: "5px"}}>
              <Text size="xs">{text}</Text>
            </Paper>
          </Fragment>
        );
        dispatch(chatModalPrompt(true, `${strings.areYouSureABoutSendingThisMessage}؟`, () => {
          dispatch(threadModalListShowing(true));
          dispatch(chatModalPrompt());
          Cookies.set(MESSAGE_SHARE, text);
        }, null, strings.send, null, extraMessage));
      } else {
        history.push(ROUTE_INDEX);
      }
    }
  }

  onClose() {
    this.setState({
      showing: false
    });
  }

  render() {
    return null
  }
}

export default withRouter(ModalShare);