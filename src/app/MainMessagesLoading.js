import React from "react";
import Container from "../../../pod-chat-ui-kit/src/container";
import Loading, {LoadingBlinkDots} from "../../../pod-chat-ui-kit/src/loading";

export default function({className}) {
  return (
    <Container className={className}>
      <Container center centerTextAlign style={{width: "100%"}}>
        <Loading hasSpace><LoadingBlinkDots/></Loading>
      </Container>
    </Container>
  )
}
