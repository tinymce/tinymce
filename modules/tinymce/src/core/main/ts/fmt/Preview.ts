import { Transformations } from '@ephox/acid';
import { Arr, Type } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';
import { ApplyFormat, BlockFormat, FormatAttrOrStyleValue, InlineFormat, SelectorFormat } from './FormatTypes';

/**
 * Internal class for generating previews styles for formats.
 *
 * Example:
 *  Preview.getCssText(editor, 'bold');
 *
 * @private
 * @class tinymce.fmt.Preview
 */

interface PreviewItem {
  name: string;
  readonly classes: string[];
  readonly attrs: Record<string, string | number | boolean>;
  readonly selector?: string;
  siblings?: PreviewItem[];
}

const each = Tools.each;
const dom = DOMUtils.DOM;

const isPreviewItem = (item: string | PreviewItem | undefined): item is PreviewItem =>
  Type.isNonNullable(item) && Type.isObject(item);

const parsedSelectorToHtml = (ancestry: Array<string | PreviewItem>, editor?: Editor): HTMLElement => {
  const schema = editor && editor.schema || Schema({});

  const decorate = (elm: Element, item: PreviewItem) => {
    if (item.classes.length > 0) {
      dom.addClass(elm, item.classes.join(' '));
    }
    dom.setAttribs(elm, item.attrs);
  };

  const createElement = (sItem: string | PreviewItem): HTMLElement => {
    const item = Type.isString(sItem) ? {
      name: sItem,
      classes: [],
      attrs: {}
    } : sItem;

    const elm = dom.create(item.name);
    decorate(elm, item);
    return elm;
  };

  const getRequiredParent = (elm: HTMLElement, candidate: string | undefined) => {
    const elmRule = schema.getElementRule(elm.nodeName.toLowerCase());
    const parentsRequired = elmRule?.parentsRequired;

    if (parentsRequired && parentsRequired.length) {
      return candidate && Arr.contains(parentsRequired, candidate) ? candidate : parentsRequired[0];
    } else {
      return false;
    }
  };

  const wrapInHtml = (elm: HTMLElement, ancestors: Array<string | PreviewItem>, siblings?: PreviewItem[]): HTMLElement => {
    let parentCandidate: PreviewItem | string | undefined;
    const ancestor = ancestors[0];
    const ancestorName = isPreviewItem(ancestor) ? ancestor.name : undefined;

    const parentRequired = getRequiredParent(elm, ancestorName);

    if (parentRequired) {
      if (ancestorName === parentRequired) {
        parentCandidate = ancestor;
        ancestors = ancestors.slice(1);
      } else {
        parentCandidate = parentRequired;
      }
    } else if (ancestor) {
      parentCandidate = ancestor;
      ancestors = ancestors.slice(1);
    } else if (!siblings) {
      return elm;
    }

    // if no more ancestry, wrap in generic div
    const parent = parentCandidate ? createElement(parentCandidate) : dom.create('div');
    parent.appendChild(elm);

    if (siblings) {
      Tools.each(siblings, (sibling) => {
        const siblingElm = createElement(sibling);
        parent.insertBefore(siblingElm, elm);
      });
    }

    const parentSiblings = isPreviewItem(parentCandidate) ? parentCandidate.siblings : undefined;
    return wrapInHtml(parent, ancestors, parentSiblings);
  };

  const fragment = dom.create('div');
  if (ancestry.length > 0) {
    const item = ancestry[0];
    const elm = createElement(item);
    const siblings = isPreviewItem(item) ? item.siblings : undefined;
    fragment.appendChild(wrapInHtml(elm, ancestry.slice(1), siblings));
  }

  return fragment;
};

const selectorToHtml = (selector: string, editor?: Editor): HTMLElement => {
  return parsedSelectorToHtml(parseSelector(selector), editor);
};

