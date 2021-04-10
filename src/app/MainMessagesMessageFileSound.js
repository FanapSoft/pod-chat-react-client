import React, {useRef} from "react";
import {chatAudioPlayer as chatAudioPlayerAction} from "../actions/chatActions";
import WaveSurfer from "wavesurfer.js";
import styleVar from "../../styles/variables.scss";

export default function ({message, thread, setPlayTrigger, setPlayAfterDownloadTrigger, setJustMountedTrigger, chatAudioPlayer, dispatch}) {
  let soundPlayer = null;
  const soundPlayerContainer = useRef(null);
  const soundRef = useRef(null);


  setPlayTrigger((result) => {
    if (soundPlayer) {
      soundPlayer.playPause();
      dispatch(chatAudioPlayerAction({
        player: soundPlayer,
        playing: soundPlayer.isPlaying(),
        message,
        thread
      }));
      return true;
    } else if (result) {
      createPlayer(result, true);
    }
  });

  setJustMountedTrigger(result => {
    soundPlayer = chatAudioPlayer && chatAudioPlayer.message.id === message.id && chatAudioPlayer.player;
    if (soundPlayer) {
      soundPlayerContainer.current.appendChild(soundPlayer.container);
    } else {
      createPlayer(result);
    }

  });

  setPlayAfterDownloadTrigger(result => {
    createPlayer(result, true);
  });

  function createPlayer(result, playAfterCreation) {
    const wavesurfer = soundPlayer = WaveSurfer.create({
      container: soundRef.current,
      waveColor: styleVar.colorAccentLight,
      progressColor: styleVar.colorAccent,
      normalize: true,
      cursorColor: styleVar.colorAccentDark,
      height: 20,
      barWidth: 2,
      barRadius: 2,
      barMinHeight: 1,
      cursorWidth: 2,
      barGap: 1
    });
    if (playAfterCreation) {
      wavesurfer.on("ready", function () {
        dispatch(chatAudioPlayerAction({message, player: wavesurfer, thread, playing: true}));
        wavesurfer.play();
      });
    }
    wavesurfer.on("finish", function () {
      dispatch(chatAudioPlayerAction({message, player: wavesurfer, thread, playing: false}));
    });
    wavesurfer.load(result);
  }


  return (
    <div style={{minWidth: "100px"}} ref={soundPlayerContainer}>
      <div ref={soundRef}/>
    </div>
  )
}