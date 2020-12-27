import React, {Fragment, useState, useEffect} from "react";
import {getImageFromHashMapWindow} from "../utils/helpers";
import classnames from "classnames";
import {IndexModalMediaFragment} from "./index";


import Image from "../../../pod-chat-ui-kit/src/image";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import MainMessagesMessageFileCaption from "./MainMessagesMessageFileCaption";

import style from "../../styles/app/MainMessagesMessageImage.scss";


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


function MainMessagesMessageFileImageFragment({message, classNames, isBlurry, imageThumbLowQuality, imageThumb, imageSizeLink, gettingImageThumb}) {
  return <Image className={classNames}
                onClick={e => e.stopPropagation()}
                src={message.id ? isBlurry ? imageThumbLowQuality : imageThumb : imageSizeLink.imageLink}
                style={{
                  backgroundColor: gettingImageThumb ? "#fff" : "none",
                  maxWidth: `${imageSizeLink.width}px`,
                  width: `${imageSizeLink.width}px`,
                  height: `${imageSizeLink.height}px`,
                  filter: isBlurry || gettingImageThumb ? "blur(8px)" : "none"
                }}/>;
}

export default function ({isUploading, message, metaData, smallVersion, imageSizeLink, setShowProgress, dispatch}) {
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

  setShowProgress(gettingImageThumb);

  useEffect(function () {
    if (modalMediaInstance) {
      updateSlide(imageModalPreview, imageThumb, modalMediaInstance);
    }
  }, [imageThumb, imageModalPreview, modalMediaInstance]);

  modalMediaRef.getJqueryScope()(document).on('afterShow.fb', (e, instance) => {
    setModalMediaInstance(instance);
    updateSlide(imageModalPreview, imageThumb, instance);
  });

  const mainMessagesFileImageClassNames = classnames({
    [style.MainMessagesMessageFileImage]: true,
    [style["MainMessagesMessageFileImage--smallVersion"]]: smallVersion
  });

  return <Container style={{width: `${imageSizeLink.width}px`}}>
    {
      isLocationMap ?
        <Text link={isLocationMap} linkClearStyle target={"_blank"}>
          <MainMessagesMessageFileImageFragment imageSizeLink={imageSizeLink}
                                                message={message}
                                                classNames={mainMessagesFileImageClassNames}
                                                gettingImageThumb={gettingImageThumb}
                                                imageThumb={imageThumb}
                                                imageThumbLowQuality={imageThumbLowQuality}
                                                isBlurry={isBlurry}/>
        </Text>
        :
        <Fragment>
          <IndexModalMediaFragment link={imageModalPreview || imageThumb}
                                   linkClassName={style.MainMessagesMessageFileImage__ModalMediaLink}/>
          <MainMessagesMessageFileImageFragment imageSizeLink={imageSizeLink}
                                                classNames={mainMessagesFileImageClassNames}
                                                message={message}
                                                gettingImageThumb={gettingImageThumb}
                                                imageThumb={imageThumb}
                                                imageThumbLowQuality={imageThumbLowQuality}
                                                isBlurry={isBlurry}/>
        </Fragment>

    }

    <MainMessagesMessageFileCaption message={message.message}/>

  </Container>
}