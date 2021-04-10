// src/actions/messageActions.js
import {
  threadGetList,
  threadGoToMessageId,
  threadLeave,
  threadMessageGetList,
  threadMessageGetListPartial
} from "./threadActions";
import ChatSDK from "../utils/chatSDK";
import {stateGeneratorState} from "../utils/storeHelper";
import {getThreadHistory} from "../utils/listing";
import {
  CHAT_GET_INSTANCE,
  CHAT_SMALL_VERSION,
  CHAT_STATE,
  CHAT_MODAL_PROMPT_SHOWING,
  CHAT_ROUTER_LESS,
  CHAT_SEARCH_RESULT,
  CHAT_SEARCH_SHOW,
  THREAD_NEW,
  THREAD_CHANGED,
  THREAD_FILE_UPLOADING,
  THREAD_REMOVED_FROM,
  THREAD_PARTICIPANTS_LIST_CHANGE,
  THREADS_LIST_CHANGE,
  THREAD_LEAVE_PARTICIPANT,
  THREAD_GET_LIST,
  CHAT_STOP_TYPING,
  CHAT_IS_TYPING,
  CHAT_NOTIFICATION,
  CHAT_NOTIFICATION_CLICK_HOOK,
  CHAT_RETRY_HOOK,
  CHAT_SIGN_OUT_HOOK,
  THREAD_MESSAGE_PIN,
  MESSAGE_PINNED,
  THREAD_GO_TO_MESSAGE,
  THREAD_GET_MESSAGE_LIST,
  THREAD_CREATE,
  THREAD_GET_MESSAGE_LIST_PARTIAL,
  MESSAGE_SEND,
  CHAT_DESTROY,
  THREAD_THUMBNAIL_UPDATE,
  CHAT_FILE_HASH_CODE_UPDATE,
  CHAT_AUDIO_PLAYER,
  CHAT_FILE_HASH_CODE_REMOVE,
  CHAT_AUDIO_RECORDER,
  CHAT_SUPPORT_MODE,
  CHAT_SUPPORT_MODULE_BADGE_SHOWING
} from "../constants/actionTypes";
import {messageInfo} from "./messageActions";
import {THREAD_HISTORY_LIMIT_PER_REQUEST} from "../constants/historyFetchLimits";


let firstReadyPassed = false;

const {CANCELED, SUCCESS} = stateGeneratorState;
const typing = [];

function findInTyping(threadId, userId, remove) {
  let index = 0;
  for (const type of typing) {
    index++;
    if (type.user.userId === userId) {
      if (threadId === type.threadId) {
        if (remove) {
          return typing.splice(index, 1);
        }
        return type;
      }
    }
  }
  return {};
}

