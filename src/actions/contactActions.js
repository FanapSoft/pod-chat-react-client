// src/actions/messageActions.js
import {
  CONTACT_GET_LIST,
  CONTACT_GET_LIST_PARTIAL,
  CONTACT_ADD,
  CONTACT_ADDING,
  CONTACT_LIST_SHOWING,
  CONTACT_CHATTING,
  CONTACT_MODAL_CREATE_GROUP_SHOWING,
  CONTACT_BLOCK
} from "../constants/actionTypes";
import {threadCreateOnTheFly, threadCreateWithUser, threadParticipantList, threadShowing} from "./threadActions";
import {messageEditing} from "./messageActions";
import {stateGeneratorState} from "../utils/storeHelper";


const {CANCELED} = stateGeneratorState;

export const contactGetList = (offset = 0, count, name, reset, direct) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    if (direct) {
      return chatSDK.getContactList(offset, count, name);
    }
    if (reset) {
      dispatch({
        type: CONTACT_GET_LIST(CANCELED),
        payload: null
      });
      return dispatch({
        type: CONTACT_GET_LIST_PARTIAL(CANCELED),
        payload: null
      });
    }
    dispatch({
      type: offset > 0 ? CONTACT_GET_LIST_PARTIAL() : CONTACT_GET_LIST(),
      payload: chatSDK.getContactList(offset, count, name)
    });
  }
};

export const contactGetBlockList = () => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: CONTACT_GET_LIST(),
      payload: chatSDK.getBlockList()
    });
  }
};


export const contactAdding = (isShowing, contactEdit) => {
  return dispatch => {
    return dispatch({
      type: CONTACT_ADDING,
      payload: {isShowing, contactEdit}
    });
  }
};

export const contactListShowing = (isShowing) => {
  return dispatch => {
    return dispatch({
      type: CONTACT_LIST_SHOWING,
      payload: isShowing ? isShowing : false
    });
  }
};

export const contactModalCreateGroupShowing = (isShowing, isChannel) => {
  return dispatch => {
    return dispatch({
      type: CONTACT_MODAL_CREATE_GROUP_SHOWING,
      payload: {isShowing, isChannel}
    });
  }
};

export const contactChatting = (contact) => {
  return dispatch => {
    return dispatch({
      type: CONTACT_CHATTING,
      payload: contact
    });
  }
};

export const contactBlock = (threadId, block) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: CONTACT_BLOCK("PENDING"),
      payload: null
    });
    chatSDK.blockContact(threadId, block).then(() => {
      dispatch({
        type: CONTACT_BLOCK("SUCCESS"),
        payload: null
      });
      dispatch(threadParticipantList(threadId));
      dispatch(messageEditing());
    }, () => {
      dispatch({
        type: CONTACT_BLOCK(),
        payload: null
      });
    });
  }
};

export const contactUnblock = blockId => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.unblockContact(blockId).then(e => {
      dispatch(contactGetList());
    });
  }
};

export const contactAdd = (addby, firstName, lastName, editMode, canceled) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    if (canceled) {
      return dispatch({type: CONTACT_ADD(CANCELED)});
    }
    chatSDK.addContact(addby, firstName, lastName).then(e => {
      dispatch({
        type: CONTACT_ADD("SUCCESS"),
        payload: e
      });
      if (editMode) {
        return dispatch(contactAdding());
      }
      if (e.linkedUser) {
        const user = {
          id: e.id,
          cellphoneNumber:e.cellphoneNumber,
          linkedUser: e.linkedUser,
          contactId: e.id,
          isMyContact: true,
          coreUserId: e.linkedUser.coreUserId,
          image: e.linkedUser.image,
          name: `${e.firstName}${e.lastName ? ` ${e.lastName}` : ''}`
        };
        dispatch(threadCreateOnTheFly(e.linkedUser.coreUserId, user));
        dispatch(threadShowing(true));
      }
    }, e => {
      dispatch({
        type: CONTACT_ADD("ERROR"),
        payload: e
      });
    });
    dispatch({
      type: CONTACT_ADD("PENDING"),
      payload: null
    });
  }
};

export const contactUpdate = (contactId, editObject) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.updateContact(contactId, editObject).then(e => {
      dispatch(contactAdding());
    })
  }
};

export const contactSearch = query => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.searchContact(query);
  }
};

export const contactRemove = (contactId, threadId) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.removeContact(contactId).then(e => {
      dispatch(contactGetList());
      if (threadId) {
        dispatch(threadParticipantList(threadId));
      }
    });
  }
};