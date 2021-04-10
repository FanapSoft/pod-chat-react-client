import React, {Fragment, useState, useEffect, useRef} from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";
import {IndexModalMediaFragment} from "./index";
import {getFileDownloading, getImage as getImageFromHashMap} from "../utils/hashmap";
import {
  getImage
} from "../utils/helpers";


import Image from "../../../pod-chat-ui-kit/src/image";
import Container from "../../../pod-chat-ui-kit/src/container";
import {Text} from "../../../pod-chat-ui-kit/src/typography";
import Gap from "../../../pod-chat-ui-kit/src/gap";
import MainMessagesMessageFileCaption from "./MainMessagesMessageFileCaption";
import MainMessagesMessageFileControlIcon from "./MainMessagesMessageFileControlIcon";

import style from "../../styles/app/MainMessagesMessageFileImage.scss";
import imageFragmentStyle from "../../styles/app/MainMessagesMessageFileImageFragment.scss";
import mapFake from "../../styles/images/MainMessagesMessageFileImage/map-fake.png";


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
                  backgroundColor: "#fff",
                  maxWidth: `${imageSizeLink.width}px`,
                  width: `${imageSizeLink.width}px`,
                  height: `${imageSizeLink.height}px`,
                  filter: isBlurry || gettingImageThumb ? "blur(8px)" : "none"
                }} {...other}/>;
}

export default function ({isUploading, showCancelIcon, message, metaData, smallVersion, leftAsideShowing, setShowProgress, onCancel, setPlayDownloadTrigger, setDownloadIconShowCondition, dispatch}) {
  const imageSizeLink = getImage(metaData, message.id, smallVersion || leftAsideShowing);
  const linkRef = useRef(null);

  const fileHash = metaData.fileHash;
  const isLocationMap = metaData.mapLink;

  let [imageThumb, setImageThumb] = useState(null);
  let [imageModalPreview, setImageModalPreview] = useState(null);
  let [imageThumbLowQuality, setImageThumbLowQuality] = useState(null);
  let [modalMediaInstance, setModalMediaInstance] = useState(null);
  let [test, setTest] = useState(true);

  const onDownload = e=>{
    if (!test) {
      return;
    }
    setTest(false);
  };

  const oneMonthOld = Date.now() - (message.time / 1000000) >= (1000 * 60 * 60 * 24 * 30) && test;
  const showDownloadIconCondition = oneMonthOld && !isLocationMap;

  imageThumb = oneMonthOld && !isLocationMap ? null : getImageFromHashMap(fileHash, imageQualities.medium.s, null, setImageThumb, dispatch, false, true);
  imageThumbLowQuality = getImageFromHashMap(fileHash, imageQualities.low.s, imageQualities.low.q, setImageThumbLowQuality, dispatch, false, true);
  imageModalPreview = getFileDownloading(`${fileHash}-null-${imageQualities.high.q(metaData)}`);

  imageThumb = imageThumb === true ? null : imageThumb;
  imageThumbLowQuality = imageThumbLowQuality === true ? null : imageThumbLowQuality;
  imageModalPreview = imageModalPreview === true ? null : imageModalPreview;

  const gettingImageThumb = (!oneMonthOld && !isUploading) && ((!imageThumbLowQuality || !test) && !imageThumb);
  const isBlurry = (imageThumbLowQuality && !imageThumb && !isUploading) || (isLocationMap && isUploading) || (oneMonthOld && !isLocationMap);

  if (isLocationMap && isUploading) {
    imageSizeLink.imageLink = mapFake;
    imageSizeLink.width = 300;
    imageSizeLink.height = 225;
  }

  useEffect(function () {
    setShowProgress(gettingImageThumb ? "downloading" : false);
    if (modalMediaInstance) {
      if (imageModalPreview === "LOADING" || imageModalPreview === true) {
        return;
      }
      updateSlide(imageModalPreview, imageThumb, modalMediaInstance);
    }
  }, [imageThumb, imageModalPreview, modalMediaInstance, test]);

  modalMediaRef.getJqueryScope()(document).on('afterShow.fb', (e, instance) => {
    const slide = instance.current;
    const {src} = slide;
    imageThumb = getImageFromHashMap(fileHash, imageQualities.medium.s, null, setImageThumb, dispatch, false, true);
    if (src === imageThumb) {
      if (imageModalPreview === "LOADING" || imageModalPreview === true) {
        instance.showLoading();
      } else if (!imageModalPreview) {
        instance.showLoading();
        imageModalPreview = getImageFromHashMap(fileHash, null, imageQualities.high.q(metaData), setImageModalPreview, dispatch, false, true);
      } else {
        updateSlide(imageModalPreview, imageThumb, instance);
      }
    }
    if (!modalMediaInstance) {
      setModalMediaInstance(instance);
    }
  });


  return <Container style={{width: `${imageSizeLink.width}px`}} className={style.MainMessagesMessageFileImage}>
    {
      isLocationMap ?
        <Text link={isLocationMap} linkClearStyle target={"_blank"}>
          <MainMessagesMessageFileImageFragment imageSizeLink={imageSizeLink}
                                                message={message}
                                                smallVersion={smallVersion}
                                                gettingImageThumb={gettingImageThumb}
                                                oneMonthOld={oneMonthOld}
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

            {(showCancelIcon || showDownloadIconCondition) &&
            <MainMessagesMessageFileControlIcon
              isCancel={showCancelIcon}
              isDownload={!showCancelIcon && showDownloadIconCondition}
              inlineStyle={
                {
                  marginRight: 0,
                  marginTop: "-10px",
                  maxWidth: `${imageSizeLink.width}px`,
                  zIndex: style.zIndex1
                }}
              onClick={showDownloadIconCondition && !showCancelIcon ? onDownload: onCancel}
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