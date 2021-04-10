import React, {useRef} from "react";
import Container from "../../../pod-chat-ui-kit/src/container";

export default function ({message, setPlayTrigger, setPlayAfterDownloadTrigger, setJustMountedTrigger}) {
  const videoRef = useRef(null);
  const playVideoRef = useRef(null);
  setJustMountedTrigger(result => {
    const videoCurrent = videoRef.current;
    videoCurrent.src = result;
  });
  setPlayTrigger(result => {
    const videoCurrent = videoRef.current;
    const playVideoCurrent = playVideoRef.current;
    if (videoCurrent.src && videoCurrent.src === result) {
      playVideoCurrent.click();
    } else if(result) {
      videoCurrent.src = result;
      playVideoCurrent.click();
    }
  });
  setPlayAfterDownloadTrigger(result=> {
    const videoCurrent = videoRef.current;
    const playVideoCurrent = playVideoRef.current;
    videoCurrent.src = result;
    playVideoCurrent.click();
  });
  return <Container display="none">
    <a ref={playVideoRef} href={`#video-${message.id}`} data-fancybox  data-options={JSON.stringify({arrows: false, infobar: false, caption: message.message})}/>
    <video controls id={`video-${message.id}`} style={{display: "none"}} ref={videoRef}/>
  </Container>
}