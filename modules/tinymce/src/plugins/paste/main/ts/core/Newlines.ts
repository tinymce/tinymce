/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj } from '@ephox/katamari';

import Entities from 'tinymce/core/api/html/Entities';
import Tools from 'tinymce/core/api/util/Tools';

export interface RootAttrs {[key: string]: string }

/**
 * Newlines class contains utilities to convert newlines (\n or \r\n) tp BRs or to a combination of the specified block element and BRs
 *
 * @class tinymce.Newlines
 * @private
 */

const isPlainText = (text: string): boolean => {
  // so basically any tag that is not one of the "p, div, span, br", or is one of them, but is followed
  // by some additional characters qualifies the text as not a plain text (having some HTML tags)
  // <span style="white-space:pre"> and <br /> are added as separate exceptions to the rule
  return !/<(?:\/?(?!(?:div|p|br|span)>)\w+|(?:(?!(?:span style="white-space:\s?pre;?">)|br\s?\/>))\w+\s[^>]+)>/i.test(text);
};

const toBRs = (text: string): string =>
  text.replace(/\r?\n/g, '<br>');

const openContainer = (rootTag: string, rootAttrs: RootAttrs): string => {
  const attrs: string[] = [];
  let tag = '<' + rootTag;

  if (typeof rootAttrs === 'object') {
    for (const key in rootAttrs) {
      if (Obj.has(rootAttrs, key)) {
        attrs.push(key + '="' + Entities.encodeAllRaw(rootAttrs[key]) + '"');
      }
    }

    if (attrs.length) {
      tag += ' ' + attrs.join(' ');
    }
  }
  return tag + '>';
};

const toBlockElements = (text: string, rootTag: string, rootAttrs: RootAttrs): string => {
  const blocks = text.split(/\n\n/);
  const tagOpen = openContainer(rootTag, rootAttrs);
  const tagClose = '</' + rootTag + '>';

  const paragraphs = Tools.map(blocks, (p) => {
    return p.split(/\n/).join('<br />');
  });

  const stitch = (p: string): string => {
    return tagOpen + p + tagClose;
  };

  return paragraphs.length === 1 ? paragraphs[0] : Tools.map(paragraphs, stitch).join('');
};

const convert = (text: string, rootTag: string | boolean, rootAttrs: RootAttrs): string =>
  rootTag ? toBlockElements(text, rootTag === true ? 'p' : rootTag, rootAttrs) : toBRs(text);

export {
  isPlainText,
  convert,
  toBRs,
  toBlockElements
};
