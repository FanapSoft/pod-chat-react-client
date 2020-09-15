import {USER_GET} from "../constants/actionTypes";
import {stateGenerator} from "../utils/storeHelper";

export default (state = {
  user: {},
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case USER_GET("PENDING"):
      return {...state, ...stateGenerator("PENDING")};
    case USER_GET("SUCCESS"):
      return {...state, ...stateGenerator("SUCCESS", action.payload, "user")};
    case USER_GET("ERROR"):
      return {...state, ...stateGenerator("ERROR", action.payload)};
    default:
      return state;
  }
};