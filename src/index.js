import React from "react";
import ReactDOM, {render} from "react-dom";
import {Provider} from "react-redux";
import store from "./store/index";
import "../styles/main.scss";
import Index from "./app";
import {BrowserRouter} from "react-router-dom";
import SupportModule from "./app/SupportModule";


function PodchatJSX(props) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SupportModule supportMode={props && props.supportMode}>
          <Index {...props}/>
        </SupportModule>
      </BrowserRouter>
    </Provider>
  );
}

function Podchat(props, elementId) {
  let instance;

  render(
    <Provider store={store}>
      <BrowserRouter>
        <SupportModule supportMode={props && props.supportMode}>
          <Index {...props} wrappedComponentRef={e => instance = e}/>
        </SupportModule>
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