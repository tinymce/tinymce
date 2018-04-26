/**
 * Preview.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from '../api/dom/DOMUtils';
import Tools from '../api/util/Tools';
import Schema from '../api/html/Schema';

/**
 * Internal class for generating previews styles for formats.
 *
 * Example:
 *  Preview.getCssText(editor, 'bold');
 *
 * @private
 * @class tinymce.fmt.Preview
 */

const each = Tools.each;
const dom = DOMUtils.DOM;

const parsedSelectorToHtml = function (ancestry, editor) {
  let elm, item, fragment;
  const schema = editor && editor.schema || Schema({});

  const decorate = function (elm, item) {
    if (item.classes.length) {
      dom.addClass(elm, item.classes.join(' '));
    }
    dom.setAttribs(elm, item.attrs);
  };

  const createElement = function (sItem) {
    let elm;

    item = typeof sItem === 'string' ? {
      name: sItem,
      classes: [],
      attrs: {}
    } : sItem;

    elm = dom.create(item.name);
    decorate(elm, item);
    return elm;
  };

  const getRequiredParent = function (elm, candidate) {
    const name = typeof elm !== 'string' ? elm.nodeName.toLowerCase() : elm;
    const elmRule = schema.getElementRule(name);
    const parentsRequired = elmRule && elmRule.parentsRequired;

    if (parentsRequired && parentsRequired.length) {
      return candidate && Tools.inArray(parentsRequired, candidate) !== -1 ? candidate : parentsRequired[0];
    } else {
      return false;
    }
  };

  const wrapInHtml = function (elm, ancestry, siblings) {
    let parent, parentCandidate, parentRequired;
    const ancestor = ancestry.length > 0 && ancestry[0];
    const ancestorName = ancestor && ancestor.name;

    parentRequired = getRequiredParent(elm, ancestorName);

    if (parentRequired) {
      if (ancestorName === parentRequired) {
        parentCandidate = ancestry[0];
        ancestry = ancestry.slice(1);
      } else {
        parentCandidate = parentRequired;
      }
    } else if (ancestor) {
      parentCandidate = ancestry[0];
      ancestry = ancestry.slice(1);
    } else if (!siblings) {
      return elm;
    }

    if (parentCandidate) {
      parent = createElement(parentCandidate);
      parent.appendChild(elm);
    }

    if (siblings) {
      if (!parent) {
        // if no more ancestry, wrap in generic div
        parent = dom.create('div');
        parent.appendChild(elm);
      }

      Tools.each(siblings, function (sibling) {
        const siblingElm = createElement(sibling);
        parent.insertBefore(siblingElm, elm);
      });
    }

    return wrapInHtml(parent, ancestry, parentCandidate && parentCandidate.siblings);
  };

  if (ancestry && ancestry.length) {
    item = ancestry[0];
    elm = createElement(item);
    fragment = dom.create('div');
    fragment.appendChild(wrapInHtml(elm, ancestry.slice(1), item.siblings));
    return fragment;
  } else {
    return '';
  }
};

const selectorToHtml = function (selector, editor?) {
  return parsedSelectorToHtml(parseSelector(selector), editor);
};

