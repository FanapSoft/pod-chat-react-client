import React, {Component, Fragment} from "react";
import {Virtuoso as VirtuosoOrig, VirtuosoGrid as VirtuosoGridOrig} from "react-virtuoso";
import classnames from "classnames";
import style from "../../../styles/modules/virtuoso.scss";
import {mobileCheck} from "../../utils/helpers";

function commonFunctionality(Scroller, className, other) {
  const isMobile = mobileCheck();
  const classNames = classnames({
    [style.Virtuoso]: true,
    [style["Virtuoso--mobileVersion"]]: isMobile,
     [className]: className
  });
  return <Scroller className={classNames} {...other}/>
}

export function Virtuoso({className, ...other}) {
  return commonFunctionality(VirtuosoOrig, className, other);
}
export function VirtuosoGrid({className, ...other}) {
  return commonFunctionality(VirtuosoGridOrig, className, other);
}