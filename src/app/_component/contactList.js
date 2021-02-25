// src/box/_component/contactList
import React, {memo} from "react";
import * as ReactDOM from 'react-dom'
import {Virtuoso} from "./../_component/Virtuoso";
import {avatarNameGenerator, avatarUrlGenerator} from "../../utils/helpers";

//components
import List, {ListItem} from "../../../../pod-chat-ui-kit/src/list"
import Avatar, {AvatarImage, AvatarName} from "../../../../pod-chat-ui-kit/src/avatar";
import Container from "../../../../pod-chat-ui-kit/src/container";
import AvatarText from "../../../../pod-chat-ui-kit/src/avatar/AvatarText";
import style from "../../../styles/app/AsideThreads.scss";


//styling

export function getName(contact) {
  if (contact.contactName) {
    return contact.contactName;
  }
  if (contact.name) {
    return contact.name;
  }
  if (contact.firstName) {
    return `${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ""}`;
  }

  if (contact.lastName) {
    return contact.lastName;
  }

}

export function getImage(contact) {
  if (contact.linkedUser) {
    return contact.linkedUser.image;
  }
  if (contact.image) {
    return contact.image;
  }
  return "";
}

export function ContactListItem(props) {
  const {contact, activeList, activeRef, onSelect, onDeselect, activeWithTick, selection, invert, multiple, LeftActionFragment, AvatarTextFragment, AvatarNameFragment, maxAvatarNameWidth, avatarSize} = props;
  return (
    <ListItem key={contact.id}
              activeWithTick={activeWithTick}
              selection={selection}
              multiple={multiple}
              onSelect={onSelect ? () => onSelect(contact.id, contact) : null}
              onDeselect={onDeselect ? () => onDeselect(contact.id, contact) : null}
              invert={invert}
              ref={activeList && activeList.indexOf(contact.id) > -1 ? activeRef : null}
              active={activeList && activeList.indexOf(contact.id) > -1}>
      <Container relative>
        <Avatar>
          <AvatarImage src={avatarUrlGenerator(getImage(contact), avatarSize || avatarUrlGenerator.SIZES.MEDIUM)}
                       text={avatarNameGenerator(getName(contact)).letter}
                       textBg={avatarNameGenerator(getName(contact)).color}/>
          <AvatarName maxWidth={maxAvatarNameWidth || "150px"}>
            {getName(contact)}
            {
              AvatarNameFragment &&
              <AvatarNameFragment contact={contact}/>
            }
            {
              AvatarTextFragment &&
              <AvatarText>
                <AvatarTextFragment contact={contact}/>
              </AvatarText>
            }
          </AvatarName>
        </Avatar>

        {LeftActionFragment ?
          <Container absolute centerLeft>
            <LeftActionFragment contact={contact}/>
          </Container>
          : ""}

      </Container>
    </ListItem>
  )
}

export const ContactListItemMemoized =  memo(ContactListItem, ()=> true);

export function ContactList(props) {
  const {contacts, endReached, height} = props;
  let filterContacts = [...contacts];
  return (
    <List>
      {
      <Virtuoso data={filterContacts}
                style={{  height: height || `calc(100vh - 300px)`}}
                endReached={endReached || (a =>{})}
                fixedItemHeight={65}
                itemContent={(index, el) =><ContactListItem {...props} contact={el}/>}/>
      }
    </List>
  )
}

export function ContactListSelective(props) {
  let newProps = {...{activeWithTick: true, selection: true, multiple: true}, ...props};
  return ContactList(newProps);
}

