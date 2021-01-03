// src/list/BoxScene.jss
import React, {Component} from "react";
import {connect} from "react-redux";
import ReactDOMServer from "react-dom/server";
import classnames from "classnames";
import Strings from "../../constants/localization";

export function emojiRegex() {
  return new RegExp('\\u0023\\u20E3|\\u00a9|\\u00ae|\\u203c|\\u2049|\\u2139|[\\u2194-\\u2199]|\\u21a9|\\u21aa|\\u231a|\\u231b|\\u23e9|[\\u23ea-\\u23ec]|\\u23f0|\\u24c2|\\u25aa|\\u25ab|\\u25b6|\\u2611|\\u2614|\\u26fd|\\u2705|\\u2709|[\\u2795-\\u2797]|\\u27a1|\\u27b0|\\u27bf|\\u2934|\\u2935|[\\u2b05-\\u2b07]|\\u2b1b|\\u2b1c|\\u2b50|\\u2b55|\\u3030|\\u303d|\\u3297|\\u3299|[\\uE000-\\uF8FF\\u270A-\\u2764\\u2122\\u25C0\\u25FB-\\u25FE\\u2615\\u263a\\u2648-\\u2653\\u2660-\\u2668\\u267B\\u267F\\u2693\\u261d\\u26A0-\\u26FA\\u2708\\u2702\\u2601\\u260E]|[\\u2600\\u26C4\\u26BE\\u23F3\\u2764]|\\uD83D[\\uDC00-\\uDFFF]|\\uD83C[\\uDDE8-\\uDDFA\uDDEC]\\uD83C[\\uDDEA-\\uDDFA\uDDE7]|[0-9]\\u20e3|\\uD83C[\\uDC00-\\uDFFF]', "ig")
}


//strings

//actions

//components
import Scroller from "../../../../pod-chat-ui-kit/src/Scroller";
import Container from "../../../../pod-chat-ui-kit/src/container";

//styling
import emojiStyle from "../../../styles/utils/emoji.scss";
import style from "../../../styles/modules/EmojiIcons.scss";
import oneoneImage from "../../../styles/images/_common/oneone.png";
import {mobileCheck} from "../../utils/helpers";
import {
  emoji,
  emojiCategories,
  emojiCatSpriteName,
  emojiSpriteMeta,
  emojiSpriteDimensions,
  emojiCatName,
  emojiCookieName
} from "../../constants/emoji";
import Text from "../../../../pod-chat-ui-kit/src/typography/Text";
import Gap from "../../../../pod-chat-ui-kit/src/gap";
import EmojiIconsNav from "./EmojiIconsNav";
import Cookies from "js-cookie";

function emojiUnicode(emojie) {
  for (const em in emoji) {
    if (emoji[em][0] === emojie) {
      return em;
    }
  }
}


const {size, scale} = emojiSpriteMeta;

function generatePosition(emojiCat, index) {
  const {columns} = emojiSpriteDimensions[emojiCat];
  const currentColumn = Math.floor(index / columns);
  return {
    x: index > 0 ? -(index * size) : 0,
    y: -(currentColumn * size)
  };
}

function buildEmojiIcon(sizeX, sizeY, catName, emoji) {
  const {scale} = emojiSpriteMeta;
  const classNames = classnames({
    [emojiStyle.emoji]: true,
    [emojiStyle["emoji-inline"]]: true,
    [emojiStyle[`emojisprite-${catName}`]]: true
  });
  const img = <img className={classNames}
                   alt={emoji}
                   src={oneoneImage}
                   style={{backgroundPosition: `${+sizeX / scale}px ${+sizeY / scale}px`}}/>;
  return ReactDOMServer.renderToStaticMarkup(img);
}

export function codeEmoji(html) {
  if (!html) {
    return html;
  }
  return html.replace(/<img class="emoji.+?>/g, img => {
    return /alt="(.+?)"/g.exec(img)[1];
  });
}

export function decodeEmoji(string) {
  if (!string) {
    return string;
  }

  let decodedEmoji = string.replace(emojiRegex(), match => {
    let cat = 0;
    for (const emojiCategory of emojiCategories) {
      let emojiIndex = emojiCategory.findIndex(e => emoji[e][0] === match);
      if (emojiIndex > -1) {
        const {x, y} = generatePosition(cat, emojiIndex);
        return buildEmojiIcon(x, y, cat, match)
      }
      cat++;
    }
    return match;
  });

  return decodedEmoji.replace(/:emoji#.+?:/g, match => {
    const realMatch = match.substring(1, match.length - 1);
    const split = realMatch.split("#");
    if (!split[2]) {
      return string;
    }
    const size = split[2].split("*");
    return buildEmojiIcon(size[0], size[1], 0, match);
  });
}

