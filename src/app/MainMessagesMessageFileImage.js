import React, {Fragment, useState, useEffect, useRef} from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";
import {IndexModalMediaFragment} from "./index";
import {getImage, getImageFromHashMapWindow, isMessageHasError} from "../utils/helpers";


import Image from "../../../pod-chat-ui-kit/src/image";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import MainMessagesMessageFileCaption from "./MainMessagesMessageFileCaption";
import MainMessagesMessageFileControlIcon from "./MainMessagesMessageFileControlIcon";

import style from "../../styles/app/MainMessagesMessageFileImage.scss";
import imageFragmentStyle from "../../styles/app/MainMessagesMessageFileImageFragment.scss";


const imageQualities = {
  low: {
    s: 1,
    q: 0.01
  },
  medium: {
    s: 3
  },
  high: {
    q: meta => {
      let {size} = meta.file;
      size = size / 1024;
      if (size <= 1024) {
        return .5
      }
      if (size <= 2048) {
        return .3
      }
      if (size <= 4096) {
        return .2
      }
      return .1
    }
  }
};

function updateSlide(imageModalPreview, imageThumb, instance) {
  const slide = instance.current;
  if (!instance || !slide) {
    return;
  }
  const {src} = slide;
  if (src === imageThumb) {
    if (imageModalPreview) {
      const slide = instance.current;
      slide.isLoaded = false;
      slide.src = imageModalPreview;
      delete slide.type;
      instance.trigger("objectNeedsType", slide);
      instance.loadSlide(slide);
      instance.hideLoading();
    } else {
      instance.showLoading();
    }
  }
}


function MainMessagesMessageFileImageFragment({smallVersion, message, isBlurry, imageThumbLowQuality, imageThumb, imageSizeLink, gettingImageThumb, ...other}) {
  const mainMessagesFileImageClassNames = classnames({
    [imageFragmentStyle.MainMessagesMessageFileImageFragment]: true,
    [imageFragmentStyle["MainMessagesMessageFileImageFragment--smallVersion"]]: smallVersion
  });
  return <Image className={mainMessagesFileImageClassNames}
                src={message.id ? isBlurry ? imageThumbLowQuality : imageThumb : imageSizeLink.imageLink}
                style={{
                  backgroundColor: gettingImageThumb ? "#fff" : "none",
                  maxWidth: `${imageSizeLink.width}px`,
                  width: `${imageSizeLink.width}px`,
                  height: `${imageSizeLink.height}px`,
                  filter: isBlurry || gettingImageThumb ? "blur(8px)" : "none"
                }} {...other}/>;
}

export default function ({isUploading, showCancelIcon, message, metaData, smallVersion, leftAsideShowing, setShowProgress, onCancel, dispatch}) {
  const imageSizeLink = getImage(metaData, message.id, smallVersion || leftAsideShowing);
  const linkRef = useRef(null);

  const fileHash = metaData.fileHash;
  const isLocationMap = metaData.mapLink;

  let [imageThumb, setImageThumb] = useState(null);
  let [imageModalPreview, setImageModalPreview] = useState(null);
  let [imageThumbLowQuality, setImageThumbLowQuality] = useState(null);
  let [modalMediaInstance, setModalMediaInstance] = useState(null);

  imageThumb = getImageFromHashMapWindow(fileHash, imageQualities.medium.s, null, setImageThumb, dispatch, false, true);
  imageModalPreview = getImageFromHashMapWindow(fileHash, null, imageQualities.high.q(metaData), setImageModalPreview, dispatch, false, true);
  imageThumbLowQuality = getImageFromHashMapWindow(fileHash, imageQualities.low.s, imageQualities.low.q, setImageThumbLowQuality, dispatch, false, true);

  imageThumb = imageThumb === true ? null : imageThumb;
  imageModalPreview = imageModalPreview === true ? null : imageModalPreview;
  imageThumbLowQuality = imageThumbLowQuality === true ? null : imageThumbLowQuality;

  const gettingImageThumb = !isUploading && (!imageThumbLowQuality && !imageThumb);
  const isBlurry = imageThumbLowQuality && !imageThumb && !isUploading;

  useEffect(function () {
    setShowProgress(gettingImageThumb ? "downloading" : false);
    if (modalMediaInstance) {
      updateSlide(imageModalPreview, imageThumb, modalMediaInstance);
    }
  }, [imageThumb, imageModalPreview, modalMediaInstance]);

  modalMediaRef.getJqueryScope()(document).on('afterShow.fb', (e, instance) => {
    setModalMediaInstance(instance);
    updateSlide(imageModalPreview, imageThumb, instance);
  });


  return <Container style={{width: `${imageSizeLink.width}px`}} className={style.MainMessagesMessageFileImage}>
    {
      isLocationMap ?
        <Text link={isLocationMap} linkClearStyle target={"_blank"}>
          <MainMessagesMessageFileImageFragment imageSizeLink={imageSizeLink}
                                                message={message}
                                                smallVersion={smallVersion}
                                                gettingImageThumb={gettingImageThumb}
                                                imageThumb={imageThumb}
                                                imageThumbLowQuality={imageThumbLowQuality}
                                                isBlurry={isBlurry}/>
        </Text>
        :
        <Fragment>
          <Container display="none">
            <IndexModalMediaFragment link={imageModalPreview || imageThumb}
                                     linkRef={linkRef}/>
          </Container>

          <Container display="flex" relative>

            {showCancelIcon &&
            <MainMessagesMessageFileControlIcon
              isCancel
              inlineStyle={
                {
                  marginRight: 0,
                  marginTop: "-10px",
                  maxWidth: `${imageSizeLink.width}px`,
                  zIndex: style.zIndex1
                }}
              onClick={onCancel}
              fixCenter/>
            }

            <MainMessagesMessageFileImageFragment imageSizeLink={imageSizeLink}
                                                  onClick={() => ReactDOM.findDOMNode(linkRef.current).click()}
                                                  smallVersion={smallVersion}
                                                  message={message}
                                                  gettingImageThumb={gettingImageThumb}
                                                  imageThumb={imageThumb}
                                                  imageThumbLowQuality={imageThumbLowQuality}
                                                  isBlurry={isBlurry}/>
          </Container>
        </Fragment>

    }
    {
      message.message &&
      <Fragment>
        <Gap y={5}/>
        <MainMessagesMessageFileCaption message={message.message}/>
      </Fragment>
    }


  </Container>
}