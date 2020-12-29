import React, {Fragment} from "react";
import List, {ListItem} from "../../../../pod-chat-ui-kit/src/list";
import {Text, Heading} from "../../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../../pod-chat-ui-kit/src/gap";
import strings from "../../constants/localization";
import {messageDelete} from "../../actions/messageActions";
import {chatModalPrompt} from "../../actions/chatActions";
import {
  threadCheckedMessageList,
  threadMessagePinToTop,
  threadSelectMessageShowing
} from "../../actions/threadActions";
import {messageDeleteForAllCondition} from "../../utils/helpers";

export function MessageDeletePrompt(props) {
  const {message, dispatch, thread, user} = props;

  const isBatchMessage = message instanceof Array;
  let isAbleToRemoveForAll = isBatchMessage ? true : messageDeleteForAllCondition(message, user, thread);
  let isThereAnyThatYouCanRemoveForOther = false;
  if (isBatchMessage) {
    for (const msg of message) {
      const result = messageDeleteForAllCondition(msg, user, thread);
      if (isAbleToRemoveForAll) {
        if (!result) {
          isAbleToRemoveForAll = result;
        }
      }
      if (result) {
        if (!isThereAnyThatYouCanRemoveForOther) {
          isThereAnyThatYouCanRemoveForOther = true;
        }
      }
    }
  }

  function deleteMessage(forMeOnly, abort, removeIfYouCanForBothSide) {
    forMeOnly = forMeOnly === true;
    abort = abort === true;
    removeIfYouCanForBothSide = removeIfYouCanForBothSide === true;
    dispatch(chatModalPrompt());
    if (abort) {
      dispatch(threadSelectMessageShowing(false));
      dispatch(threadCheckedMessageList(null, null, true));
      return;
    }
    if (isBatchMessage) {
      for (const msg of message) {
        dispatch(messageDelete(msg.id, forMeOnly ? false : removeIfYouCanForBothSide ? messageDeleteForAllCondition(msg, user, thread) : true));
      }
    } else {
      dispatch(messageDelete(message.id, !forMeOnly));
    }
    if (isBatchMessage) {
      dispatch(threadSelectMessageShowing(false));
      dispatch(threadCheckedMessageList(null, null, true));
    }
  }

  return (
    <Fragment>
      <Text
        size="lg">{isBatchMessage && message.length > 1 ? strings.howWeShouldDeleteThisMessageForYou(message.length) : strings.howWeShouldDeleteThisMessageForYou()}؟</Text>
      <Gap y={5}/>
      <List>

        <ListItem key="for-me"
                  selection={true}
                  invert={true}
                  onSelect={deleteMessage.bind(null, true)}>
          <Text bold color="accent">{strings.forMeOnly}</Text>

        </ListItem>

        {(isThereAnyThatYouCanRemoveForOther || isAbleToRemoveForAll) &&
        <ListItem key="for-others-also"
                  color="accent"
                  selection={true}
                  invert={true}
                  onSelect={isThereAnyThatYouCanRemoveForOther && !isAbleToRemoveForAll ? deleteMessage.bind(null, false, false, true) : deleteMessage.bind(null, false)}>
          <Text bold
                color="accent">{isThereAnyThatYouCanRemoveForOther && !isAbleToRemoveForAll ? strings.removeMessageThatYouCanDeleteForAll : strings.forMeAndOthers}</Text>

        </ListItem>
        }

        <ListItem key="i-canceled"
                  color="accent"
                  selection={true}
                  invert={true}
                  onSelect={deleteMessage.bind(null, false, true)}>
          <Text bold color="accent">{strings.iCanceled}</Text>

        </ListItem>
      </List>
    </Fragment>
  )
}


export function PinMessagePrompt({message, dispatch}) {
  function pinMessage(notifyAll) {
    dispatch(chatModalPrompt());
    dispatch(threadMessagePinToTop(message.id, notifyAll));
  }

  return (
    <Fragment>
      <Text size="lg">{strings.howDoYouPinThisMessage}؟</Text>
      <Gap y={5}/>
      <List>

        <ListItem key="pin-and-notify"
                  selection={true}
                  invert={true}
                  onSelect={pinMessage.bind(null, true)}>
          <Text bold color="accent">{strings.pinAndNotifyAll}</Text>

        </ListItem>
        <ListItem key="only-pin"
                  selection={true}
                  invert={true}
                  onSelect={pinMessage}>
          <Text bold color="accent">{strings.onlyPin}</Text>

        </ListItem>
        <ListItem key="canceled-dont"
                  selection={true}
                  invert={true}
                  onSelect={() => dispatch(chatModalPrompt())}>
          <Text bold color="accent">{strings.canceledIDontWant}</Text>

        </ListItem>
      </List>
    </Fragment>
  )
}