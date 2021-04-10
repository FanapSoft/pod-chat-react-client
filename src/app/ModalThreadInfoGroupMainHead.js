import React, {Component, Fragment, useState} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {avatarNameGenerator, avatarUrlGenerator, getMessageMetaData, isChannel} from "../utils/helpers";
import strings from "../constants/localization";
import styleVar from "../../styles/variables.scss";
import {ContactSearchFragment} from "./ModalContactList";
import style from "../../styles/app/ModalThreadInfoGroupMain.scss";
import {ContactList} from "./_component/contactList";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";
import {Button} from "../../../pod-chat-ui-kit/src/button";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import {Heading, Text} from "../../../pod-chat-ui-kit/src/typography";
import Avatar, {AvatarImage, AvatarName} from "../../../pod-chat-ui-kit/src/avatar";
import Container from "../../../pod-chat-ui-kit/src/container";
import List, {ListItem} from "../../../pod-chat-ui-kit/src/list";
import {MdGroupAdd, MdArrowBack, MdSettings, MdBlock, MdNotifications, MdPersonAdd} from "react-icons/md";
import ModalThreadInfoMessageTypes from "./ModalThreadInfoMessageTypes";
import utilsStyle from "../../styles/utils/utils.scss";
import checkForPrivilege from "../utils/privilege";
import {THREAD_ADMIN} from "../constants/privilege";


export default function(props) {
  let {
    thread, notificationPending,
    GapFragment,
    AvatarModalMediaFragment,
    onAddMemberSelect,
    onSettingsSelect,
    isThreadOwner,
    $this,
    onLeaveSelect,
    onNotificationSelect
  } = props;
  const [query, setQuery] = useState(null);
  const iconClasses = `${utilsStyle["u-clickable"]} ${utilsStyle["u-hoverColorAccent"]}`;

  const isChannelResult = isChannel(thread);

  return <ListItem>
    <Container relative>

      <Container>
        <Avatar>
          <AvatarImage
            src={avatarUrlGenerator.apply($this, [thread.image, avatarUrlGenerator.SIZES.LARGE, getMessageMetaData(thread)])}
            size="xlg"
            text={avatarNameGenerator(thread.title).letter}
            textBg={avatarNameGenerator(thread.title).color}>
            <AvatarModalMediaFragment thread={thread}/>
          </AvatarImage>
          <AvatarName>
            <Heading h1>{thread.title}</Heading>
            <Text>{thread.participantCount} {strings.member}</Text>
          </AvatarName>
        </Avatar>
      </Container>

      <Container bottomLeft>
        {isThreadOwner ?
          <Container inline>
            <Container inline>
              <MdGroupAdd size={styleVar.iconSizeMd} color={styleVar.colorGray} className={iconClasses}
                          onClick={onAddMemberSelect}/>
              <Gap x={5}/>
              <MdSettings size={styleVar.iconSizeMd} color={styleVar.colorGray} className={iconClasses}
                          onClick={onSettingsSelect}/>
              <Gap x={5}/>
            </Container>
          </Container>
          : ""}
      </Container>

    </Container>

    {thread.description &&
    <Container>
      <GapFragment/>
      <Text color="accent" size="sm">{strings.description} :</Text>
      <Text>{thread.description}</Text>
    </Container>
    }

    <GapFragment/>

    <Container>
      <List>
        {
          isThreadOwner ?
            <ListItem selection invert onSelect={onAddMemberSelect}>
              <Container relative display="inline-flex">
                <MdPersonAdd size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
                <Gap x={20}>
                  <Text>{strings.addMember}</Text>
                </Gap>
              </Container>
            </ListItem> : ""
        }
        <ListItem selection invert onSelect={onLeaveSelect}>
          <Container relative display="inline-flex">
            <MdBlock size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
            <Gap x={20}>
              <Text>{strings.leaveGroup(isChannelResult)}</Text>
            </Gap>
          </Container>
        </ListItem>

        <ListItem selection invert onSelect={onNotificationSelect}>

          <Container relative display="inline-flex" minWidth="100%">
            <Container display="inline-flex" flex="1 1 0">
              <MdNotifications size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
              <Gap x={20}>
                <Text>{strings.notification}</Text>
              </Gap>
            </Container>
            <Container flex="none">
              {notificationPending ?
                <Container centerTextAlign>
                  <Loading><LoadingBlinkDots size="sm"/></Loading>
                </Container>
                :
                <Gap x={5}>
                  <Text size="sm"
                        color={thread.mute ? "red" : "green"}>{thread.mute ? strings.inActive : strings.active}</Text>
                </Gap>
              }
            </Container>
          </Container>
        </ListItem>
      </List>
    </Container>

  </ListItem>
}