import {
  CHAT_GET_INSTANCE,
  CHAT_MODAL_PROMPT_SHOWING,
  CHAT_SMALL_VERSION,
  CHAT_STATE,
  CHAT_ROUTER_LESS,
  CHAT_SEARCH_RESULT,
  CHAT_SEARCH_SHOW,
  CHAT_NOTIFICATION,
  CHAT_NOTIFICATION_CLICK_HOOK,
  CHAT_RETRY_HOOK,
  CHAT_SIGN_OUT_HOOK,
  CHAT_IMAGE_HASH_CODE_UPDATE
} from "../constants/actionTypes";
import {listUpdateStrategyMethods, stateGenerator, stateGeneratorState, updateStore} from "../utils/storeHelper";
const {SUCCESS} = stateGeneratorState;

export const chatInstanceReducer = (state = {
  chatSDK: null,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case CHAT_GET_INSTANCE("PENDING"):
      return {...state, ...stateGenerator("PENDING")};
    case CHAT_GET_INSTANCE("SUCCESS"):
      return {...state, ...stateGenerator("SUCCESS", action.payload, "chatSDK")};
    case CHAT_GET_INSTANCE("ERROR"):
      return {...state, ...stateGenerator("ERROR", action.payload)};
    default:
      return state;
  }
};

export const chatImageHashCodeUpdateReducer = (state = {
  hashCodeMap: [],
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case CHAT_IMAGE_HASH_CODE_UPDATE:
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.hashCodeMap, action.payload, {
          method: listUpdateStrategyMethods.UPDATE,
          upsert: true,
          by: "id"
        }), "hashCodeMap")
      };
    default:
      return state;
  }
};

export const chatSmallVersionReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_SMALL_VERSION:
      return action.payload;
    default:
      return state;
  }
};

export const chatRouterLessReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_ROUTER_LESS:
      return action.payload;
    default:
      return state;
  }
};

export const chatNotificationReducer = (state = true, action) => {
  switch (action.type) {
    case CHAT_NOTIFICATION:
      return action.payload;
    default:
      return state;
  }
};

export const chatNotificationClickHookReducer = (state = null, action) => {
  switch (action.type) {
    case CHAT_NOTIFICATION_CLICK_HOOK:
      return action.payload;
    default:
      return state;
  }
};

export const chatRetryHookReducer = (state = null, action) => {
  switch (action.type) {
    case CHAT_RETRY_HOOK:
      return action.payload;
    default:
      return state;
  }
};

export const chatSignOutHookReducer = (state = null, action) => {
  switch (action.type) {
    case CHAT_SIGN_OUT_HOOK:
      return action.payload;
    default:
      return state;
  }
};

export const chatStateReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_STATE:
      return action.payload;
    default:
      return state;
  }
};

export const chatSearchShowReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_SEARCH_SHOW:
      return action.payload;
    default:
      return state;
  }
};

export const chatSearchResultReducer = (state = false, action) => {
  switch (action.type) {
    case CHAT_SEARCH_RESULT:
      if (action.payload.isShowing) {
        return action.payload;
      } else {
        return false;
      }
    default:
      return state;
  }
};

export const chatModalPromptReducer = (state = {
  isShowing: false,
  message: null,
  confirmText: null,
  onApply: e => {
  },
  onCancel: e => {
  }
}, action) => {
  switch (action.type) {
    case CHAT_MODAL_PROMPT_SHOWING:
      return action.payload;
    default:
      return state;
  }
};