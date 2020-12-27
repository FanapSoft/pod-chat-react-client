import React from "react";
import strings from "../constants/localization";


export default function({message}) {
  if (message.edited) {
    return (
      <Gap x={2}>
        <Text italic size="xs" inline>{strings.edited}</Text>
      </Gap>
    )
  }
  return "";
}
