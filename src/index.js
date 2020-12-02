import React from "react";
import ReactDOM, {render} from "react-dom";
import {Provider} from "react-redux";
import store from "./store/index";
import "../styles/main.scss";
import Box from "./app";
import {BrowserRouter} from "react-router-dom";


function PodchatJSX(props) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Box {...props}/>
      </BrowserRouter>
    </Provider>
  );
}

function Podchat(props, elementId) {
  let instance;
  render(
    <Provider store={store}>
      <BrowserRouter>
        <Box {...props} wrappedComponentRef={e => instance = e}/>
      </BrowserRouter>
    </Provider>,
    document.getElementById(elementId)
  );
  return instance;
}

function DestroyPodchat(elementId) {
  ReactDOM.unmountComponentAtNode(document.getElementById(elementId));
}

export {PodchatJSX, Podchat};

window.Podchat = Podchat;
window.DestroyPodchat = DestroyPodchat;