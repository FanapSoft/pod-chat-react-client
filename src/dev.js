import React from "react";
import {BrowserRouter} from "react-router-dom";
import ReactDOM, {render} from "react-dom";
import {Provider} from "react-redux";
import {serverConfig} from "./constants/connection";
import store from "./store/index";
import "../styles/main.scss";
import "../styles/layout/defualt.scss";
import Index from "./app";
import {auth, retry} from "podauth/src/auth";
import SupportModule from "./app/SupportModule";

function renderPodchat(token) {
  // supportMode={8453}
  render(
    <Provider store={store}>
      <BrowserRouter>
        <SupportModule>
          <Index token={token}  {...serverConfig} onRetryHook={e => {
            return retry();
          }}/>
        </SupportModule>
      </BrowserRouter>
    </Provider>,
    document.getElementById("app")
  );
}

auth({
  clientId: "2051121e4348af52664cf7de0bda",
  scope: "social:write",
  ssoBaseUrl: "https://accounts.pod.ir/oauth2",
  onNewToken: renderPodchat
});


function DestroyPodchat(elementId) {
  ReactDOM.unmountComponentAtNode(document.getElementById(elementId));
}

window.DestroyPodchat = DestroyPodchat;
window.RenderPodchat = renderPodchat;