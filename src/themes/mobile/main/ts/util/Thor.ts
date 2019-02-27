/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Css, SelectorFilter } from '@ephox/sugar';

const attr = 'data-ephox-mobile-fullscreen-style';
const siblingStyles = 'display:none!important;';
const ancestorPosition = 'position:absolute!important;';
/// TINY-3407 ancestors need 'height:100%!important;overflow:visible!important;' to prevent collapsed ancestors hiding the editor
const ancestorStyles = 'top:0!important;left:0!important;margin:0!important;padding:0!important;width:100%!important;height:100%!important;overflow:visible!important;';
const bgFallback = 'background-color:rgb(255,255,255)!important;';

const isAndroid = PlatformDetection.detect().os.isAndroid();

const matchColor = function (editorBody) {
  // in iOS you can overscroll, sometimes when you overscroll you can reveal the bgcolor of an element beneath,
  // by matching the bg color and clobbering ensures any reveals are 'camouflaged' the same color
  const color = Css.get(editorBody, 'background-color');
  return (color !== undefined && color !== '') ? 'background-color:' + color + '!important' : bgFallback;
};

// We clobber all tags, direct ancestors to the editorBody get ancestorStyles, everything else gets siblingStyles
const clobberStyles = function (container, editorBody) {
  const gatherSibilings = function (element) {
    const siblings = SelectorFilter.siblings(element, '*');
    return siblings;
  };

  const clobber = function (clobberStyle) {
    return function (element) {
      const styles = Attr.get(element, 'style');
      const backup = styles === undefined ? 'no-styles' : styles.trim();

      if (backup === clobberStyle) {
        return;
      } else {
        Attr.set(element, attr, backup);
        Attr.set(element, 'style', clobberStyle);
      }
    };
  };

  const ancestors = SelectorFilter.ancestors(container, '*');
  const siblings = Arr.bind(ancestors, gatherSibilings);
  const bgColor = matchColor(editorBody);

  /* NOTE: This assumes that container has no siblings itself */
  Arr.each(siblings, clobber(siblingStyles));
  Arr.each(ancestors, clobber(ancestorPosition + ancestorStyles + bgColor));
  // position absolute on the outer-container breaks Android flex layout
  const containerStyles = isAndroid === true ? '' : ancestorPosition;
  clobber(containerStyles + ancestorStyles + bgColor)(container);
};

const restoreStyles = function () {
  const clobberedEls = SelectorFilter.all('[' + attr + ']');
  Arr.each(clobberedEls, function (element) {
    const restore = Attr.get(element, attr);
    if (restore !== 'no-styles') {
      Attr.set(element, 'style', restore);
    } else {
      Attr.remove(element, 'style');
    }
    Attr.remove(element, attr);
  });
};

export default {
  clobberStyles,
  restoreStyles
};