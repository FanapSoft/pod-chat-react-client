import React from "react";
import {ifvisible} from "ifvisible.js";
import queryString from "query-string";
import {getImage as getImageFromHashMap} from "../utils/hashmap";
import {emoji, emojiCategories, emojiSpriteDimensions, emojiSpriteMeta} from "../constants/emoji";
import sanitizeHTML from "sanitize-html";
import {sanitizeRule} from "../app/_component/Input";
import date from "./date";
import strings from "../constants/localization";
import classnames from "classnames";
import emojiStyle from "../../styles/utils/emoji.scss";
import oneoneImage from "../../styles/images/_common/oneone.png";
import ReactDOMServer from "react-dom/server";
import {typesCode} from "../constants/messageTypes";
import checkForPrivilege from "./privilege";
import {THREAD_ADMIN} from "../constants/privilege";
import {Text} from "../../../pod-chat-ui-kit/src/typography";


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

export function avatarUrlGenerator(url, size, metadata, directCall) {
  if (metadata) {
    const sizes = {
      SMALL: 1,
      MEDIUM: 2,
      LARGE: 3,
      XLARGE: 3
    };
    if (metadata) {
      const {fileHash} = metadata;
      if (fileHash) {
        return getImageFromHashMap(fileHash, sizes[size], 1, directCall ? directCall : "avatar", directCall ? this.props.dispatch : this, false, directCall);
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


export function OnWindowFocusInOut(onFocusedOut = () => {
}, onFocusedIn = () => {
}) {
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

export function isMessageIsFile(message) {
  if (message) {
    if (message.metadata) {
      if (typeof message.metadata === "object") {
        return message.metadata.file;
      }
      return JSON.parse(message.metadata).file;
    }
  }
}

export function isMessageIsNewFile(message) {
  const {fileHash} = getMessageMetaData(message);
  if (fileHash) {
    return fileHash
  }
  return false;
}

export function isMessageByMe(message, user, thread) {
  if (thread && user) {
    const isGroup = thread.group;
    if (isGroup) {
      if (thread.type === 8) {
        if (thread.inviter.id === user.id) {
          return true;
        }
      }
    }
  }
  if (message) {
    if (message) {
      if (!message.id) {
        return true;
      }
      if (user) {
        return message.participant.id === user.id;
      }
    }
  }
}


export function prettifyMessageDate(passedTime) {
  const isToday = date.isToday(passedTime);
  const isYesterday = date.isYesterday(passedTime);
  const isWithinAWeek = date.isWithinAWeek(passedTime);
  if (isToday) {
    return date.format(passedTime, "HH:mm", "en")
  } else if (isYesterday) {
    return strings.yesterday;
  } else if (isWithinAWeek) {
    return date.format(passedTime, "dddd");
  }
  return date.format(passedTime, "YYYY-MM-DD");
}

export function checkForMediaAccess() {

  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    // Firefox 38+ seems having support of enumerateDevicesx
    navigator.enumerateDevices = function (callback) {
      navigator.mediaDevices.enumerateDevices().then(callback);
    };
  }

  var MediaDevices = [];
  var isHTTPs = location.protocol === 'https:';
  var canEnumerate = false;

  if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
    canEnumerate = true;
  } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
    canEnumerate = true;
  }

  var hasMicrophone = false;
  var hasSpeakers = false;
  var hasWebcam = false;

  var isMicrophoneAlreadyCaptured = false;
  var isWebcamAlreadyCaptured = false;

  function checkDeviceSupport(callback) {
    if (!canEnumerate) {
      return;
    }

    if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
      navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
    }

    if (!navigator.enumerateDevices && navigator.enumerateDevices) {
      navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
    }

    if (!navigator.enumerateDevices) {
      if (callback) {
        callback();
      }
      return;
    }

    MediaDevices = [];
    navigator.enumerateDevices(function (devices) {
      devices.forEach(function (_device) {
        var device = {};
        for (var d in _device) {
          device[d] = _device[d];
        }

        if (device.kind === 'audio') {
          device.kind = 'audioinput';
        }

        if (device.kind === 'video') {
          device.kind = 'videoinput';
        }

        var skip;
        MediaDevices.forEach(function (d) {
          if (d.id === device.id && d.kind === device.kind) {
            skip = true;
          }
        });

        if (skip) {
          return;
        }

        if (!device.deviceId) {
          device.deviceId = device.id;
        }

        if (!device.id) {
          device.id = device.deviceId;
        }

        if (!device.label) {
          device.label = 'Please invoke getUserMedia once.';
          if (!isHTTPs) {
            device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
          }
        } else {
          if (device.kind === 'videoinput' && !isWebcamAlreadyCaptured) {
            isWebcamAlreadyCaptured = true;
          }

          if (device.kind === 'audioinput' && !isMicrophoneAlreadyCaptured) {
            isMicrophoneAlreadyCaptured = true;
          }
        }

        if (device.kind === 'audioinput') {
          hasMicrophone = true;
        }

        if (device.kind === 'audiooutput') {
          hasSpeakers = true;
        }

        if (device.kind === 'videoinput') {
          hasWebcam = true;
        }

        // there is no 'videoouput' in the spec.

        MediaDevices.push(device);
      });

      if (callback) {
        callback();
      }
    });
  }

  return new Promise(resolve => {
    checkDeviceSupport(function () {
      resolve({
        hasWebcam,
        hasMicrophone,
        isMicrophoneAlreadyCaptured,
        isWebcamAlreadyCaptured
      });
    });
  })
}

export function isChannel(thread) {
  if (thread.group) {
    if (thread.type === 8) {
      return true;
    }
  }
  return false;
}

export function isGroup(thread) {
  if (thread.group) {
    if (thread.type !== 8) {
      return true;
    }
  }
  return false;
}

export function isP2PThread(thread) {
  return !(isGroup(thread) && isChannel(thread));
}

export function isThreadOwner(thread, user) {
  if (!thread || !user) {
    return false
  }
  return thread.inviter.id === user.id;
}

export function socketStatus(chatState) {
  const isReconnecting = chatState.socketState == 1 && !chatState.deviceRegister;
  const isConnected = chatState.socketState == 1 && chatState.deviceRegister;
  const isDisconnected = chatState.socketState == 3;
  return {isReconnecting, isConnected, isDisconnected, timeUntilReconnect: chatState.timeUntilReconnect};
}

export function routeChange(history, route, chatRouterLess) {
  if (!chatRouterLess) {
    history.push(route);
  }
}


function buildEmojiIcon(sizeX, sizeY, catName, emoji) {
  const {scale} = emojiSpriteMeta;
  const classNames = classnames({
    [emojiStyle.emoji]: true,
    [emojiStyle["emoji-inline"]]: true,
    [emojiStyle[`emojisprite-${catName}`]]: true
  });
  const img = <img className={classNames}
                   alt={emoji}
                   src={oneoneImage}
                   style={{backgroundPosition: `${+sizeX / scale}px ${+sizeY / scale}px`}}/>;
  return ReactDOMServer.renderToStaticMarkup(img);
}


//EMOJI DECODER SECTION
const {size, scale} = emojiSpriteMeta;

function emojiUnicode(emojie) {
  for (const em in emoji) {
    if (emoji[em][0] === emojie) {
      return em;
    }
  }
}

export function emojiRegex() {
  return new RegExp('\\u0023\\u20E3|\\u00a9|\\u00ae|\\u203c|\\u2049|\\u2139|[\\u2194-\\u2199]|\\u21a9|\\u21aa|\\u231a|\\u231b|\\u23e9|[\\u23ea-\\u23ec]|\\u23f0|\\u24c2|\\u25aa|\\u25ab|\\u25b6|\\u2611|\\u2614|\\u26fd|\\u2705|\\u2709|[\\u2795-\\u2797]|\\u27a1|\\u27b0|\\u27bf|\\u2934|\\u2935|[\\u2b05-\\u2b07]|\\u2b1b|\\u2b1c|\\u2b50|\\u2b55|\\u3030|\\u303d|\\u3297|\\u3299|[\\uE000-\\uF8FF\\u270A-\\u2764\\u2122\\u25C0\\u25FB-\\u25FE\\u2615\\u263a\\u2648-\\u2653\\u2660-\\u2668\\u267B\\u267F\\u2693\\u261d\\u26A0-\\u26FA\\u2708\\u2702\\u2601\\u260E]|[\\u2600\\u26C4\\u26BE\\u23F3\\u2764]|\\uD83D[\\uDC00-\\uDFFF]|\\uD83C[\\uDDE8-\\uDDFA\uDDEC]\\uD83C[\\uDDEA-\\uDDFA\uDDE7]|[0-9]\\u20e3|\\uD83C[\\uDC00-\\uDFFF]', "ig")
}

function generatePosition(emojiCat, index) {
  const {columns} = emojiSpriteDimensions[emojiCat];
  const currentColumn = Math.floor(index / columns);
  return {
    x: index > 0 ? -(index * size) : 0,
    y: -(currentColumn * size)
  };
}

export function decodeEmoji(string) {
  if (!string) {
    return string;
  }

  let decodedEmoji = string.replace(emojiRegex(), match => {
    let cat = 0;
    for (const emojiCategory of emojiCategories) {
      let emojiIndex = emojiCategory.findIndex(e => emoji[e][0] === match);
      if (emojiIndex > -1) {
        const {x, y} = generatePosition(cat, emojiIndex);
        return buildEmojiIcon(x, y, cat, match)
      }
      cat++;
    }
    return match;
  });

  return decodedEmoji.replace(/:emoji#.+?:/g, match => {
    const realMatch = match.substring(1, match.length - 1);
    const split = realMatch.split("#");
    if (!split[2]) {
      return string;
    }
    const size = split[2].split("*");
    return buildEmojiIcon(size[0], size[1], 0, match);
  });
}

