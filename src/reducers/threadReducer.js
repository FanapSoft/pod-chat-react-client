import {
  MESSAGE_SEEN,
  MESSAGE_EDIT,
  MESSAGE_DELETE,
  MESSAGE_SENDING_ERROR,
  MESSAGE_FILE_UPLOAD_CANCEL,
  THREAD_CREATE,
  THREAD_GET_MESSAGE_LIST,
  THREAD_GET_MESSAGE_LIST_PARTIAL,
  THREAD_GET_LIST,
  THREAD_NEW,
  THREAD_PARTICIPANT_GET_LIST,
  THREAD_PARTICIPANT_ADD,
  THREAD_MODAL_LIST_SHOWING,
  THREAD_MODAL_THREAD_INFO_SHOWING,
  THREAD_CHANGED,
  THREAD_MODAL_MEDIA_SHOWING,
  THREAD_FILES_TO_UPLOAD,
  THREAD_FILE_UPLOADING,
  THREAD_SHOWING,
  THREAD_MODAL_IMAGE_CAPTION_SHOWING,
  THREAD_IMAGES_TO_CAPTION,
  THREAD_LEFT_ASIDE_SHOWING,
  THREAD_GET_MESSAGE_LIST_BY_MESSAGE_ID,
  THREAD_SEARCH_MESSAGE,
  THREAD_GO_TO_MESSAGE,
  THREAD_IS_SENDING_MESSAGE,
  THREAD_SELECT_MESSAGE_SHOWING,
  THREAD_CHECKED_MESSAGE_LIST_EMPTY,
  THREAD_CHECKED_MESSAGE_LIST_ADD,
  THREAD_CHECKED_MESSAGE_LIST_REMOVE,
  THREAD_REMOVED_FROM,
  THREAD_EMOJI_SHOWING,
  THREAD_CREATE_INIT,
  THREAD_PARTICIPANTS_REMOVED,
  THREAD_NOTIFICATION,
  THREAD_PARTICIPANTS_LIST_CHANGE,
  THREADS_LIST_CHANGE,
  THREAD_LEAVE_PARTICIPANT,
  MESSAGE_CANCEL,
  THREAD_NEW_MESSAGE,
  THREAD_PARTICIPANT_GET_LIST_PARTIAL,
  THREAD_GET_LIST_PARTIAL,
  CHAT_STOP_TYPING,
  CHAT_IS_TYPING,
  THREAD_CREATE_ON_THE_FLY,
  THREAD_ADMIN_LIST,
  THREAD_ADMIN_LIST_REMOVE,
  THREAD_ADMIN_LIST_ADD,
  THREAD_UNREAD_MENTIONED_MESSAGE_LIST,
  THREAD_UNREAD_MENTIONED_MESSAGE_REMOVE,
  THREAD_MESSAGE_PIN,
  MESSAGE_NEW,
  THREAD_DRAFT, THREAD_GET_PARTICIPANT_ROLES, THREAD_TRIM_HISTORY, THREAD_TRIM_DOWN_HISTORY
} from "../constants/actionTypes";
import {stateGenerator, updateStore, listUpdateStrategyMethods, stateGeneratorState} from "../utils/storeHelper";
import {getNow, isMessageByMe} from "../utils/helpers";
import {
  THREAD_HISTORY_LIMIT_PER_REQUEST,
  THREAD_HISTORY_MAX_RENDERED,
  THREAD_HISTORY_UNSEEN_MENTIONED
} from "../constants/historyFetchLimits";

const {PENDING, SUCCESS, ERROR, CANCELED} = stateGeneratorState;