const parseSelectorItem = (item: string): PreviewItem => {
  item = Tools.trim(item);
  let tagName = 'div';

  const obj: PreviewItem = {
    name: tagName,
    classes: [],
    attrs: {},
    selector: item
  };

  if (item !== '*') {
    // matching IDs, CLASSes, ATTRIBUTES and PSEUDOs
    tagName = item.replace(/(?:([#\.]|::?)([\w\-]+)|(\[)([^\]]+)\]?)/g, ($0, $1, $2, $3, $4) => {
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

      // attribute matched
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

const parseSelector = (selector: string | undefined): PreviewItem[] => {
  if (!Type.isString(selector)) {
    return [];
  }

  // take into account only first one
  selector = selector.split(/\s*,\s*/)[0];

  // tighten
  selector = selector.replace(/\s*(~\+|~|\+|>)\s*/g, '$1');

  // split either on > or on space, but not the one inside brackets
  return Tools.map(selector.split(/(?:>|\s+(?![^\[\]]+\]))/), (item): PreviewItem => {
    // process each sibling selector separately
    const siblings = Tools.map(item.split(/(?:~\+|~|\+)/), parseSelectorItem);
    const obj = siblings.pop() as PreviewItem; // the last one is our real target

    if (siblings.length) {
      obj.siblings = siblings;
    }
    return obj;
  }).reverse();
};

const getCssText = (editor: Editor, format: string | ApplyFormat): string => {
  let previewCss = '';
  let previewStyles = Options.getPreviewStyles(editor);

  // No preview forced
  if (previewStyles === '') {
    return '';
  }

  // Removes any variables since these can't be previewed
  const removeVars = (val: FormatAttrOrStyleValue): string => {
    return Type.isString(val) ? val.replace(/%(\w+)/g, '') : '';
  };

  const getComputedStyle = (name: string, elm?: Element): string => {
    return dom.getStyle(elm ?? editor.getBody(), name, true);
  };

  // Create block/inline element to use for preview
  if (Type.isString(format)) {
    const formats = editor.formatter.get(format);
    if (!formats) {
      return '';
    }

    format = formats[0] as ApplyFormat;
  }

  // Format specific preview override
  // TODO: This should probably be further reduced by the previewStyles option
  if ('preview' in format) {
    const preview = format.preview;
    if (preview === false) {
      return '';
    } else {
      previewStyles = preview || previewStyles;
    }
  }

  let name = (format as BlockFormat).block || (format as InlineFormat).inline || 'span';

  let previewFrag: HTMLElement;
  const items = parseSelector((format as SelectorFormat).selector);
  if (items.length > 0) {
    if (!items[0].name) { // e.g. something like ul > .someClass was provided
      items[0].name = name;
    }
    name = (format as SelectorFormat).selector;
    previewFrag = parsedSelectorToHtml(items, editor);
  } else {
    previewFrag = parsedSelectorToHtml([ name ], editor);
  }

  const previewElm = dom.select(name, previewFrag)[0] || previewFrag.firstChild as Element;

  // Add format styles to preview element
  each(format.styles, (value, name) => {
    const newValue = removeVars(value);

    if (newValue) {
      dom.setStyle(previewElm, name, newValue);
    }
  });

  // Add attributes to preview element
  each(format.attributes, (value, name) => {
    const newValue = removeVars(value);

    if (newValue) {
      dom.setAttrib(previewElm, name, newValue);
    }
  });

  // Add classes to preview element
  each(format.classes, (value) => {
    const newValue = removeVars(value);

    if (!dom.hasClass(previewElm, newValue)) {
      dom.addClass(previewElm, newValue);
    }
  });

  editor.dispatch('PreviewFormats');

  // Add the previewElm outside the visual area
  dom.setStyles(previewFrag, { position: 'absolute', left: -0xFFFF });
  editor.getBody().appendChild(previewFrag);

  // Get parent container font size so we can compute px values out of em/% for older IE:s
  const rawParentFontSize = getComputedStyle('fontSize');
  const parentFontSize = /px$/.test(rawParentFontSize) ? parseInt(rawParentFontSize, 10) : 0;

  each(previewStyles.split(' '), (name) => {
    let value = getComputedStyle(name, previewElm);

    // If background is transparent then check if the body has a background color we can use
    if (name === 'background-color' && /transparent|rgba\s*\([^)]+,\s*0\)/.test(value)) {
      value = getComputedStyle(name);

      // Ignore white since it's the default color, not the nicest fix
      // TODO: Fix this by detecting runtime style
      if (Transformations.rgbaToHexString(value).toLowerCase() === '#ffffff') {
        return;
      }
    }

    if (name === 'color') {
      // Ignore black since it's the default color, not the nicest fix
      // TODO: Fix this by detecting runtime style
      if (Transformations.rgbaToHexString(value).toLowerCase() === '#000000') {
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

  editor.dispatch('AfterPreviewFormats');

  // previewCss += 'line-height:normal';

  dom.remove(previewFrag);

  return previewCss;
};

export {
  getCssText,
  parseSelector,
  selectorToHtml
};
