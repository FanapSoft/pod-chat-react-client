import React, {useState, Fragment} from "react";
import {getImageFromHashMapWindow, getMessageMetaData} from "../utils/helpers";
import Container from "../../../pod-chat-ui-kit/src/container";
import Image from "../../../pod-chat-ui-kit/src/image";
import style from "../../styles/app/ModalThreadInfoMessageTypesImage.scss";
import {IndexModalMediaFragment} from "./index";
import strings from "../constants/localization";
import {threadGoToMessageId, threadModalThreadInfoShowing} from "../actions/threadActions";

export function Imager({message, dispatch}) {
  const gotoMessage = () => {
    dispatch(threadModalThreadInfoShowing());
    window.modalMediaRef.close();
    dispatch(threadGoToMessageId(message.time));
  };
  const idMessage = `${message.id}-message-types-picture`;
  let [thumb, setThumb] = useState(null);
  let [blurryThumb, setBlurryThumb] = useState(null);
  const metaData = getMessageMetaData(message).file;
  thumb = getImageFromHashMapWindow(metaData.fileHash, 3, null, setThumb, dispatch, false, true);
  blurryThumb = getImageFromHashMapWindow(metaData.fileHash, 1, 0.01, setBlurryThumb, dispatch, false, true);
  const isBlurry = blurryThumb && (!thumb || thumb === true);
  const onFancyBoxClick = e => {
    //window.modalMediaRef.getFancyBox().open()
    setTimeout(e => {
      document.getElementsByClassName("fancybox-button--goto")[0].addEventListener("click", gotoMessage);
    }, 200)
  };
  return (
    <Container className={style.ModalThreadInfoMessageTypesImage} data-fancybox key={idMessage}
               onClick={onFancyBoxClick}>
      <IndexModalMediaFragment
        options={{buttons: ["goto", "slideShow", "close"], caption: message.message}}
        link={thumb || blurryThumb}>
        <Image className={style.ModalThreadInfoMessageTypesImage__Image}
               setOnBackground
               style={{
                 filter: isBlurry ? "blur(8px)" : "none"
               }}
               src={isBlurry ? blurryThumb : thumb}/>
      </IndexModalMediaFragment>

    </Container>
  )
}

export default React.memo(Imager, e=>true)