export const threadCreateReducer = (state = {
  thread: {},
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_CREATE_INIT:
      return {...state, ...stateGenerator(SUCCESS, {}, "thread")};
    case THREAD_CREATE(PENDING):
      return {...state, ...stateGenerator(PENDING, {}, "thread")};
    case THREAD_NEW:
      if (action.payload.redirectToThread) {
        return {...state, ...stateGenerator(SUCCESS, action.payload.thread, "thread")};
      }
      return state;
    case THREAD_CREATE("CACHE"):
    case THREAD_CREATE_ON_THE_FLY:
      return {...state, ...stateGenerator(SUCCESS, action.payload, "thread")};
    case THREAD_MESSAGE_PIN: {
      let updatedThread = updateStore(state.thread, action.payload, {
        mix: true,
        by: "id",
        method: listUpdateStrategyMethods.UPDATE
      });
      return {...state, ...stateGenerator(SUCCESS, updatedThread, "thread")};
    }
    case MESSAGE_DELETE:
    case MESSAGE_EDIT(): {
      const message = action.payload;
      const pinMessage = state.thread.pinMessageVO;
      if (!pinMessage) {
        return state;
      }
      if (message.id === pinMessage.messageId) {
        let updatedThread = updateStore(state.thread, {
          id: message.threadId,
          pinMessageVO: action.type === MESSAGE_EDIT() ? {
            messageId: pinMessage.messageId,
            text: action.payload.message
          } : null
        }, {
          mix: true,
          by: "id",
          method: listUpdateStrategyMethods.UPDATE
        });
        return {...state, ...stateGenerator(SUCCESS, updatedThread, "thread")};
      }
      return state;
    }
    case CHAT_STOP_TYPING:
    case CHAT_IS_TYPING: {
      const {threadId, user} = action.payload;
      let updatedThread = updateStore(state.thread, {
        id: threadId,
        isTyping: {isTyping: action.type === CHAT_IS_TYPING, user}
      }, {
        mix: true,
        by: "id",
        method: listUpdateStrategyMethods.UPDATE
      });
      return {...state, ...stateGenerator(SUCCESS, updatedThread, "thread")};
    }
    case THREADS_LIST_CHANGE:
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.thread, action.payload[0], {
          by: "id",
          method: listUpdateStrategyMethods.UPDATE
        }), "thread")
      };
    case THREAD_CHANGED:
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.thread, {...state.thread, ...action.payload}, {
          by: "id",
          method: listUpdateStrategyMethods.UPDATE
        }), "thread")
      };
    case THREAD_CREATE(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    case THREAD_GET_PARTICIPANT_ROLES(SUCCESS):
      if (action.payload.threadId === state.thread.id) {
        return {
          ...state, ...stateGenerator(SUCCESS, updateStore(state.thread, {
            id: action.payload.threadId,
            roles: action.payload.roles
          }, {
            mix: true,
            by: "id",
            method: listUpdateStrategyMethods.UPDATE
          }), "thread")
        };
      }
      return state;
    default:
      return state;
  }
};

