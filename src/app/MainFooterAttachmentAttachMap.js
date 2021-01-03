// src/list/MainFooterAttachmentAttach.jss
import React, {Component} from "react";

import {connect} from "react-redux";

import {MapContainer, Marker, TileLayer} from "react-leaflet";


//strings
import strings from "../constants/localization";

//actions
import {messageSendLocation} from "../actions/messageActions";
import {chatModalPrompt} from "../actions/chatActions";

//components
import Container from "../../../pod-chat-ui-kit/src/container";
import Button from "../../../pod-chat-ui-kit/src/button/Button";
import {MdMyLocation} from "react-icons/md";

//styling
import style from "../../styles/app/MainFooterAttachmentAttachMap.scss";
import styleVar from "../../styles/variables.scss";


@connect()
export default class MainFooterAttachmentAttachMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      position: [35.714645, 51.4078324]
    };
    this.whenCreated = this.whenCreated.bind(this);
    this.gotoMyLocation = this.gotoMyLocation.bind(this);
    this.sendLocation = this.sendLocation.bind(this);
    this.cancel = this.cancel.bind(this);
  }


  sendLocation() {
    const {position} = this.state;
    const {dispatch, thread} = this.props;
    dispatch(chatModalPrompt());
    dispatch(messageSendLocation(thread, position[0], position[1]))

  }

  gotoMyLocation() {
    this.map.locate();
  }

  cancel() {
    const {dispatch} = this.props;
    dispatch(chatModalPrompt());
  }

  whenCreated(map) {
    this.map = map;
    map.locate();
    map.on('locationfound', e => {
      map.flyTo(e.latlng, map.getZoom());
      this.setState({
        position: e.latlng
      });
    });
    map.on('move', e => {
      this.setState({
        position: [e.target.getCenter().lat, e.target.getCenter().lng]
      })
    })
  }

  render() {
    const {position} = this.state;

    return (
      <Container>
        <MapContainer center={position} zoom={13}
                      style={{height: "400px", maxHeight: "calc(100vh - 111px)", position: "relative"}}
                      whenCreated={this.whenCreated}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          <Container bottomLeft className={style.MainFooterAttachmentAttachMap__MyLocation}
                     onClick={this.gotoMyLocation}>
            <MdMyLocation size={styleVar.iconSizeSm} color={styleVar.colorWhite} style={{margin: "5px 7px"}}/>
          </Container>
          <Marker position={position}/>
        </MapContainer>
        <Button onClick={this.sendLocation}>{strings.sendLocation}</Button>
        <Button onClick={this.cancel} text>{strings.cancel}</Button>
      </Container>

    )
  }
}