//**************//

export function clearHtml(html, clearTags) {
  if (!html) {
    return html;
  }
  return sanitizeHTML(html, sanitizeRule(clearTags)).trim();
  const document = window.document.createElement("div");
  document.innerHTML = html;
  const children = Array.from(document.childNodes);
  const removingIndexes = [];
  const clonedChildren = [...children].reverse();
  for (let child of clonedChildren) {
    if (child.data) {
      break;
    }
    if (child.innerText === "\n") {
      removingIndexes.push(children.indexOf(child));
      continue;
    }
    break;
  }
  let filterChildren = [];
  if (removingIndexes.length) {
    let index = 0;
    for (const child of children) {
      if (removingIndexes.indexOf(index) === -1) {
        filterChildren.push(child);
      }
      index++;
    }
  } else {
    filterChildren = children;
  }
  const newText = window.document.createElement("div");

  filterChildren.map(e => {
    let node = e;
    if (clearTags) {
      if (e.tagName === "BR") {
        node = window.document.createTextNode("\n");
      } else if (e.tagName === "DIV") {
        let countOfN = "";
        if (e.children.length) {
          for (const child of e.children) {
            if (child.tagName === "BR") {
              countOfN += "\n";
            }
          }
        } else {
          countOfN = `\n${e.innerText}`
        }
        node = window.document.createTextNode(countOfN);
      }
    }
    newText.appendChild(node)
  });

}