export const chatSetInstance = config => {
  return (dispatch, getState) => {
    dispatch({
      type: CHAT_GET_INSTANCE(),
      payload: null
    });
    new ChatSDK({
      config,
      onThreadEvents: (thread, type) => {

        switch (type) {
          case THREAD_NEW:
          case THREAD_PARTICIPANTS_LIST_CHANGE:
          case THREAD_LEAVE_PARTICIPANT:
          case THREADS_LIST_CHANGE:
            return dispatch({
              type: type,
              payload:
                type === THREAD_NEW ? {redirectToThread: thread.redirectToThread, thread: thread.result.thread}
                  :
                  type === THREADS_LIST_CHANGE ? thread.result.threads
                    :
                    type === THREAD_PARTICIPANTS_LIST_CHANGE ? {...thread.result, threadId: thread.threadId}
                      :
                      type === THREAD_LEAVE_PARTICIPANT ? {threadId: thread.threadId, id: thread.result.participant.id}
                        : thread
            });
          case "MESSAGE_UNPIN":
          case "MESSAGE_PIN": {
            const {thread: id, pinMessage} = thread.result;
            const isUnpin = type === "MESSAGE_UNPIN";
            if (!isUnpin) {
              if (pinMessage.notifyAll) {
                dispatch(messageInfo(id, pinMessage.messageId)).then(message => {
                  return dispatch({
                    type: MESSAGE_PINNED,
                    payload: message
                  });
                });
              }
            }
            return dispatch({
              type: THREAD_MESSAGE_PIN,
              payload: {id, pinMessageVO: isUnpin ? null : pinMessage}
            });
          }
          case THREAD_REMOVED_FROM:
            return dispatch(threadLeave(thread.result.thread, true));
          default:
            if (type === "THREAD_LAST_ACTIVITY_TIME") {
              return;
            }
            thread.changeType = type;
            if (thread.result) {
              if (!thread.result.thread) {
                return;
              }
              if (!thread.result.thread.id) {
                return;
              }
            }
            dispatch({
              type: THREAD_CHANGED,
              payload: thread.result ? thread.result.thread : thread
            });
        }
      },
      onMessageEvents: (message, type) => {
        const {thread} = getState().thread;
        if (type === "MESSAGE_NEW") {
          if (thread) {
            if (thread.id !== message.threadId) {
              return;
            }
          }
        }
        dispatch({
          type: type,
          payload: message
        });
      },
      onContactsEvents: (contacts, type) => {
        dispatch({
          type: type,
          payload: contacts
        });
      },
      onFileUploadEvents: message => {
        dispatch({
          type: THREAD_FILE_UPLOADING,
          payload: {...message, hasError: message.state === "UPLOAD_ERROR"}
        });
      },
      onSystemEvents: ({result, type}) => {
        if (type === "IS_TYPING") {
          const {thread: threadId, user} = result;
          const {threadId: oldThreadId, user: oldUser} = findInTyping(threadId, user.userId);

          if (oldThreadId) {
            const timeOutName = `${oldThreadId}${oldUser.userId}TimeOut`;
            clearTimeout(window[timeOutName]);
          } else {
            typing.push({threadId, user});
          }
          const timeOutName = `${threadId}${user.userId}TimeOut`;
          window[timeOutName] = setTimeout(() => {
            findInTyping(threadId, user.userId, true);
            dispatch({
              type: CHAT_STOP_TYPING,
              payload: {threadId, user}
            });
          }, 1500);
          const lastThread = getState().threads.threads.find(e => e.id === threadId);
          if (lastThread.isTyping && lastThread.isTyping.isTyping) {
            return;
          }
          return dispatch({
            type: CHAT_IS_TYPING,
            payload: {threadId, user}
          });
        }
        if (type === "SERVER_TIME") {
          window._universalTalkTimerDiff = Date.now() - result.time;
        }
      },
      onChatState(e) {
        dispatch({
          type: CHAT_STATE,
          payload: e
        });
      },
      onChatError(e) {

        if (e && e.code) {
          if (e.code === 208) {
            const event = new CustomEvent('podchat-error', {detail: e});
            document.body.dispatchEvent(event);
          }
          if (e.code === 21) {
            const {chatRetryHook, chatInstance} = getState();
            if (chatRetryHook) {
              chatRetryHook().then(token => {
                chatInstance.setToken(token);
                chatInstance.reconnect();
              });
            }
          }

        }
      },
      onChatReady(e) {
        if (firstReadyPassed) {
          dispatch(restoreChatState());
        }
        firstReadyPassed = true;
        dispatch({
          type: CHAT_GET_INSTANCE("SUCCESS"),
          payload: e
        })
      }
    });
  }
};

export const chatGetImage = (hashCode, size, quality, crop) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.getImageFromPodspace(hashCode, size, quality, crop);
  }
};

export const chatGetFile = (hashCode, callBack, params) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.getFileFromPodspace(hashCode, callBack, params);
  }
};

export const chatCancelFileDownload = (uniqueId) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    return chatSDK.cancelFileDownload(uniqueId)
  }
};

export const chatFileHashCodeUpdate = (payload, isCancel) => {
  return (dispatch) => {
    dispatch({
      type: isCancel ? CHAT_FILE_HASH_CODE_REMOVE : CHAT_FILE_HASH_CODE_UPDATE,
      payload
    });
  }
};

export const chatUploadImage = (image, threadId, callBack) => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.uploadImage(image, threadId).then(callBack);
  }
};

export const chatDestroy = () => {
  return (dispatch) => {
    firstReadyPassed = false;
    dispatch({
      type: CHAT_DESTROY,
      payload: null
    });
  }
};

