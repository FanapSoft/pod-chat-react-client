import {createStore, applyMiddleware, combineReducers} from "redux";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";
import combinedReducer from "../reducers/index";
import {CHAT_DESTROY} from "../constants/actionTypes";

const appReducer = combineReducers(combinedReducer);
const rootReducer = (state, action) => {
  if (action.type === CHAT_DESTROY) {
    state = undefined;
  }
  return appReducer(state, action);
};

const store = createStore(rootReducer, applyMiddleware(promise, thunk));

export default store;