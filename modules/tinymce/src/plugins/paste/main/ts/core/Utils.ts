/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Unicode } from '@ephox/katamari';

import DomParser from 'tinymce/core/api/html/DomParser';
import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';
import Tools from 'tinymce/core/api/util/Tools';

type RegExpFilter = RegExp | [ RegExp, string ] | [ RegExp, (match: string, ...args: any[]) => string ];

const isRegExp = (val: unknown): val is RegExp =>
  val.constructor === RegExp;

/**
 * This class contails various utility functions for the paste plugin.
 *
 * @class tinymce.pasteplugin.Utils
 */

const filter = (content: string, items: RegExpFilter[]): string => {
  Tools.each(items, (v) => {
    if (isRegExp(v)) {
      content = content.replace(v, '');
    } else {
      content = content.replace(v[0], v[1] as any);
    }
  });

  return content;
};

/**
 * Gets the innerText of the specified element. It will handle edge cases
 * and works better than textContent on Gecko.
 *
 * @param {String} html HTML string to get text from.
 * @return {String} String of text with line feeds.
 */
const innerText = (html: string): string => {
  const schema = Schema();
  const domParser = DomParser({}, schema);
  let text = '';
  const shortEndedElements = schema.getShortEndedElements();
  const ignoreElements = Tools.makeMap('script noscript style textarea video audio iframe object', ' ');
  const blockElements = schema.getBlockElements();

  const walk = (node: AstNode): void => {
    const name = node.name, currentNode = node;

    if (name === 'br') {
      text += '\n';
      return;
    }

    // Ignore wbr, to replicate innerText on Chrome/Firefox
    if (name === 'wbr') {
      return;
    }

    // img/input/hr but ignore wbr as it's just a potential word break
    if (shortEndedElements[name]) {
      text += ' ';
    }

    // Ignore script, video contents
    if (ignoreElements[name]) {
      text += ' ';
      return;
    }

    if (node.type === 3) {
      text += node.value;
    }

    // Walk all children
    if (!node.shortEnded) {
      if ((node = node.firstChild)) {
        do {
          walk(node);
        } while ((node = node.next));
      }
    }

    // Add \n or \n\n for blocks or P
    if (blockElements[name] && currentNode.next) {
      text += '\n';

      if (name === 'p') {
        text += '\n';
      }
    }
  };

  html = filter(html, [
    /<!\[[^\]]+\]>/g // Conditional comments
  ]);

  walk(domParser.parse(html));

  return text;
};

/**
 * Trims the specified HTML by removing all WebKit fragments, all elements wrapping the body trailing BR elements etc.
 *
 * @param {String} html Html string to trim contents on.
 * @return {String} Html contents that got trimmed.
 */
const trimHtml = (html: string): string => {
  const trimSpaces = (all: string, s1?: string, s2?: string) => {
    // WebKit &nbsp; meant to preserve multiple spaces but instead inserted around all inline tags,
    // including the spans with inline styles created on paste
    if (!s1 && !s2) {
      return ' ';
    }

    return Unicode.nbsp;
  };

  html = filter(html, [
    /^[\s\S]*<body[^>]*>\s*|\s*<\/body[^>]*>[\s\S]*$/ig, // Remove anything but the contents within the BODY element
    /<!--StartFragment-->|<!--EndFragment-->/g, // Inner fragments (tables from excel on mac)
    [ /( ?)<span class="Apple-converted-space">\u00a0<\/span>( ?)/g, trimSpaces ],
    /<br class="Apple-interchange-newline">/g,
    /<br>$/i // Trailing BR elements
  ]);

  return html;
};

// TODO: Should be in some global class
const createIdGenerator = (prefix: string): () => string => {
  let count = 0;

  return () => {
    return prefix + (count++);
  };
};

const getImageMimeType = (ext: string): string => {
  const lowerExt = ext.toLowerCase();
  const mimeOverrides: Record<string, string> = {
    jpg: 'jpeg',
    jpe: 'jpeg',
    jfi: 'jpeg',
    jif: 'jpeg',
    jfif: 'jpeg',
    pjpeg: 'jpeg',
    pjp: 'jpeg',
    svg: 'svg+xml'
  };
  return Tools.hasOwn(mimeOverrides, lowerExt) ? 'image/' + mimeOverrides[lowerExt] : 'image/' + lowerExt;
};

export {
  filter,
  innerText,
  trimHtml,
  createIdGenerator,
  getImageMimeType
};
