import React, {Component} from "react";
import {connect} from "react-redux";
import Image from "../../../../pod-chat-ui-kit/src/image";
import {
  getImage
} from "../../utils/hashmap";


@connect(store => {
  return {
    user: store.user.user
  };
})
export default class ImageFetcher extends Component {

  constructor(props) {
    super(props);
    const {hashCode, size, quality} = props;
    this.state = {
      image: null,
    };
    getImage(hashCode, size, quality, "image", this, true);
  }

  render() {
    const {hashCode, size, quality, className, setOnBackground, ...other} = this.props;
    let {image} = this.state;
    image = (typeof image === "string" && image.indexOf("blob") < 0) || image === true ? null : image;
    return <Image src={image}
                  className={className}
                  setOnBackground={setOnBackground}
                  {...other}/>
  }
}