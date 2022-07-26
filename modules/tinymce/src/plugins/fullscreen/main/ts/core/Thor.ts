import { Arr } from '@ephox/katamari';
import { Attribute, Css, SelectorFilter, SugarElement } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Env from 'tinymce/core/api/Env';

const attr = 'data-ephox-mobile-fullscreen-style';
const siblingStyles = 'display:none!important;';
const ancestorPosition = 'position:absolute!important;';
// TINY-3407 ancestors need 'height:100%!important;overflow:visible!important;' to prevent collapsed ancestors hiding the editor
const ancestorStyles = 'top:0!important;left:0!important;margin:0!important;padding:0!important;width:100%!important;height:100%!important;overflow:visible!important;';
const bgFallback = 'background-color:rgb(255,255,255)!important;';

const isAndroid = Env.os.isAndroid();

const matchColor = (editorBody: SugarElement<Element>): string => {
  // in iOS you can overscroll, sometimes when you overscroll you can reveal the bgcolor of an element beneath,
  // by matching the bg color and clobbering ensures any reveals are 'camouflaged' the same color
  const color = Css.get(editorBody, 'background-color');
  return (color !== undefined && color !== '') ? 'background-color:' + color + '!important' : bgFallback;
};

// We clobber all tags, direct ancestors to the editorBody get ancestorStyles, everything else gets siblingStyles
const clobberStyles = (dom: DOMUtils, container: SugarElement<Element>, editorBody: SugarElement<Element>): void => {
  const gatherSiblings = (element: SugarElement<Node>): SugarElement<Element>[] => {
    return SelectorFilter.siblings(element, '*:not(.tox-silver-sink)');
  };

  const clobber = (clobberStyle: string) => (element: SugarElement<Element>): void => {
    const styles = Attribute.get(element, 'style');
    const backup = styles === undefined ? 'no-styles' : styles.trim();
    if (backup === clobberStyle) {
      return;
    } else {
      Attribute.set(element, attr, backup);
      Css.setAll(element, dom.parseStyle(clobberStyle));
    }
  };

  const ancestors = SelectorFilter.ancestors(container, '*');
  const siblings = Arr.bind(ancestors, gatherSiblings);
  const bgColor = matchColor(editorBody);

  /* NOTE: This assumes that container has no siblings itself */
  Arr.each(siblings, clobber(siblingStyles));
  Arr.each(ancestors, clobber(ancestorPosition + ancestorStyles + bgColor));
  // position absolute on the outer-container breaks Android flex layout
  const containerStyles = isAndroid === true ? '' : ancestorPosition;
  clobber(containerStyles + ancestorStyles + bgColor)(container);
};

const restoreStyles = (dom: DOMUtils): void => {
  const clobberedEls = SelectorFilter.all('[' + attr + ']');
  Arr.each(clobberedEls, (element) => {
    const restore = Attribute.get(element, attr);
    if (restore && restore !== 'no-styles') {
      Css.setAll(element, dom.parseStyle(restore));
    } else {
      Attribute.remove(element, 'style');
    }
    Attribute.remove(element, attr);
  });
};

export {
  clobberStyles,
  restoreStyles
};