export function getMessageMetaData(message) {
  if (!message.metadata) {
    return {};
  }
  try {
    return typeof message.metadata === "string" ? JSON.parse(message.metadata) : message.metadata;
  } catch (e) {
    return {};
  }

}

export function showMessageNameOrAvatar(message, messages) {
  const msgOwnerId = message.participant.id;
  const msgId = message.id || message.uniqueId;
  const index = messages.findIndex(e => e.id === msgId || e.uniqueId === msgId);
  if (~index) {
    const lastMessage = messages[index - 1];
    if (lastMessage) {
      if (lastMessage.participant.id === msgOwnerId) {
        return false;
      }
    }
    return true;
  }
}

export function messageSelectedCondition(message, threadCheckedMessageList) {
  const fileIndex = threadCheckedMessageList.findIndex((msg => msg.uniqueId === message.uniqueId));
  return fileIndex >= 0;
}

export function findLastSeenMessage(messages) {
  const newMessages = [...messages].reverse();
  for (const message of newMessages) {
    if (message.seen) {
      return message.time;
    }
  }
}

export function isMessageIsImage({messageType}) {
  if (messageType) {
    return messageType === typesCode.POD_SPACE_PICTURE;
  }
}

export function isMessageIsVideo({messageType}) {
  if (messageType) {
    return messageType === typesCode.POD_SPACE_VIDEO;
  }
}

