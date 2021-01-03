export default function isElementVisible(el, callBack) {
  if (IntersectionObserver) {
    const observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting === true) {
        return callBack();
      }
    }, {threshold: [1]});
    return observer.observe(el);
  }


  var rect = el.getBoundingClientRect(),
    vWidth = window.innerWidth || doc.documentElement.clientWidth,
    vHeight = window.innerHeight || doc.documentElement.clientHeight,
    efp = function (x, y) {
      return document.elementFromPoint(x, y)
    };

  // Return false if it's not in the viewport
  if (rect.right < 0 || rect.bottom < 0
    || rect.left > vWidth || rect.top > vHeight) {
    return;
  }
  const resultLeftTop = el.contains(efp(rect.left, rect.top));
  const resultRightTop = el.contains(efp(rect.right, rect.top));
  const resultRightBottom = el.contains(efp(rect.right, rect.bottom));
  const resultLeftBottom = el.contains(efp(rect.left, rect.bottom));

  // Return true if any of its four corners are visible
  if (resultLeftTop || resultRightTop || resultRightBottom || resultLeftBottom) {
    callBack();
  }
}