const parseSelectorItem = function (item) {
  let tagName;
  const obj: any = {
    classes: [],
    attrs: {}
  };

  item = obj.selector = Tools.trim(item);

  if (item !== '*') {
    // matching IDs, CLASSes, ATTRIBUTES and PSEUDOs
    tagName = item.replace(/(?:([#\.]|::?)([\w\-]+)|(\[)([^\]]+)\]?)/g, function ($0, $1, $2, $3, $4) {
      switch ($1) {
        case '#':
          obj.attrs.id = $2;
          break;

        case '.':
          obj.classes.push($2);
          break;

        case ':':
          if (Tools.inArray('checked disabled enabled read-only required'.split(' '), $2) !== -1) {
            obj.attrs[$2] = $2;
          }
          break;
      }

      // atribute matched
      if ($3 === '[') {
        const m = $4.match(/([\w\-]+)(?:\=\"([^\"]+))?/);
        if (m) {
          obj.attrs[m[1]] = m[2];
        }
      }

      return '';
    });
  }

  obj.name = tagName || 'div';
  return obj;
};

const parseSelector = function (selector) {
  if (!selector || typeof selector !== 'string') {
    return [];
  }

  // take into account only first one
  selector = selector.split(/\s*,\s*/)[0];

  // tighten
  selector = selector.replace(/\s*(~\+|~|\+|>)\s*/g, '$1');

  // split either on > or on space, but not the one inside brackets
  return Tools.map(selector.split(/(?:>|\s+(?![^\[\]]+\]))/), function (item) {
    // process each sibling selector separately
    const siblings = Tools.map(item.split(/(?:~\+|~|\+)/), parseSelectorItem);
    const obj = siblings.pop(); // the last one is our real target

    if (siblings.length) {
      obj.siblings = siblings;
    }
    return obj;
  }).reverse();
};

const getCssText = function (editor, format) {
  let name, previewFrag, previewElm, items;
  let previewCss = '', parentFontSize, previewStyles;

  previewStyles = editor.settings.preview_styles;

  // No preview forced
  if (previewStyles === false) {
    return '';
  }

  // Default preview
  if (typeof previewStyles !== 'string') {
    previewStyles = 'font-family font-size font-weight font-style text-decoration ' +
      'text-transform color background-color border border-radius outline text-shadow';
  }

  // Removes any variables since these can't be previewed
  const removeVars = function (val) {
    return val.replace(/%(\w+)/g, '');
  };

  // Create block/inline element to use for preview
  if (typeof format === 'string') {
    format = editor.formatter.get(format);
    if (!format) {
      return;
    }

    format = format[0];
  }

  // Format specific preview override
  // TODO: This should probably be further reduced by the previewStyles option
  if ('preview' in format) {
    previewStyles = format.preview;
    if (previewStyles === false) {
      return '';
    }
  }

  name = format.block || format.inline || 'span';

  items = parseSelector(format.selector);
  if (items.length) {
    if (!items[0].name) { // e.g. something like ul > .someClass was provided
      items[0].name = name;
    }
    name = format.selector;
    previewFrag = parsedSelectorToHtml(items, editor);
  } else {
    previewFrag = parsedSelectorToHtml([name], editor);
  }

  previewElm = dom.select(name, previewFrag)[0] || previewFrag.firstChild;

  // Add format styles to preview element
  each(format.styles, function (value, name) {
    value = removeVars(value);

    if (value) {
      dom.setStyle(previewElm, name, value);
    }
  });

  // Add attributes to preview element
  each(format.attributes, function (value, name) {
    value = removeVars(value);

    if (value) {
      dom.setAttrib(previewElm, name, value);
    }
  });

  // Add classes to preview element
  each(format.classes, function (value) {
    value = removeVars(value);

    if (!dom.hasClass(previewElm, value)) {
      dom.addClass(previewElm, value);
    }
  });

  editor.fire('PreviewFormats');

  // Add the previewElm outside the visual area
  dom.setStyles(previewFrag, { position: 'absolute', left: -0xFFFF });
  editor.getBody().appendChild(previewFrag);

  // Get parent container font size so we can compute px values out of em/% for older IE:s
  parentFontSize = dom.getStyle(editor.getBody(), 'fontSize', true);
  parentFontSize = /px$/.test(parentFontSize) ? parseInt(parentFontSize, 10) : 0;

  each(previewStyles.split(' '), function (name) {
    let value = dom.getStyle(previewElm, name, true);

    // If background is transparent then check if the body has a background color we can use
    if (name === 'background-color' && /transparent|rgba\s*\([^)]+,\s*0\)/.test(value)) {
      value = dom.getStyle(editor.getBody(), name, true);

      // Ignore white since it's the default color, not the nicest fix
      // TODO: Fix this by detecting runtime style
      if (dom.toHex(value).toLowerCase() === '#ffffff') {
        return;
      }
    }

    if (name === 'color') {
      // Ignore black since it's the default color, not the nicest fix
      // TODO: Fix this by detecting runtime style
      if (dom.toHex(value).toLowerCase() === '#000000') {
        return;
      }
    }

    // Old IE won't calculate the font size so we need to do that manually
    if (name === 'font-size') {
      if (/em|%$/.test(value)) {
        if (parentFontSize === 0) {
          return;
        }

        // Convert font size from em/% to px
        const numValue = parseFloat(value) / (/%$/.test(value) ? 100 : 1);
        value = (numValue * parentFontSize) + 'px';
      }
    }

    if (name === 'border' && value) {
      previewCss += 'padding:0 2px;';
    }

    previewCss += name + ':' + value + ';';
  });

  editor.fire('AfterPreviewFormats');

  // previewCss += 'line-height:normal';

  dom.remove(previewFrag);

  return previewCss;
};

export default {
  getCssText,
  parseSelector,
  selectorToHtml
};