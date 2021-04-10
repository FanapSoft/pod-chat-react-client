import {chatCancelFileDownload, chatGetFile, chatGetImage} from "../actions/chatActions";

export function getFileDownloading(id) {
  if (!window.podspaceHashmap) {
    window.podspaceHashmap = {};
  }
  const result = window.podspaceHashmap[id];
  if (result) {
    if (result.indexOf("http") > -1) {
      return result;
    } else if (result === "LOADING") {
      return true;
    }
  }
  return null;
}

function checkForDownloadResult(id, directCall, component, init, fieldKey) {
  const downloadingResult = getFileDownloading(id);
  if (downloadingResult) {
    return downloadingResult;
  }
  const lastResult = window.podspaceHashmap[id] || "";
  if (lastResult.indexOf("FAIL") < 0) {
    if (!init) {
      if (directCall) {
        fieldKey(window.podspaceHashmap[id] = "LOADING")
      } else {
        component.setState({
          [fieldKey]: window.podspaceHashmap[id] = "LOADING"
        });
      }
    }
  }
}

function postDownload(id, promised, directCall, fieldKey, downloadResult, component, params, failCallBack, dontCheckFail) {
  promised.then(result => {
    const fixedResult = params && params.responseType === "link" ? result : URL.createObjectURL(result);
    if (directCall) {
      fieldKey(window.podspaceHashmap[id] = fixedResult)
    } else {
      component.setState({
        [fieldKey]: window.podspaceHashmap[id] = fixedResult
      });
    }
  }, result => {
    if(dontCheckFail) {
      return;
    }
    const failCount = downloadResult ? +downloadResult.split("-")[1] ? +downloadResult.split("-")[1] : 1 : 1;
    if (failCount >= 3) {
      return;
    }
    window.podspaceHashmap[id] = `FAIL-${failCount + 1}`;
    failCallBack();
  });
}

export function cancelDownload(id, dispatch) {
  const cancelId = window.podspaceHashmap[`${id}-cancelId`];
  if (cancelId) {
    window.podspaceHashmap[`${id}-cancelId`] = window.podspaceHashmap[id] = null;
    dispatch(chatCancelFileDownload(cancelId));
  }
}

export function getImage(hashCode, size, quality, fieldKey, component, init, directCall, params) {
  const id = `${hashCode}-${size}-${quality}`;
  const dispatch = directCall ? component : component.props.dispatch;
  const downloadResult = checkForDownloadResult(id, directCall, component, init, fieldKey);
  if (downloadResult) {
    return downloadResult;
  }
  const promised = dispatch(chatGetImage(hashCode, size, quality, params));
  postDownload(id, promised, directCall, fieldKey, downloadResult, component, params, () => {} /*getImage.apply(null, arguments)*/);
  return init ? "LOADING" : downloadResult;
}


export function getFile(hashCode, fieldKey, component, init, directCall, params) {
  const id = hashCode;
  const dispatch = directCall ? component : component.props.dispatch;
  const downloadResult = checkForDownloadResult(id, directCall, component, init, fieldKey);
  if (downloadResult) {
    return downloadResult;
  }
  const promised = dispatch(chatGetFile(hashCode, downloadingUniqueId => {
    if (downloadingUniqueId) {
      window.podspaceHashmap[`${id}-cancelId`] = downloadingUniqueId;
    }
  }, params));
  postDownload(id, promised, directCall, fieldKey, downloadResult, component, params, () => {}/*getFile.apply(null, arguments)*/, true);
  return init ? "LOADING" : downloadResult;
}

export function updateLink(hashCode, dispatch) {

  return new Promise((resolve, reject) => {
    dispatch(chatGetFile(hashCode, e=>{}, {responseType: "link"})).then(result => {
      const downloadingResult = getFileDownloading(hashCode);
      resolve(result);
      if (downloadingResult === result) {
        return;
      }
      return window.podspaceHashmap[hashCode] = result;
    });
  })
}
