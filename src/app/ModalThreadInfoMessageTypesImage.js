import React, {Fragment, useState} from "react";
import {getMessageMetaData} from "../utils/helpers";
import {getImage} from "../utils/hashmap";
import Container from "../../../pod-chat-ui-kit/src/container";
import Image from "../../../pod-chat-ui-kit/src/image";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {IndexModalMediaFragment} from "./index";
import strings from "../constants/localization";
import {threadGoToMessageId, threadModalThreadInfoShowing} from "../actions/threadActions";
import {MdWarning} from "react-icons/md";
import style from "../../styles/app/ModalThreadInfoMessageTypesImage.scss";
import oneone from "../../styles/images/_common/oneone.png";
import styleVar from "../../styles/variables.scss";

function gotoMessage(dispatch, message) {
  dispatch(threadModalThreadInfoShowing());
  window.modalMediaRef.close();
  dispatch(threadGoToMessageId(message.time));
}

function onFancyBoxClick(dispatch, message) {
  //window.modalMediaRef.getFancyBox().open()
  setTimeout(e => {
    document.getElementsByClassName("fancybox-button--goto")[0].addEventListener("click", gotoMessage.bind(null, dispatch, message));
  }, 200)
}

export function ModalThreadInfoMessageTypesImage({message, dispatch}) {

  const idMessage = `${message.id}-message-types-picture`;
  let [thumb, setThumb] = useState(null);
  const metaData = getMessageMetaData(message).file;
  thumb = metaData && thumb !== true && getImage(metaData.fileHash, 3, null, setThumb, dispatch, false, true);
  const isFailed = !metaData;
  const goingNothing = !thumb || thumb === true;
  return (
    isFailed || goingNothing ?
      <Container center={isFailed} style={{width: "100%", textAlign: "center"}}>
        {isFailed ?
          <Fragment>
            <Text size="xs">{strings.fileHaveProblem}</Text>
            <Container>
              <MdWarning size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
            </Container>
          </Fragment>
          :
          <Image
            className={style.ModalThreadInfoMessageTypesImage__Image}
            setOnBackground
            src={oneone}
            style={{
              filter: "blur(8px)",
              backgroundColor: style.colorGrayLight
            }}/>
        }

      </Container>
      :
      <Container data-fancybox key={idMessage}
                 onClick={onFancyBoxClick.bind(null, dispatch, message)}>

        <IndexModalMediaFragment
          options={{buttons: ["goto", "slideShow", "close"], caption: message.message}}
          link={thumb}>
          <Image className={style.ModalThreadInfoMessageTypesImage__Image}
                 setOnBackground
                 style={{
                   zIndex: 1,
                   backgroundColor: style.colorGrayLight
                 }}
                 src={thumb}/>

        </IndexModalMediaFragment>
      </Container>
  )
}

export default React.memo(ModalThreadInfoMessageTypesImage, a => true)