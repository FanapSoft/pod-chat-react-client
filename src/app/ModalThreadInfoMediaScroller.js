import {Virtuoso, VirtuosoGrid} from "./_component/Virtuoso";
import {ContactListItemMemoized} from "./_component/contactList";
import {avatarUrlGenerator} from "../utils/helpers";
import style from "../../styles/app/ModalThreadInfoMediaScroller.scss";
import ModalThreadInfoMessageTypesImage from "./ModalThreadInfoMessageTypesImage";
import ModalThreadInfoMessageTypesMedia from "./ModalThreadInfoMessageTypesMedia";
import React from "react";
import {types} from "../constants/messageTypes";

function tabIsFile(selectedTab) {
  if (types[selectedTab]) {
    return selectedTab !== "picture";
  }
  return false
}

export default
function ({dispatch, mediaList, selectedTab, totalCount, endCondition, onEndReached, participants, onStartChat, conversationAction}) {
  const TabComponentSelector = {
    "people": {
      Scroller: Virtuoso,
      Height: "calc(100vh - 300px)",
      ListItem: ({idx}) => {
        return <ContactListItemMemoized invert
                                        avatarSize={avatarUrlGenerator.SIZES.SMALL}
                                        selection
                                        contact={participants[idx]}
                                        onSelect={onStartChat}
                                        contacts={participants}
                                        LeftActionFragment={conversationAction}/>
      }
    },
    "picture": {
      Scroller: VirtuosoGrid,
      props: {
        listClassName: style.ModalThreadInfoMediaScroller__ImageList,
        itemClassName: style.ModalThreadInfoMediaScroller__ImageListItem
      },
      ListItem: ({idx}) => <ModalThreadInfoMessageTypesImage message={mediaList[idx]} dispatch={dispatch}/>
    },
    "file": {
      Scroller: Virtuoso,
      ListItem: ({idx}) => <ModalThreadInfoMessageTypesMedia message={mediaList[idx]}
                                                             dispatch={dispatch}
                                                             type={selectedTab}
      />
    },
  };

  const {Scroller, ListItem, Height, props} = TabComponentSelector[tabIsFile(selectedTab) ? "file" : selectedTab] || {};
  return <Scroller {...props}
                   style={{height: Height || `calc(100vh - 300px)`, overflowX: "hidden"}}
                   totalCount={totalCount}
                   endReached={e => endCondition && onEndReached()}
                   itemContent={idx => <ListItem idx={idx}/>}/>
}