/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DomParser from 'tinymce/core/api/html/DomParser';
import Schema from 'tinymce/core/api/html/Schema';
import Tools from 'tinymce/core/api/util/Tools';

/**
 * This class contails various utility functions for the paste plugin.
 *
 * @class tinymce.pasteplugin.Utils
 */

function filter(content, items) {
  Tools.each(items, function (v) {
    if (v.constructor === RegExp) {
      content = content.replace(v, '');
    } else {
      content = content.replace(v[0], v[1]);
    }
  });

  return content;
}

/**
 * Gets the innerText of the specified element. It will handle edge cases
 * and works better than textContent on Gecko.
 *
 * @param {String} html HTML string to get text from.
 * @return {String} String of text with line feeds.
 */
function innerText(html: string) {
  const schema = Schema();
  const domParser = DomParser({}, schema);
  let text = '';
  const shortEndedElements = schema.getShortEndedElements();
  const ignoreElements = Tools.makeMap('script noscript style textarea video audio iframe object', ' ');
  const blockElements = schema.getBlockElements();

  function walk(node) {
    const name = node.name, currentNode = node;

    if (name === 'br') {
      text += '\n';
      return;
    }

    // img/input/hr
    if (shortEndedElements[name]) {
      text += ' ';
    }

    // Ingore script, video contents
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
  }

  html = filter(html, [
    /<!\[[^\]]+\]>/g // Conditional comments
  ]);

  walk(domParser.parse(html));

  return text;
}

/**
 * Trims the specified HTML by removing all WebKit fragments, all elements wrapping the body trailing BR elements etc.
 *
 * @param {String} html Html string to trim contents on.
 * @return {String} Html contents that got trimmed.
 */
function trimHtml(html: string) {
  function trimSpaces(all, s1, s2) {
    // WebKit &nbsp; meant to preserve multiple spaces but instead inserted around all inline tags,
    // including the spans with inline styles created on paste
    if (!s1 && !s2) {
      return ' ';
    }

    return '\u00a0';
  }

  // 获取样式
  const match = /<style type="text\/css">([^<]*)<\/style>/.exec(html);
  const css = match && match[1];

  html = filter(html, [
    /^[\s\S]*<body[^>]*>\s*|\s*<\/body[^>]*>[\s\S]*$/ig, // Remove anything but the contents within the BODY element
    /<!--StartFragment-->|<!--EndFragment-->/g, // Inner fragments (tables from excel on mac)
    [/( ?)<span class="Apple-converted-space">\u00a0<\/span>( ?)/g, trimSpaces],
    /<br class="Apple-interchange-newline">/g,
    /<br>$/i // Trailing BR elements
  ]);

  // 有匹配样式进行匹配（例如从InDesign或者pages粘贴进来）
  if (css) {
    const cssObj = css2JSON(css);
    html = html.replace(/<(\w+) class="(\w+)">/g, function (all, tag, className) {
      const key = `${tag}.${className}`;
      const value = cssObj[key];
      let valueStr = '';
      // 保留字体和颜色信息
      ['font', 'color'].forEach(function (item) {
        valueStr += value[item] ? `${item}: ${value[item]};` : '';
      });
      return `<${tag} style="${valueStr}">`;
    });
  }
  return html;
}

// TODO: Should be in some global class
function createIdGenerator(prefix: string) {
  let count = 0;

  return function () {
    return prefix + (count++);
  };
}

const isMsEdge = function () {
  return navigator.userAgent.indexOf(' Edge/') !== -1;
};

const css2JSON = function (css) {
  // Remove all comments from the css-file
  // let open, close;
  // while ((open = css.indexOf('/*')) !== -1 &&
  //   (close = css.indexOf('*/')) !== -1) {
  //   css = css.substring(0, open) + css.substring(close + 2);
  // }

  // Initialize the return value _json_.
  const json = {};

  // Each rule gets parsed and then removed from _css_ until all rules have been
  // parsed.
  while (css.length > 0) {
    // Save the index of the first left bracket and first right bracket.
    const lbracket = css.indexOf('{');
    const rbracket = css.indexOf('}');

    // ## Part 1: The declarations
    //
    // Transform the declarations to an object. For example, the declarations<br/>
    //  `font: 'Times New Roman' 1em; color: #ff0000; margin-top: 1em;`<br/>
    // result in the object<br/>
    // `{"font": "'Times New Roman' 1em", "color": "#ff0000", "margin-top": "1em"}`.

    // Helper method that transform an array to a object, by splitting each
    // declaration (_font: Arial_) into key (_font_) and value(_Arial_).
    const toObject = function (array) {
      const ret = {};
      array.forEach(function (elm) {
        const index = elm.indexOf(':');
        const property = elm.substring(0, index).trim();
        const value = elm.substring(index + 1).trim();
        ret[property] = value;
      });
      return ret;
    };

    // Split the declaration block of the first rule into an array and remove
    // whitespace from each declaration.
    let declarations = css.substring(lbracket + 1, rbracket)
      .split(';')
      .map(function (declaration) {
        return declaration.trim();
      })
      .filter(function (declaration) {
        return declaration.length > 0;
      }); // Remove any empty ("") values from the array

    // _declaration_ is now an array reado to be transformed into an object.
    declarations = toObject(declarations);

    // ## Part 2: The selectors
    //
    // Each selector in the selectors block will be associated with the
    // declarations defined above. For example, `h1, p#bar {color: red}`<br/>
    // result in the object<br/>
    // {"h1": {color: red}, "p#bar": {color: red}}

    // Split the selectors block of the first rule into an array and remove
    // whitespace, e.g. `"h1, p#bar, span.foo"` get parsed to
    // `["h1", "p#bar", "span.foo"]`.
    const selectors = css.substring(0, lbracket)
      .split(',')
      .map(function (selector) {
        return selector.trim();
      });

    // Iterate through each selector from _selectors_.
    selectors.forEach(function (selector) {
      // Initialize the json-object representing the declaration block of
      // _selector_.
      if (!json[selector]) {
        json[selector] = {};
      }
      // Save the declarations to the right selector

      Object.keys(declarations).forEach(function (key) {
        json[selector][key] = declarations[key];
      });
    });
    // Continue to next instance
    css = css.slice(rbracket + 1).trim();
  }
  // return the json data
  return json;
};

export default {
  filter,
  innerText,
  trimHtml,
  createIdGenerator,
  isMsEdge
};