// src/actions/messageActions.js
import {USER_GET} from "../constants/actionTypes";

export const userGet = (chatSDK) => {
  return (dispatch) => {
    dispatch({
      type: USER_GET(),
      payload: chatSDK.getUserInfo()
    });
  }
};