export function isMessageIsSound({messageType}) {
  if (messageType) {
    return messageType === typesCode.POD_SPACE_SOUND;
  }
}

export function isMessageIsVoice({messageType}) {
  if (messageType) {
    return messageType === typesCode.POD_SPACE_VOICE;
  }
}

export function isMessageIsDownloadable(message) {
  if (isMessageIsFile(message)) {
    return message.id;
  }
  return false;
}

export function isMessageIsUploading(message) {
  return !message.id;
}

export function isMessageHasError(message) {
  if (message.state === "UPLOAD_ERROR") {
    return true;
  }
}

export function messageDeleteForAllCondition(message, user, thread) {
  return checkForPrivilege(thread, THREAD_ADMIN) || (message.deletable && ((isMessageByMe(message, user))));
}

export function getImage({link, file}, isFromServer, smallVersion) {
  let imageLink = file.link;
  let width = file.actualWidth;
  let height = file.actualHeight;

  const ratio = height / width;
  if (ratio < 0.15 || ratio > 7) {
    return false;
  }
  const maxWidth = smallVersion || window.innerWidth <= 700 ? 190 : ratio >= 2 ? 200 : 300;
  height = Math.ceil(maxWidth * ratio);
  if (!isFromServer) {
    return {imageLink, width: maxWidth, height};
  }
  return {
    width: maxWidth,
    height
  };
}

export function messageDatePetrification(time) {
  const correctTime = time / Math.pow(10, 6);
  return date.isToday(correctTime) ? date.format(correctTime, "HH:mm") : date.isWithinAWeek(correctTime) ? date.format(correctTime, "dddd HH:mm") : date.format(correctTime, "YYYY-MM-DD  HH:mm");
}

export function urlify(text) {
  if (!text) {
    return "";
  }
  text = text.replace(/<br\s*[\/]?>/gi, "\n");
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    const urlReal = url.replace(/&amp;/g, "&");
    return ReactDOMServer.renderToStaticMarkup(<Text link={urlReal} target="_blank" wordWrap="breakWord"
                                                     title={urlReal}>{urlReal}</Text>)
  })
}

export function mentionify(text, onClick) {
  if (!text) {
    return "";
  }
  text = text.replace(/<br\s*[\/]?>/gi, "\n");
  var mentionRegex = /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/._-]{1,15})(?:\b(?!@|＠)|$)/g;
  return text.replace(mentionRegex, function (username) {
    const realUserName = username.replace(/&amp;/g, "&");
    return `<span onClick='window.onUserNameClick(this)'>${ReactDOMServer.renderToStaticMarkup(
      <Text color="accent" dark bold wordWrap="breakWord" inline title={realUserName}>{realUserName}</Text>)}</span>`;
  })
}

export function emailify(text) {
  if (!text) {
    return "";
  }
  text = text.replace(/<br\s*[\/]?>/gi, "\n");
  var mailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
  return text.replace(mailRegex, function (mail) {
    const urlReal = mail.replace(/&amp;/g, "&");
    return ReactDOMServer.renderToStaticMarkup(<Text link={`mailto:${urlReal}`} target="_blank" wordWrap="breakWord"
                                                     title={urlReal}>{urlReal}</Text>)
  });
}