@connect()
export default class EmojiIcons extends Component {

  constructor(props) {
    super(props);
    this.onScroll = this.onScroll.bind(this);
    if (!Cookies.get(emojiCookieName)) {
      Cookies.set(emojiCookieName, ["1|😄", "1|😅", "1|😓", "1|😡", "1|😬", "1|😐", "1|😮", "1|😷", "1|🙏", "1|👆", "1|👉", "1|👈", "1|👍", "1|👎", "1|👏", "1|☝", "1|🚌", "1|✅", "1|❎"], {expires: 99999999});
    }
  }

  onEmojiClick(emoji, emojiCat, e) {
    e.preventDefault();
    e.stopPropagation();
    const {setInputText, focusInputNode} = this.props;
    setInputText(buildEmojiIcon(emoji.x, emoji.y, emojiCat, emoji.emoji), true);
    if (!mobileCheck()) {
      setTimeout(focusInputNode, 20);
    }
  }

  calculations() {
    const emojiArray = [];
    let cat = 0;
    const emojiCategoriesClone = [...emojiCategories];
    const lastRecentlyUsedEmojiArray = Cookies.get(emojiCookieName);
    if (lastRecentlyUsedEmojiArray) {
      cat = -1;
      const emojiArray = JSON.parse(lastRecentlyUsedEmojiArray).map(e => emojiUnicode(e.split("|")[1]));
      emojiCategoriesClone.unshift(emojiArray);
    }
    for (const emojiCats of emojiCategoriesClone) {
      const inFrequently = cat === -1;
      const emojiCatArray = [];
      let index = 0;
      let catDimensions = emojiSpriteDimensions[cat];
      for (const emojiCat of emojiCats) {
        let correctCat = cat;
        if (inFrequently) {
          correctCat = emojiCategories.findIndex(e => (index = e.indexOf(emojiCat)) > -1);
          catDimensions = emojiSpriteDimensions[correctCat];
        }
        const plainEmojiObject = emoji[emojiCat];
        emojiCatArray.push({
          cat: correctCat,
          className: emojiStyle[emojiCatSpriteName[inFrequently ? correctCat : cat]],
          emoji: plainEmojiObject[0],
          name: plainEmojiObject[1][0],
          backgroundSize: `${catDimensions.columns * size}px ${catDimensions.rows * size}px`,
          ...generatePosition(correctCat, index)
        });
        index++;
      }
      emojiArray.push({
        id: inFrequently ? "recent" : Object.keys(Strings.emojiCatNames)[cat],
        title: inFrequently ? null : emojiCatName[cat],
        emojiCatArray
      });
      cat++;
    }

    return emojiArray;
  }

  onScroll(e, target) {
    this.navRef.onScroll(e, target)
  }

  render() {
    const emojiCats = this.calculations();
    const classNames = classnames({
      [emojiStyle.emoji]: true,
      [style.EmojiIcons__Button]: true
    });
    return (
      <Container className={style.EmojiIcons}>
        <EmojiIconsNav ref={e => this.navRef = e}/>
        <Scroller onScroll={this.onScroll} className={style.EmojiIcons__IconsContainer}>

          {emojiCats.map(emojiCat => (
            <Container id={emojiCat.id}>

              {
                emojiCat.title ?
                  <Gap y={15} x={10}>
                    <Container>
                      <Text bold>{emojiCat.title}</Text>
                    </Container>
                  </Gap> :
                  <Gap y={5}/>
              }


              <Container className={style.EmojiIcons__Icons} relative>

                {emojiCat.emojiCatArray.map(emoji => (
                  <Container key={emoji.emoji} className={style.EmojiIcons__Icon}
                             onClick={this.onEmojiClick.bind(this, emoji, emoji.cat)}>
                    <Container
                      className={`${emoji.className} ${classNames}`}
                      title={emoji.name}
                      style={{
                        backgroundPosition: `${emoji.x}px ${emoji.y}px`,
                        backgroundSize: emoji.backgroundSize
                      }}/>
                  </Container>
                ))}
              </Container>
            </Container>
          ))
          }
        </Scroller>
      </Container>
    );
  }
}