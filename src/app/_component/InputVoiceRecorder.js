import React, {useEffect} from "react";

let mediaRecorder;
let chunks = [];
let startTime;
export default function ({chatAudioRecorder, stream, onStop}) {
  if (stream) {
    if (!mediaRecorder) {
      mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorder.onstop = ()=>{
        const blob = new Blob(chunks, {type: "audio/mp3"});
        const blobObject = {
          blob,
          startTime,
          stopTime: Date.now()
        };
        if (onStop) { onStop(blobObject) }
        chunks = [];
      };
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      }
    }

    useEffect(function () {
      if (!chatAudioRecorder || chatAudioRecorder === "CANCELED") {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          stream.getAudioTracks().forEach((track) => {
            track.stop();
          });
          mediaRecorder.stop();
          mediaRecorder = null
        }
      } else {
        startTime = Date.now();
        mediaRecorder.start(10);
      }
    }, [chatAudioRecorder]);
  }
  return null;
}