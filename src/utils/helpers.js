import {ifvisible} from "ifvisible.js";
import queryString from "query-string";
import {serverConfig} from "../constants/connection";
import {messageGetImage} from "../actions/messageActions";
import {threadThumbnailUpdate} from "../actions/threadActions";
import {chatGetImage, chatFileHashCodeUpdate, chatGetFile, chatCancelFileDownload} from "../actions/chatActions";

export function humanFileSize(bytes, si) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

export function mobileCheck() {
  var check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

export function isIosAndSafari() {
  var ua = window.navigator.userAgent;
  var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  var webkit = !!ua.match(/WebKit/i);
  return iOS && webkit && !ua.match(/CriOS/i);
}

export function isNodeDescendant(parent, child) {
  var node = child.parentNode;
  while (node != null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

export function isContains(flds, keyword, arr) {
  const fields = flds.split('|');
  if (!keyword || !keyword.trim()) {
    return arr;
  }

  return arr.filter(item => {
    for (const field of fields) {
      const value = item[field];
      if (value) {
        if (value.indexOf(keyword) > -1) {
          return true;
        }
      }
    }
  })
}

export function avatarNameGenerator(firstName, lastName) {
  if (firstName) {
    firstName = firstName.replace(/ +(?= )/g, "");
  }
  if (lastName) {
    lastName = lastName.replace(/ +(?= )/g, "");
  }
  const colorLogic = {
    "0-20": "#d30850",
    "20-40": "#96cef3",
    "40-60": "#ffc900",
    "60-80": "#2e5f68",
    "80-100": "#20c174",
    "100-120": "#608fff",
    "120-200": "#7fa196",

    "1500-1550": "#d30850",
    "1550-1600": "#20c174",
    "1600-1620": "#ffc900",
    "1620-1680": "#2e5f68",
    "1680-1700": "#96cef3",
    "1700-1750": "#608fff",
    "1750-1800": "#7fa196"
  };
  if (!firstName) {
    return {
      letter: "",
      color: colorLogic['1500-1550']
    }
  }

  function getColor(letter) {
    let code = letter.charCodeAt(0);
    if (letter.length > 1) {
      code = code - (code - letter[1].charCodeAt(0));
    }
    const realLetter = letter.length > 1 ? `${letter[0]}\xa0${letter[1]}` : letter;
    for (const range in colorLogic) {
      const split = range.split('-');
      const lowRange = +split[0];
      const highRange = +split[1];
      if (code >= lowRange && code < highRange) {
        return {
          letter: realLetter,
          color: colorLogic[range]
        }
      }
    }
    return {
      letter: realLetter,
      color: colorLogic['1500-1550']
    }
  }

  if (!firstName) {
    return;
  }
  firstName = firstName.trim();
  if (!firstName) {
    return {
      letter: "",
      color: colorLogic[0]
    }
  }
  if (!lastName) {
    const split = firstName.split(" ");
    if (split.length <= 1) {
      return getColor(firstName[0]);
    }
    return getColor(`${split[0][0]}${split[1][0]}`);
  }
  return getColor(`${firstName[0]}${lastName[1]}`);

}

export function getFileDownloadingFromHashMap(id) {
  const {chatFileHashCodeMap} = this.props;
  let result = chatFileHashCodeMap.find(e => e.id === id);
  if (result) {
    const {result: status} = result;
    if (status.indexOf("blob") > -1) {
      return status;
    } else {
      if (status === "LOADING") {
        return true;
      }
    }
  }
  return false;
}


export function cancelFileDownloadingFromHashMap(id) {
  const {dispatch, chatFileHashCodeMap} = this.props;
  let result = chatFileHashCodeMap.find(e => e.id === id);
  if (result) {
    const {result: status, cancelId} = result;
    if (status === "LOADING") {
      dispatch(chatCancelFileDownload(cancelId));
      dispatch(chatFileHashCodeUpdate(id, true));
      return true;
    }
  }
  return false;
}


export function getImageFromHashMap(hashCode, size, quality) {
  const id = `${hashCode}-${size}-${quality}`;
  const {dispatch} = this.props;
  const downloadingResult = getFileDownloadingFromHashMap.call(this, id);
  if (downloadingResult) {
    return downloadingResult;
  }
  dispatch(chatFileHashCodeUpdate({id, result: "LOADING"}));
  dispatch(chatGetImage(hashCode, size, quality)).then(result => {
    dispatch(chatFileHashCodeUpdate({id, result: URL.createObjectURL(result)}));
  });
  return id;
}

export function getFileFromHashMap(hashCode, metadata) {
  const id = hashCode;
  const {dispatch} = this.props;
  const downloadingResult = getFileDownloadingFromHashMap.call(this, id);
  if (downloadingResult) {
    return downloadingResult;
  }
  return dispatch(chatGetFile(hashCode, result => {
    dispatch(chatFileHashCodeUpdate({id, result: URL.createObjectURL(result), metadata}));
  })).then(downloadingUniqueId => {
    dispatch(chatFileHashCodeUpdate({id, result: "LOADING", cancelId: downloadingUniqueId, metadata}));
  });
}

export function avatarUrlGenerator(url, size, metadata) {
  if (metadata) {
    const sizes = {
      SMALL: 1,
      MEDIUM: 2,
      LARGE: 3,
      XLARGE: 3
    };
    if (metadata) {
      metadata = JSON.parse(metadata);
      const {fileHash} = metadata;
      if (fileHash) {
        return getImageFromHashMap.apply(this, [fileHash, sizes[size], 1]);
      }
    }
  }
  if (!url) {
    return url;
  }
  const sizes = {
    SMALL: 48,
    MEDIUM: 64,
    LARGE: 128,
    XLARGE: 256
  };
  if (!size in sizes) {
    return url;
  }
  const splittedUrl = url.split("?");
  const parsedUrl = queryString.parse(splittedUrl[1]);
  const currentWidth = parsedUrl.width;
  const currentHeight = parsedUrl.height;
  if (!currentHeight || !currentWidth) {
    return url;
  }
  let width, height;
  const widthToHeightRatio = currentHeight / currentWidth;
  if (currentHeight > currentWidth) {
    height = sizes[size];
    width = Math.floor(height / widthToHeightRatio);
  } else {
    width = sizes[size];
    height = Math.floor(width * widthToHeightRatio);
  }

  return `${splittedUrl[0]}?imageId=${parsedUrl.imageId}&hashCode=${parsedUrl.hashCode}&width=${width}&height=${height}`;
}

avatarUrlGenerator.SIZES = {
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  LARGE: "LARGE",
  XLARGE: "XLARGE"
};


export function OnWindowFocusInOut(onFocusedOut, onFocusedIn) {
  ifvisible.on("blur", onFocusedOut);
  ifvisible.on("focus", onFocusedIn);
  window.addEventListener("blur", onFocusedOut);
  window.addEventListener("focus", onFocusedIn);
}

export function getNow() {
  if (window._universalTalkTimerDiff) {
    const now = Date.now();
    return new Date(now - window._universalTalkTimerDiff).getTime();
  } else {
    return Date.now();
  }
}

export function isImageFile(file) {
  return file.type.match(/image\/jpeg|image\/png/gm);
}

export function isVideoFile(file) {
  return file.type.match(/mp4|ogg|3gp|ogv/);
}

export function isAudioFile(file) {
  return file.type.match(/audio.*/);
}

export function isFile(file) {
  return !isVideoFile(file) && !isImageFile(file);
}