export const threadModalListShowingReducer = (state = {}, action) => {
  switch (action.type) {
    case THREAD_MODAL_LIST_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const threadModalMedialShowingReducer = (state = {
  object: {}
}, action) => {
  switch (action.type) {
    case THREAD_MODAL_MEDIA_SHOWING:
      return {object: action.payload};
    default:
      return state;
  }
};

export const threadFilesToUploadReducer = (state = null, action) => {
  switch (action.type) {
    case THREAD_FILES_TO_UPLOAD:
      return action.payload;
    default:
      return state;
  }
};

export const threadImagesToCaptionReducer = (state = null, action) => {
  switch (action.type) {
    case THREAD_IMAGES_TO_CAPTION:
      return action.payload;
    default:
      return state;
  }
};

export const threadModalThreadInfoShowingReducer = (state = false, action) => {
  switch (action.type) {
    case THREAD_MODAL_THREAD_INFO_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const threadModalImageCaptionShowingReducer = (state = false, action) => {
  switch (action.type) {
    case THREAD_MODAL_IMAGE_CAPTION_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const threadSelectMessageShowingReducer = (state = false, action) => {
  switch (action.type) {
    case THREAD_SELECT_MESSAGE_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const threadGoToMessageIdReducer = (state = null, action) => {
  switch (action.type) {
    case THREAD_GO_TO_MESSAGE:
      return action.payload;
    default:
      return state;
  }
};

export const threadShowingReducer = (state = false, action) => {
  switch (action.type) {
    case THREAD_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const threadLeftAsideShowingReducer = (state = {
  isShowing: false,
  type: null,
  data: null
}, action) => {
  switch (action.type) {
    case THREAD_LEFT_ASIDE_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const threadEmojiShowingReducer = (state = false, action) => {
  switch (action.type) {
    case THREAD_EMOJI_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const threadIsSendingMessageReducer = (state = false, action) => {
  switch (action.type) {
    case THREAD_IS_SENDING_MESSAGE:
      return action.payload;
    default:
      return state;
  }
};

export const threadsReducer = (state = {
  threads: [],
  hasNext: false,
  nextOffset: 0,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  const sortThreads = threads => {
    const pinedThreads = [...threads.filter(e => e.pin)];
    const unpinedThreads = [...threads.filter(e => !e.pin)].sort((a, b) => b.time - a.time);
    return pinedThreads.concat(unpinedThreads);
  };

  function removeDuplicateThreads(threads) {
    const checkedIds = [];
    const removeIndexes = [];
    for (const thread of threads) {
      const index = checkedIds.findIndex(id => id === thread.id);
      if (~index) {
        removeIndexes.push(index);
      }
      checkedIds.push(thread.id);
    }
    removeIndexes.forEach(index => threads.splice(index, 1));
    return threads;
  }

  switch (action.type) {
    case THREAD_GET_LIST(PENDING):
      return {...state, ...stateGenerator(PENDING, [], "threads")};
    case THREAD_GET_LIST(SUCCESS): {
      const {threads, hasNext, nextOffset} = action.payload;
      return {
        ...state, ...stateGenerator(SUCCESS, {
          threads: sortThreads([...removeDuplicateThreads(threads)]),
          hasNext,
          nextOffset
        })
      };
    }
    case CHAT_STOP_TYPING:
    case CHAT_IS_TYPING: {
      const {threadId, user} = action.payload;
      let updatedThreads = updateStore(state.threads, {
        id: threadId,
        isTyping: {isTyping: action.type === CHAT_IS_TYPING, user}
      }, {
        mix: true,
        by: "id",
        method: listUpdateStrategyMethods.UPDATE
      });
      return {...state, ...stateGenerator(SUCCESS, sortThreads(updatedThreads), "threads")};
    }
    case THREAD_MESSAGE_PIN: {
      let updatedThreads = updateStore(state.threads, action.payload, {
        mix: true,
        by: "id",
        method: listUpdateStrategyMethods.UPDATE
      });
      return {...state, ...stateGenerator(SUCCESS, sortThreads(updatedThreads), "threads")};
    }
    case THREAD_GET_LIST_PARTIAL(SUCCESS): {
      const {threads, hasNext, nextOffset} = action.payload;
      return {
        ...state, ...stateGenerator(SUCCESS, {
          threads: removeDuplicateThreads(sortThreads(state.threads.concat(threads))),
          hasNext,
          nextOffset
        })
      };
    }
    case THREAD_NEW:
    case THREAD_CHANGED: {
      let threads = updateStore(state.threads, action.type === THREAD_CHANGED ? action.payload : action.payload.thread, {
        method: listUpdateStrategyMethods.UPDATE,
        mix: action.type === THREAD_CHANGED,
        upsert: true,
        by: "id"
      });
      return {...state, ...stateGenerator(SUCCESS, sortThreads(threads), "threads")};
    }
    case THREADS_LIST_CHANGE: {
      let threads = updateStore(state.threads, action.payload, {
        method: listUpdateStrategyMethods.UPDATE,
        upsert: true,
        by: "id"
      });
      return {...state, ...stateGenerator(SUCCESS, sortThreads(threads), "threads")};
    }
    case THREAD_DRAFT: {
      let threads = updateStore(state.threads, action.payload, {
        mix: true,
        method: listUpdateStrategyMethods.UPDATE,
        by: "id"
      });
      return {...state, ...stateGenerator(SUCCESS, sortThreads(threads), "threads")};
    }
    case THREAD_GET_LIST(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    case THREAD_REMOVED_FROM: {
      let threads = updateStore(state.threads, action.payload, {
        by: "id",
        method: listUpdateStrategyMethods.REMOVE
      });
      return {...state, ...stateGenerator(SUCCESS, sortThreads(threads), "threads")};
    }
    case MESSAGE_SEEN(): {
      let filteredThread = state.threads.filter(thread => thread.lastMessageVO && thread.lastMessageVO.id === action.payload);
      if (!filteredThread.length) {
        return state;
      }
      filteredThread = filteredThread[0];
      const {lastMessageVO, id} = filteredThread;
      const list = updateStore(
        filteredThread,
        {id: id, lastMessageVO: {...lastMessageVO, ...{seen: true}}},
        {
          mix: true,
          by: "id",
          method: listUpdateStrategyMethods.UPDATE
        }
      );
      let threads = updateStore(state.threads, list, {
        by: "id",
        method: listUpdateStrategyMethods.UPDATE
      });
      return {...state, ...stateGenerator(SUCCESS, sortThreads(threads), "threads")};
    }
    default:
      return state;
  }
};


export const threadsPartialReducer = (state = {
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_GET_LIST_PARTIAL(CANCELED):
      return {...state, ...stateGenerator(CANCELED)};
    case THREAD_GET_LIST_PARTIAL(PENDING):
      return {...state, ...stateGenerator(PENDING)};
    case THREAD_GET_LIST_PARTIAL(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS)};
    default:
      return state;
  }
};

export const threadAdminListReducer = (state = {
  admins: [],
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_ADMIN_LIST(PENDING):
      return {...state, ...stateGenerator(PENDING)};
    case THREAD_ADMIN_LIST_REMOVE:
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.admins, action.payload, {
          method: listUpdateStrategyMethods.REMOVE,
          by: "id"
        }), "admins")
      };
    case THREAD_ADMIN_LIST_ADD:
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.admins, action.payload, {
          method: listUpdateStrategyMethods.UPDATE,
          upsert: true,
          by: "id"
        }), "admins")
      };
    case THREAD_ADMIN_LIST(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS, action.payload, "admins")};
    case THREAD_ADMIN_LIST(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};

export const threadSearchMessageReducer = (state = {
  messages: {
    reset: true
  },
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_SEARCH_MESSAGE(PENDING):
      return {...state, ...stateGenerator(PENDING, [], "messages")};
    case THREAD_SEARCH_MESSAGE(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS, action.payload, "messages")};
    case THREAD_SEARCH_MESSAGE(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};

export const threadMessageListPartialReducer = (state = {
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_GET_MESSAGE_LIST_PARTIAL(CANCELED):
      return {...state, ...stateGenerator(CANCELED)};
    case THREAD_GET_MESSAGE_LIST_PARTIAL(PENDING):
      return {...state, ...stateGenerator(PENDING)};
    case THREAD_GET_MESSAGE_LIST_PARTIAL(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS)};
    case THREAD_GET_MESSAGE_LIST_PARTIAL(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};

export const threadGetMessageListByMessageIdReducer = (state = {
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_GET_MESSAGE_LIST_BY_MESSAGE_ID(CANCELED):
      return {...state, ...stateGenerator(CANCELED)};
    case THREAD_GET_MESSAGE_LIST_BY_MESSAGE_ID(PENDING):
      return {...state, ...stateGenerator(PENDING)};
    case THREAD_GET_MESSAGE_LIST_BY_MESSAGE_ID(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS)};
    case THREAD_GET_MESSAGE_LIST_BY_MESSAGE_ID(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};

export const threadUnreadMentionedMessageListReducer = (state = {
  messages: [],
  threadId: null,
  count: 0,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_NEW:
    case THREAD_CREATE("CACHE"):
      return {
        ...state, ...stateGenerator(SUCCESS, action.payload.id, "threadId")
      };
    case THREAD_UNREAD_MENTIONED_MESSAGE_LIST(PENDING):
    case THREAD_UNREAD_MENTIONED_MESSAGE_LIST(CANCELED):
      return {
        ...state, ...stateGenerator(action.type === THREAD_UNREAD_MENTIONED_MESSAGE_LIST(CANCELED) ? CANCELED : PENDING, {
          messages: [],
          threadId: null,
          count: 0
        })
      };
    case THREAD_UNREAD_MENTIONED_MESSAGE_LIST(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS, action.payload)};
    case MESSAGE_NEW:
      if (!action.payload.mentioned) {
        return state;
      }
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.messages, action.payload, {
          method: listUpdateStrategyMethods.UPDATE,
          upsert: true,
          by: "id"
        }), "messages")
      };
    case THREAD_UNREAD_MENTIONED_MESSAGE_REMOVE:
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.messages, action.payload, {
          method: listUpdateStrategyMethods.REMOVE,
          by: "id"
        }), "messages")
      };
    default:
      return state;
  }
};

export const threadMessageListReducer = (state = {
  messages: [],
  threadId: null,
  hasNext: false,
  hasPrevious: false,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  function checkForCurrentThread() {
    if (action.payload.threadId === state.threadId) {
      return true;
    }
  }

  function sortMessages(state) {
    let messages = [...state.messages];
    messages = messages.sort((a, b) => a.time - b.time);
    state.messages = messages;
    return state;
  }

  function removeDuplicateMessages(state) {
    let messages = [...state.messages];
    const checkedIds = [];
    const removeIndexes = [];
    for (const message of messages) {
      if (!message.id) {
        continue;
      }
      const index = checkedIds.findIndex(id => id === message.id);
      if (~index) {
        removeIndexes.push(index);
      }
      checkedIds.push(message.id);
    }
    removeIndexes.forEach(index => messages.splice(index, 1));
    return state;
  }

  let newHasNext, newHasPrevious;
  let hasNext = state.hasNext;
  let hasPrevious = state.hasPrevious;
  if (action.payload) {
    newHasNext = action.payload.hasNext;
    newHasPrevious = action.payload.hasPrevious;
    hasNext = newHasNext !== null && newHasNext !== "UNKNOWN" ? newHasNext : state.hasNext;
    hasPrevious = newHasPrevious !== null && newHasPrevious !== "UNKNOWN" ? newHasPrevious : state.hasPrevious;
  }
  switch (action.type) {
    case THREAD_CREATE_INIT:
    case THREAD_CREATE("CACHE"):
    case THREAD_CREATE(PENDING):
    case THREAD_CREATE(SUCCESS): {
      if (action.type === THREAD_CREATE("CACHE")) {
        if (typeof state.threadId === "string") {
          if (state.threadId.indexOf("ON_THE_FLY") > -1) {
            if (state.threadId.indexOf(`${action.payload.partner}` > -1)) {
              return {
                ...state, ...stateGenerator(SUCCESS, {
                  threadId: action.payload.id
                })
              }
            }
          }
        }
        if (state.threadId === action.payload.id) {
          return state;
        }
      }
      const isSetThreadIdNull = action.type === THREAD_CREATE_INIT || action.type === THREAD_CREATE(PENDING);
      return {
        ...state, ...stateGenerator(PENDING, {
          threadId: isSetThreadIdNull ? null : action.payload.id,
          messages: []
        })
      };
    }
    case THREAD_CREATE_ON_THE_FLY:
      return {
        ...state, ...stateGenerator(SUCCESS, {
          threadId: action.payload.id,
          messages: []
        })
      };
    case THREAD_GET_MESSAGE_LIST(PENDING):
      return {...state, ...stateGenerator(PENDING)};
    case THREAD_GET_MESSAGE_LIST_BY_MESSAGE_ID(PENDING):
      return {...state, ...stateGenerator(SUCCESS, [], "messages")};
    case THREAD_GET_MESSAGE_LIST_BY_MESSAGE_ID(SUCCESS):
    case THREAD_GET_MESSAGE_LIST(SUCCESS): {
      const {threadId, messages} = action.payload;
      if (state.threadId) {
        if (threadId !== state.threadId) {
          return state;
        }
      }
      const object = {
        hasPrevious,
        hasNext,
        threadId,
        messages
      };
      return sortMessages(removeDuplicateMessages({...state, ...stateGenerator(SUCCESS, object)}));
    }

    case THREAD_GET_MESSAGE_LIST(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    case THREAD_FILE_UPLOADING: {
      if (state.fetching) {
        return state;
      }
      const messages = updateStore(state.messages, action.payload, {
        method: listUpdateStrategyMethods.UPDATE,
        mix: true,
        by: "uniqueId"
      });
      return removeDuplicateMessages({...state, ...stateGenerator(SUCCESS, messages, "messages")});
    }
    case THREAD_TRIM_DOWN_HISTORY: {
      const stateMessages = state.messages;
      if (stateMessages.length > THREAD_HISTORY_MAX_RENDERED) {
        return {
          ...state,
          messages: state.messages.slice(0, THREAD_HISTORY_MAX_RENDERED),
          hasNext: true
        };
      } else {
        return state;
      }
    }
    case THREAD_GET_MESSAGE_LIST_PARTIAL(SUCCESS): {
      const {messages} = action.payload;
      let {messages: stateMessages} = state;
      let trimUpHistoryCondition = messages.length && (messages[messages.length - 1].time > stateMessages[stateMessages.length - 1].time);
      if (trimUpHistoryCondition) {
        if (stateMessages.length + messages.length >= THREAD_HISTORY_MAX_RENDERED) {
          stateMessages = stateMessages.slice((stateMessages.length + messages.length) - THREAD_HISTORY_MAX_RENDERED, THREAD_HISTORY_MAX_RENDERED);
        } else {
          trimUpHistoryCondition = false;
        }
      }
      const object = {
        hasPrevious: trimUpHistoryCondition || hasPrevious,
        hasNext,
        threadId: action.payload.threadId,
        messages: [...action.payload.messages, ...stateMessages]
      };
      return sortMessages(removeDuplicateMessages({...state, ...stateGenerator(SUCCESS, object)}));
    }
    case MESSAGE_SENDING_ERROR: {
      const messages = updateStore(state.messages, {
        hasError: true,
        id: action.payload.id
      }, {method: listUpdateStrategyMethods.UPDATE, mix: true, by: "id"});
      return removeDuplicateMessages({...state, ...stateGenerator(SUCCESS, messages, "messages")});
    }
    case MESSAGE_FILE_UPLOAD_CANCEL(SUCCESS):
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.messages, action.payload.uniqueId, {
          method: listUpdateStrategyMethods.REMOVE,
          by: "uniqueId"
        }), "messages")
      };
    case THREAD_NEW_MESSAGE:
      if (!checkForCurrentThread()) {
        return state;
      }
      const stateMessages = state.messages;
      const {followUp, isByMe} = action.payload;
      if (!followUp && !isByMe) {
        if (stateMessages.length >= THREAD_HISTORY_MAX_RENDERED) {
          return {
            ...state,
            hasNext: true
          }
        }
      }
      let messages = updateStore(stateMessages, action.payload, {
        method: listUpdateStrategyMethods.UPDATE,
        upsert: true,
        by: ["id", "uniqueId"],
        or: true
      });
      if (isByMe || followUp) {
        const limitCount = (isByMe ? THREAD_HISTORY_LIMIT_PER_REQUEST : THREAD_HISTORY_MAX_RENDERED);
        if (messages.length > limitCount) {
          messages = messages.slice(messages.length - limitCount);
        }
      }
      return sortMessages({
        ...state,
        messages,
        hasNext: false,
        hasPrevious: stateMessages.length >= 20
      });
    case MESSAGE_EDIT():
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.messages, action.payload, {
          method: listUpdateStrategyMethods.UPDATE,
          by: "id"
        }), "messages")
      };
    case MESSAGE_SEEN():
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.messages, {
          seen: true,
          id: action.payload
        }, {method: listUpdateStrategyMethods.UPDATE, by: "id", mix: true}), "messages")
      };
    case MESSAGE_DELETE:
    case MESSAGE_CANCEL(SUCCESS):
      return {
        ...state,
        messages: updateStore(state.messages, action.payload, {
          method: listUpdateStrategyMethods.REMOVE,
          by: ["id", "uniqueId"],
          or: true
        })
      };
    default:
      return state;
  }
};