export const restoreChatState = () => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;

    const threads = state.threads.threads;
    dispatch(threadGetList(0, threads.length, null, true)).then(threads => {
      dispatch({
        type: THREAD_GET_LIST(SUCCESS),
        payload: threads
      });
    });

    const pastThread = state.thread.thread;
    if (pastThread.id && !pastThread.onTheFly) {
      chatSDK.getThreadInfo({threadIds: [pastThread.id]}).then(thread => {
        const {messages, threadId, hasNext, hasPrevious, fetching, fetched} = state.threadMessages;
        dispatch({
          type: THREAD_CREATE("CACHE"),
          payload: thread
        });
        const needToFetchSomethingCondition = (!pastThread.lastMessageVO && thread.lastMessageVO) || (pastThread.lastMessageVO.id !== thread.lastMessageVO.id);
        if (!needToFetchSomethingCondition) {
          return;
        }
        const lastMassage = messages[messages.length - 1];
        const firstInitial = !thread.lastMessageVO || (lastMassage && thread.lastMessageVO.time < lastMassage.time);
        const offsetOrTimeNanos = firstInitial ? undefined : lastMassage.time + 200;
        getThreadHistory(chatSDK, threadId, THREAD_HISTORY_LIMIT_PER_REQUEST, offsetOrTimeNanos, !firstInitial).then(payload => {
          const {messages} = payload;
          if (firstInitial) {
            dispatch({
              type: THREAD_GET_MESSAGE_LIST(SUCCESS),
              payload
            });
            threadGoToMessageId(messages[messages.length - 1]);
          } else {
            if (!hasNext) {
              return dispatch({
                type: THREAD_GET_MESSAGE_LIST_PARTIAL(SUCCESS),
                payload
              });
            }
          }

        })
      });
    }
  }
};

export const chatSmallVersion = isSmall => {
  return dispatch => {
    return dispatch({
      type: CHAT_SMALL_VERSION,
      payload: isSmall
    });
  }
};

export const chatSupportMode = isSupportMode => {
  return dispatch => {
    return dispatch({
      type: CHAT_SUPPORT_MODE,
      payload: isSupportMode
    });
  }
};

export const chatSupportModuleBadgeShowing = showing => {
  return dispatch => {
    return dispatch({
      type: CHAT_SUPPORT_MODULE_BADGE_SHOWING,
      payload: showing
    });
  }
};

export const chatRouterLess = isRouterLess => {
  return dispatch => {
    return dispatch({
      type: CHAT_ROUTER_LESS,
      payload: isRouterLess
    });
  }
};

export const chatNotification = isNotification => {
  return dispatch => {
    return dispatch({
      type: CHAT_NOTIFICATION,
      payload: isNotification
    });
  }
};

export const chatNotificationClickHook = chatNotificationClickHook => {
  return {
    type: CHAT_NOTIFICATION_CLICK_HOOK,
    payload: thread => chatNotificationClickHook.bind(null, thread)
  }
};

export const chatRetryHook = chatRetryHookHook => {
  return {
    type: CHAT_RETRY_HOOK,
    payload: () => chatRetryHookHook
  }
};

export const chatSignOutHook = chatSignOutHookHook => {
  return {
    type: CHAT_SIGN_OUT_HOOK,
    payload: () => chatSignOutHookHook
  }
};

export const chatModalPrompt = (isShowing, message, onApply, onCancel, confirmText, customBody, extraMessage) => {
  return dispatch => {
    return dispatch({
      type: CHAT_MODAL_PROMPT_SHOWING,
      payload: {
        isShowing,
        message,
        extraMessage,
        onApply,
        onCancel,
        confirmText,
        customBody
      }
    });
  }
};

export const chatSearchResult = (isShowing, filteredThreads, filteredContacts) => {
  return dispatch => {
    return dispatch({
      type: CHAT_SEARCH_RESULT,
      payload: {
        isShowing,
        filteredThreads,
        filteredContacts
      }
    });
  }
};

export const chatSearchShow = isShow => {
  return dispatch => {
    return dispatch({
      type: CHAT_SEARCH_SHOW,
      payload: isShow
    });
  }
};

export const chatClearCache = () => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.clearCache();
  }
};

export const chatAudioPlayer = data => {
  return (dispatch, getState) => {
    const state = getState();
    const chatAudioPlayer = state.chatAudioPlayer;
    if (chatAudioPlayer) {
      const {player, message} = chatAudioPlayer;
      if (!data || data.message.id !== message.id) {
        player.stop();
      }
    }
    dispatch({
      type: CHAT_AUDIO_PLAYER,
      payload: data ? data : null
    });
  }
};
export const chatAudioRecorder = recording => {
  return (dispatch, getState) => {
    dispatch({
      type: CHAT_AUDIO_RECORDER,
      payload: recording
    });
  }
};

export const startTyping = threadId => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.startTyping(threadId);
  }
};

export const stopTyping = () => {
  return (dispatch, getState) => {
    const state = getState();
    const chatSDK = state.chatInstance.chatSDK;
    chatSDK.stopTyping();
  }
};