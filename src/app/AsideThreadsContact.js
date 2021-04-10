import React, {Fragment} from "react";
import {avatarNameGenerator, avatarUrlGenerator} from "../utils/helpers";

import Avatar, {AvatarImage, AvatarName, AvatarText} from "../../../pod-chat-ui-kit/src/avatar";
import {ListItem} from "../../../pod-chat-ui-kit/src/list";
import Container from "../../../pod-chat-ui-kit/src/container";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Text} from "../../../pod-chat-ui-kit/src/typography";

import {getName} from "./_component/contactList";
import strings from "../constants/localization";
import date from "../utils/date";


function AsideThreadsContact({
                               onStartChat,
                               contact
                             }) {
  const {MEDIUM} = avatarUrlGenerator.SIZES;
  return <ListItem key={contact} selection>
    <Container relative onClick={onStartChat.bind(null, contact)}>

      <Container maxWidth="calc(100% - 75px)">
        <Avatar>
          <AvatarImage src={avatarUrlGenerator(contact.linkedUser.image, MEDIUM)}
                       customSize="55px"
                       text={avatarNameGenerator(`${contact.firstName} ${contact.lastName}`).letter}
                       textBg={avatarNameGenerator(`${contact.firstName} ${contact.lastName}`).color}/>
          <AvatarName maxWidth="150px" invert>
            {getName(contact)}
            <AvatarText>
              {
                contact.blocked &&
                <Fragment>
                  <Text size="xs" inline color="red">{strings.blocked}</Text>
                  <Gap x={3}/>
                </Fragment>

              }
              <Text inline size="sm" color="gray"
                    dark>{strings.lastSeen(date.prettifySince(contact ? contact.notSeenDuration : ""))}</Text>
            </AvatarText>
          </AvatarName>

        </Avatar>
      </Container>
    </Container>
  </ListItem>
}

export default React.memo(AsideThreadsContact, () => true);