export const threadCheckedMessageListReducer = (state = [], action) => {
  switch (action.type) {
    case THREAD_CHECKED_MESSAGE_LIST_EMPTY:
      return [];
    case THREAD_CHECKED_MESSAGE_LIST_ADD:
      return updateStore(state, action.payload, {
        method: listUpdateStrategyMethods.UPDATE,
        by: "uniqueId",
        upsert: true
      }).sort((a, b) => a.time - b.time);
    case THREAD_CHECKED_MESSAGE_LIST_REMOVE:
      return updateStore(state, action.payload.uniqueId, {method: "REMOVE", by: "uniqueId"});
    default:
      return state;
  }
};

export const threadParticipantListReducer = (state = {
  participants: [],
  threadId: null,
  hasNext: false,
  nextOffset: 0,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_PARTICIPANT_GET_LIST(PENDING):
      return {...state, ...stateGenerator(PENDING, {participants: state.participants})};
    case THREAD_PARTICIPANT_GET_LIST(CANCELED):
      return {...state, ...{participants: [], hasNext: false, nextOffset: 0}};
    case THREAD_PARTICIPANTS_LIST_CHANGE:
    case THREAD_PARTICIPANT_GET_LIST(SUCCESS): {

      if (action.type === THREAD_PARTICIPANTS_LIST_CHANGE) {
        if (state.threadId !== action.payload.threadId) {
          return state;
        }
      }
      const {participants, hasNext, nextOffset, threadId} = action.payload;
      return {
        ...state, ...stateGenerator(SUCCESS, {
          participants, hasNext, nextOffset, threadId
        })
      };
    }
    case THREAD_PARTICIPANT_GET_LIST_PARTIAL(SUCCESS): {
      const {participants, hasNext, nextOffset} = action.payload;
      return {
        ...state, ...stateGenerator(SUCCESS, {
          hasNext,
          nextOffset,
          participants: state.participants.concat(participants)
        })
      };
    }
    case THREAD_PARTICIPANTS_REMOVED:
    case THREAD_LEAVE_PARTICIPANT:
      return {
        ...state, ...stateGenerator(SUCCESS, {
          participants: updateStore(state.participants, action.payload, {
            method: listUpdateStrategyMethods.REMOVE,
            by: ["id", "threadId"]
          })
        })
      };
    case THREAD_PARTICIPANT_GET_LIST(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};

export const threadParticipantListPartialReducer = (state = {
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_PARTICIPANT_GET_LIST_PARTIAL(CANCELED):
      return {...state, ...stateGenerator(CANCELED)};
    case THREAD_PARTICIPANT_GET_LIST_PARTIAL(PENDING):
      return {...state, ...stateGenerator(PENDING)};
    case THREAD_PARTICIPANT_GET_LIST_PARTIAL(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS)};
    default:
      return state;
  }
};

export const threadNotificationReducer = (state = {
  threadId: null,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_NOTIFICATION(PENDING):
      return {...state, ...stateGenerator(PENDING)};
    case THREAD_NOTIFICATION(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS, action.payload, "threadId")};
    case THREAD_NOTIFICATION(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};

export const threadParticipantAddReducer = (state = {
  thread: null,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case THREAD_PARTICIPANT_ADD(PENDING):
      return {...state, ...stateGenerator(PENDING, null, "thread")};
    case THREAD_PARTICIPANT_ADD(SUCCESS): {
      let thread = action.payload;
      thread.timestamp = getNow();
      return {...state, ...stateGenerator(SUCCESS, thread, "thread")};
    }
    case THREAD_PARTICIPANT_ADD(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};