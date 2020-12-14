import React, {Component} from "react";
import {connect} from "react-redux";
import Image from "../../../../uikit/src/image";
import {
  getImageFromHashMap
} from "../../utils/helpers";


@connect(store => {
  return {
    user: store.user.user,
    chatFileHashCodeMap: store.chatFileHashCodeUpdate.hashCodeMap
  };
})
export default class ImageFetcher extends Component {

  constructor(props) {
    super(props);
    const {hashCode, size, quality} = props;
    getImageFromHashMap.apply(this, [hashCode, size, quality]);
  }

  render() {
    const {hashCode, size, quality, className, setOnBackground, ...other} = this.props;
    let src = getImageFromHashMap.apply(this, [hashCode, size, quality]);
    src = (typeof src === "string" && src.indexOf("blob") < 0) || src === true ? null : src;
    return <Image src={src}
                  className={className}
                  setOnBackground={setOnBackground}
                  {...other}/>
  }
}