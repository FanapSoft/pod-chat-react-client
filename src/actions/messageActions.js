import {
  MESSAGE_SEND,
  MESSAGE_EDITING,
  MESSAGE_EDIT,
  MESSAGE_NEW,
  MESSAGE_SEEN,
  MESSAGE_FORWARD,
  MESSAGE_SENDING_ERROR,
  MESSAGE_FILE_UPLOAD_CANCEL,
  MESSAGE_DELETING, MESSAGE_CANCEL, THREAD_CREATE, THREAD_NEW_MESSAGE
} from "../constants/actionTypes";
import {threadCreateWithExistThread} from "./threadActions";
import {getNow, isAudioFile, isImageFile, isVideoFile} from "../utils/helpers";
import {stateGeneratorState} from "../utils/storeHelper";
import {types, typesCode} from "../constants/messageTypes";

const {SUCCESS} = stateGeneratorState;

function commonOnTheFlySendMessage(text, file, dispatch, getState) {
  const state = getState();
  const thread = state.thread.thread;
  const chatSDK = state.chatInstance.chatSDK;
  const uniqueId = `${Math.random()}`;
  let messageMock = {
    threadId: thread.id,
    time: getNow() * Math.pow(10, 6),
    uniqueId,
    participant: state.user.user,
    message: text
  };

  if (file) {
    const isImage = isImageFile(file);
    const isVideo = isVideoFile(file);
    const isAudio = isAudioFile(file);
    const messageType = isImage ? types.picture : isVideo ? types.video : isAudio ? types.sound : types.file;
    messageMock = {
      ...messageMock,
      fileObject: file,
      messageType: typesCode[messageType],
      metadata: {
        name: file.name,
        file: {
          link: URL.createObjectURL(file),
          mimeType: file.type,
          size: file.size
        }
      }
    }
  }
  if (thread.pendingMessage.push(messageMock) <= 1) {
    chatSDK.createThread(thread.partner.userId, thread.participant.isMyContact ? null : "TO_BE_USER_ID").then(thread => {
      const threadId = thread.id;
      dispatch({
        type: THREAD_CREATE("CACHE"),
        payload: thread
      });
      const currentThread = state.thread.thread;
      const {pendingMessage} = currentThread;
      if (pendingMessage.length) {
        for (const message of pendingMessage) {
          const messageText = message.message;
          if (message.fileObject) {
            dispatch(messageSendFile(message.fileObject, thread, messageText, {fileUniqueId: uniqueId}));
          } else {
            dispatch(messageSend(messageText, thread.id, {uniqueId}));
          }
        }
      }
    });
  }
  dispatch({
    type: MESSAGE_SEND(SUCCESS),
    payload: messageMock
  });
  dispatch(threadCreateWithExistThread(thread));
}

export const messageSend = (text, threadId, other) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return dispatch({
      type: MESSAGE_SEND(),
      payload: chatSDK.sendMessage(text, threadId, other)
    });
  }
};

export const messageSendLocation = (thread, lat, lng, options) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.sendLocationMessage(thread, lat, lng, options, message => {
      dispatch({
        type: THREAD_NEW_MESSAGE,
        payload: message
      });
    }).then(message=>{
      dispatch({
        type: MESSAGE_SEND(SUCCESS),
        payload: message
      });
    })
  }
};

export const messageSendOnTheFly = message => {
  return commonOnTheFlySendMessage.bind(null, message, null);
};

export const messageSendFileOnTheFly = (file, message) => {
  return commonOnTheFlySendMessage.bind(null, message, file);
};

export const messageSendFile = (file, threadId, message, other) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: MESSAGE_SEND(),
      payload: chatSDK.sendFileMessage(file, threadId, message, other)
    });
  }
};

export const messageGetFile = (hashCode, callBack) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.getFileFromPodspace(hashCode, callBack);
  }
};

export const messageGetImage = (hashCode, size, quality, crop) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.getImageFromPodspace(hashCode, size, quality, crop);
  }
};

export const messageFileReply = (file, threadId, repliedTo, message, repliedMessage, other) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: MESSAGE_SEND(),
      payload: chatSDK.replyFileMessage(file, threadId, repliedTo, message, repliedMessage, other)
    });
  }
};

export const messageCancelFile = (fileUniqueId, threadId) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: MESSAGE_FILE_UPLOAD_CANCEL(),
      payload: chatSDK.cancelFileUpload(fileUniqueId, threadId)
    });
  }
};

export const messageCancelFileDownload = (uniqueId) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.cancelFileDownload(uniqueId)
  }
};

export const messageCancel = (uniqueId) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: MESSAGE_CANCEL(),
      payload: chatSDK.cancelMessage(uniqueId)
    });
  }
};

export const messageEditing = (message, type, threadId) => {
  return (dispatch) => {
    dispatch({
      type: MESSAGE_EDITING,
      payload: message ? {message, type, threadId} : null
    });
  }
};

export const messageSendingError = (threadId, uniqueId) => {
  return (dispatch) => {
    dispatch({
      type: MESSAGE_SENDING_ERROR,
      payload: {threadId, uniqueId}
    });
  }
};

export const messageEdit = (newText, id, messageEditing) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: MESSAGE_EDIT(),
      payload: chatSDK.editMessage(newText, id)
    });
  }
};

export const messageDelete = (id, deleteForAll) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: MESSAGE_DELETING(),
      payload: chatSDK.deleteMessage(id, deleteForAll)
    });
  }
};

export const messageForward = (threadId, messageId) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: MESSAGE_FORWARD(),
      payload: chatSDK.forwardMessage(threadId, messageId)
    });
  }
};

export const messageForwardOnTheFly = (messageId, firstMessage) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    const thread = state.thread.thread;
    return chatSDK.createThread(thread.partner.userId, thread.participant.isMyContact ? null : "TO_BE_USER_ID").then(thread => {
      dispatch({
        type: THREAD_CREATE("CACHE"),
        payload: thread
      });
      if (firstMessage) {
        dispatch(messageSend(firstMessage, thread.id));
        return setTimeout(() => dispatch(messageForward(thread.id, messageId)), 300)
      }
      dispatch(messageForward(thread.id, messageId));
    });
  }
};

export const messageInfo = (threadId, messageId) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.getMessageById(threadId, messageId)
  }
};

export const messageReply = (replyText, id, threadId, repliedMessage) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: MESSAGE_SEND(),
      payload: chatSDK.replyMessage(replyText, id, threadId, repliedMessage)
    });
  }
};

export const messageNew = (message) => {
  return dispatch => {
    dispatch({
      type: MESSAGE_NEW,
      payload: message
    });
  }
};

export const messageSeen = (message) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    dispatch({
      type: MESSAGE_SEEN(),
      payload: chatSDK.seenMessage(message.id, message.ownerId, message.threadId)
    });
  }
};

export const messageGetSeenList = (messageId) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.getMessageSeenList(messageId);
  }
};