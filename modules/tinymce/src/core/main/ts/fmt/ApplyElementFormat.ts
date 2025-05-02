import { Type } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import Tools from '../api/util/Tools';
import { RangeLikeObject } from '../selection/RangeTypes';

import { ApplyFormat, FormatVars } from './FormatTypes';
import * as FormatUtils from './FormatUtils';

export const applyStyles = (dom: DOMUtils, elm: Element, format: ApplyFormat, vars: FormatVars | undefined): void => {
  Tools.each(format.styles, (value, name) => {
    dom.setStyle(elm, name, FormatUtils.replaceVars(value, vars));
  });

  // Needed for the WebKit span spam bug
  // TODO: Remove this once WebKit/Blink fixes this
  if (format.styles) {
    const styleVal = dom.getAttrib(elm, 'style');

    if (styleVal) {
      dom.setAttrib(elm, 'data-mce-style', styleVal);
    }
  }
};

export const setElementFormat = (ed: Editor, elm: Element, fmt: ApplyFormat, vars?: FormatVars, node?: Node | RangeLikeObject | null): void => {
  const dom = ed.dom;

  if (Type.isFunction(fmt.onformat)) {
    fmt.onformat(elm, fmt as any, vars, node);
  }

  applyStyles(dom, elm, fmt, vars);

  Tools.each(fmt.attributes, (value, name) => {
    dom.setAttrib(elm, name, FormatUtils.replaceVars(value, vars));
  });

  Tools.each(fmt.classes, (value) => {
    const newValue = FormatUtils.replaceVars(value, vars);

    if (!dom.hasClass(elm, newValue)) {
      dom.addClass(elm, newValue);
    }
  });
};

