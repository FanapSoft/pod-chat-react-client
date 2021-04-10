// src/list/BoxScene.js
import React, {Component, Fragment} from "react";
import {isChannel, isGroup, isMessageIsFile, isMessageByMe} from "../utils/helpers";
import {connect} from "react-redux";
import "moment/locale/fa";
import Push from "push.js";
import MetaTags from "react-meta-tags";

//strings

//actions
import {threadCreateWithExistThread} from "../actions/threadActions";
import strings from "../constants/localization";
import notifcationSound from "../constants/notification-sound.mp3"
import checkForPrivilege from "../utils/privilege";
import {THREAD_ADMIN} from "../constants/privilege";

//components

//styling
const defaultAvatar = "../../../styles/images/_common/default-avatar.png";

@connect(store => {
  return {
    chatNotification: store.chatNotification,
    chatNotificationClickHook: store.chatNotificationClickHook,
    threads: store.threads.threads,
    messageNew: store.messageNew,
    supportMode: store.chatSupportMode,
    messagePinned: store.messagePinned,
    user: store.user.user,
    chatInstance: store.chatInstance.chatSDK,
  };
})
export default class Notification extends Component {

  constructor(props) {
    super(props);
    if (!Push.Permission.has()) {
      Push.Permission.request();
    }
    this.state = {
      defaultTitle: window.document.title || "...",
      title: this.props.title,
      showLastThread: false,
      thread: null,
      count: 0
    };
    this.threads = {};
    window.addEventListener("focus", () => {
      this.setState({
        thread: null,
        count: 0
      });
      clearInterval(this.intervalId);
      this.intervalId = null;
    }, false);
    this.playMusic = this.playMusic.bind(this);

    //create notification audio tag
    this.notifcationTag = document.createElement("audio");
    this.notifcationTag.id = "xyz";
    this.notifcationTag.src = notifcationSound;
    this.notifcationTag.muted = true;
    document.body.append(this.notifcationTag);
  }

  _showNotification(foundThread, messageToNotify) {
    const {user, chatNotificationClickHook, dispatch} = this.props;
    const thread = foundThread.thread;
    if (this.pinNotify) {
      if (checkForPrivilege(thread, THREAD_ADMIN)) {
        return;
      }
    }
    if (thread.mute) {
      return;
    }
    const {count} = this.state;
    this.setState({
      thread,
      count: count + (messageToNotify instanceof Array ? messageToNotify.length : 1)
    });
    if (!this.intervalId) {
      this.intervalId = window.setInterval(e => {
        const {showLastThread} = this.state;
        this.setState({
          showLastThread: !showLastThread
        })
      }, 1500);
    }
    let notificationMessage;
    if (messageToNotify instanceof Array) {
      notificationMessage = strings.batchMessageSentToThread(messageToNotify.length, isGroup(thread), isChannel(thread))
    } else {
      const isMessageFile = isMessageIsFile(messageToNotify);
      const tag = document.createElement("div");
      tag.innerHTML = messageToNotify.message;
      const newMessageText = messageToNotify.message;
      const personName = `${thread.group ? `${messageToNotify.participant && (messageToNotify.participant.contactName || messageToNotify.participant.name)}: ` : ""}`;
      notificationMessage = `${personName}${isMessageFile ? newMessageText ? newMessageText : strings.sentAFile : tag.innerText}`;
      if (this.pinNotify) {
        notificationMessage = strings.personPinnedMessage(isChannel(thread));
      }
    }
    this.playMusic();
    Push.create(thread.title, {
      silent: true,
      body: notificationMessage,
      icon: thread.image || defaultAvatar,
      timeout: 60000,
      onClick: function () {
        if (chatNotificationClickHook) {
          chatNotificationClickHook(thread);
        }
        dispatch(threadCreateWithExistThread(thread));
        window.focus();
        this.close();
      }
    });
  }

  playMusic() {

    const audio = this.notifcationTag;
    var isPlaying = audio.currentTime > 0 && !audio.paused && !audio.ended
      && audio.readyState > 2;
    if (!isPlaying) {
      audio.muted = false;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(e => {
        }).catch(error => {
        });
      }
    }

  }

  _coreLogic(foundThread, messageToNotify) {
    if (this.pinNotify) {
      return this._showNotification(foundThread, messageToNotify);
    }
    clearTimeout(foundThread.timeoutId);
    foundThread.pendingMessages.push(messageToNotify);
    foundThread.timeoutId = setTimeout(() => {
      clearTimeout(foundThread.timeoutId);
      const pendingMessages = foundThread.pendingMessages;
      this._showNotification(foundThread, pendingMessages.length > 1 ? pendingMessages : messageToNotify);
      foundThread.pendingMessages = [];
      foundThread.timeoutId = null;
    }, 1500);
  }

  _storeThreadObject(thread) {
    const oldThread = this.threads[thread.id];
    this.threads[thread.id] = {
      pendingMessages: oldThread ? oldThread.pendingMessages : [],
      timeoutId: oldThread ? oldThread.timeoutId : null,
      thread
    };
  }

  _showNotificationLogic() {
    const {messageNew, chatInstance, user, messagePinned, threads} = this.props;
    if (!messageNew && !messagePinned) {
      return;
    }
    let messageToNotify = this.pinNotify ? messagePinned : messageNew;
    if (this.pinNotify || !isMessageByMe(messageToNotify, user)) {
      if (chatInstance) {
        if (this.pinNotify || !window.document.hasFocus()) {
          let foundThread = threads.find(e => messageToNotify.threadId === e.id);
          if (foundThread) {
            this._storeThreadObject(foundThread);
            return this._coreLogic(this.threads[messageToNotify.threadId], messageToNotify);
          }
          chatInstance.getThreadInfo({threadIds: messageToNotify.threadId}).then(thread => {
            this._storeThreadObject(thread);
            this._coreLogic(this.threads[messageToNotify.threadId], messageToNotify);
          });
        }
      }
    }
  }

  componentDidUpdate(oldProps) {
    if (Push.Permission.has() && this.props.chatNotification) {
      const {messageNew, messagePinned, supportMode} = this.props;
      const {messageNew: oldMessageNew, messagePinned: oldMessagePinned} = oldProps;


      let newPinMessage = true;
      let newMessage = true;
      if (messagePinned) {
        if (oldMessagePinned) {
          if (messagePinned.id === oldMessagePinned.id) {
            newPinMessage = false;
          }
        }
      } else {
        newPinMessage = false;
      }
      if (messageNew) {
        if (oldMessageNew) {
          if (messageNew.time <= oldMessageNew.time) {
            newMessage = false;
          }
        }
      } else {
        newMessage = false;
      }
      if (newPinMessage || newMessage) {
        if(supportMode) {
          if(messageNew && messageNew.threadId !== supportMode) {
            return;
          }
          if(newPinMessage && newPinMessage.threadId !== supportMode) {
            return;
          }
        }
        this.pinNotify = newPinMessage;
        this._showNotificationLogic();
      }
    }
  }

  render() {
    if (!Push.Permission.has() || !this.props.chatNotification) {
      return null;
    }
    const {count, showLastThread, thread, defaultTitle} = this.state;
    let newTitle = defaultTitle;
    if (count > 0) {
      if (showLastThread) {
        newTitle = `${thread.title}...`;
      } else {
        newTitle = `💬 (${count}) - ${defaultTitle}`;
      }
    }
    return (
      <MetaTags>
        <title>{newTitle}</title>
      </MetaTags>
    )
  }
}