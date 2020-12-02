// src/box/_component/contactList
import React from "react";
import {avatarNameGenerator, avatarUrlGenerator} from "../../utils/helpers";

//components
import List, {ListItem} from "../../../../pod-chat-ui-kit/src/list"
import Avatar, {AvatarImage, AvatarName} from "../../../../pod-chat-ui-kit/src/avatar";
import Container from "../../../../pod-chat-ui-kit/src/container";
import AvatarText from "../../../../pod-chat-ui-kit/src/avatar/AvatarText";
import Scroller from "../../../../pod-chat-ui-kit/src/scroller";

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

export function ContactList(props) {
  const {contacts, activeList, activeRef, onSelect, onDeselect, activeWithTick, selection, invert, multiple, LeftActionFragment, AvatarTextFragment, AvatarNameFragment, maxAvatarNameWidth, avatarSize} = props;
  let filterContacts = [...contacts];
  return (
    <List>
      {filterContacts.map(el => (
        <ListItem key={el.id}

                  activeWithTick={activeWithTick}
                  selection={selection}
                  multiple={multiple}
                  onSelect={onSelect ? () => onSelect(el.id, el) : null}
                  onDeselect={onDeselect ? () => onDeselect(el.id, el) : null}
                  invert={invert}
                  ref={activeList && activeList.indexOf(el.id) > -1 ? activeRef : null}
                  active={activeList && activeList.indexOf(el.id) > -1}>
          <Container relative>
            <Avatar>
              <AvatarImage src={avatarUrlGenerator(getImage(el), avatarSize || avatarUrlGenerator.SIZES.MEDIUM)}
                           text={avatarNameGenerator(getName(el)).letter}
                           textBg={avatarNameGenerator(getName(el)).color}/>
              <AvatarName maxWidth={maxAvatarNameWidth || "150px"}>
                {getName(el)}
                {
                  AvatarNameFragment &&
                  <AvatarNameFragment contact={el}/>
                }
                {
                  AvatarTextFragment &&
                  <AvatarText>
                    <AvatarTextFragment contact={el}/>
                  </AvatarText>
                }
              </AvatarName>
            </Avatar>

            {LeftActionFragment ?
              <Container absolute centerLeft>
                <LeftActionFragment contact={el}/>
              </Container>
              : ""}

          </Container>
        </ListItem>
      ))}
    </List>
  )
}

export function ContactListSelective(props) {
  let newProps = {...{activeWithTick: true, selection: true, multiple: true}, ...props};
  return ContactList(newProps);
}

