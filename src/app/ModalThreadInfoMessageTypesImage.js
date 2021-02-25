import React, {useState} from "react";
import {getImageFromHashMapWindow, getMessageMetaData} from "../utils/helpers";
import Container from "../../../pod-chat-ui-kit/src/container";
import Image from "../../../pod-chat-ui-kit/src/image";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import {IndexModalMediaFragment} from "./index";
import strings from "../constants/localization";
import {threadGoToMessageId, threadModalThreadInfoShowing} from "../actions/threadActions";
import {MdWarning} from "react-icons/md";
import style from "../../styles/app/ModalThreadInfoMessageTypesImage.scss";
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
  let [blurryThumb, setBlurryThumb] = useState(null);
  const metaData = getMessageMetaData(message).file;
  thumb = metaData && getImageFromHashMapWindow(metaData.fileHash, 3, null, setThumb, dispatch, false, true);
  blurryThumb = metaData && getImageFromHashMapWindow(metaData.fileHash, 1, 0.01, setBlurryThumb, dispatch, false, true);
  const isFailed = !metaData;
  const isBlurry = blurryThumb && (!thumb || thumb === true);
  const blurryImageLoading = !blurryThumb && (!thumb || thumb === true);
  return (
    isFailed ?
      <Container center style={{width: "100%", textAlign: "center"}}>
        <Text size="xs">{strings.fileHaveProblem}</Text>
        <Container>
          <MdWarning size={styleVar.iconSizeMd} color={styleVar.colorGray}/>
        </Container>
      </Container>
      :
      <Container data-fancybox key={idMessage}
                 onClick={onFancyBoxClick.bind(null, dispatch, message)}>

        <IndexModalMediaFragment
          options={{buttons: ["goto", "slideShow", "close"], caption: message.message}}
          link={thumb || blurryThumb}>
          <Image className={style.ModalThreadInfoMessageTypesImage__Image}
                 setOnBackground
                 style={{
                   filter: blurryImageLoading || isBlurry ? "blur(8px)" : "none",
                   backgroundColor: style.colorGrayLight
                 }}
                 src={blurryImageLoading || isBlurry ? blurryThumb : thumb}/>

        </IndexModalMediaFragment>
      </Container>
  )
}

export default React.memo(ModalThreadInfoMessageTypesImage, a=>true)