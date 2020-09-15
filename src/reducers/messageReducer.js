import {
  MESSAGE_EDITING,
  MESSAGE_NEW,
  MESSAGE_PINNED,
  MESSAGE_SEND
} from "../constants/actionTypes";
import {stateGenerator, stateGeneratorState} from "../utils/storeHelper";
const {PENDING, SUCCESS} = stateGeneratorState;

export const messageEditingReducer = (state = null, action) => {
  switch (action.type) {
    case MESSAGE_EDITING:
      return action.payload;
    default:
      return state;
  }
};

export const messageNewReducer = (state = null, action) => {
  switch (action.type) {
    case MESSAGE_NEW:
    case MESSAGE_SEND(SUCCESS):
      return action.payload;
    default:
      return state;
  }
};

export const messagePinnedReducer = (state = null, action) => {
  switch (action.type) {
    case MESSAGE_PINNED:
      return action.payload;
    default:
      return state;
  }
};