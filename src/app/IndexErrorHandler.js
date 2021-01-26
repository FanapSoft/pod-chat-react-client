// app/index.js
import React from "react";

import {ToastContainer, toast} from 'react-toastify';

//strings


//actions


//components


//styling
import "../../styles/app/indexErrorHandler.scss";


export default function () {
  document.body.addEventListener("podchat-error", e => {
/*    toast.error('دست قوی داری ماشاالله با سرعت زیادی تایپ کردی یه 5 دقیقه شرمنده بلاک شدی.!!!', {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined
    });*/
  });
  return <ToastContainer position="bottom-left"
                         autoClose={5000}
                         hideProgressBar={false}
                         newestOnTop={false}
                         closeOnClick
                         rtl={true}
                         pauseOnFocusLoss
                         draggable
                         pauseOnHover/>
}
