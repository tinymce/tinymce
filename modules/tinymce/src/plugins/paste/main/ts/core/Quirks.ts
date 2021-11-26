/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

import * as Options from '../api/Options';

type PreProcessFilter = (editor: Editor, content: string, internal: boolean) => string;

/**
 * This class contains various fixes for browsers. These issues can not be feature
 * detected since we have no direct control over the clipboard. However we might be able
 * to remove some of these fixes once the browsers gets updated/fixed.
 *
 * @class tinymce.pasteplugin.Quirks
 * @private
 */

const addPreProcessFilter = (editor: Editor, filterFunc: PreProcessFilter) => {
  editor.on('PastePreProcess', (e) => {
    e.content = filterFunc(editor, e.content, e.internal);
  });
};

/**
 * WebKit has a nasty bug where the all computed styles gets added to style attributes when copy/pasting contents.
 * This fix solves that by simply removing the whole style attribute.
 *
 * The paste_webkit_styles option can be set to specify what to keep:
 *  paste_webkit_styles: "none" // Keep no styles
 *  paste_webkit_styles: "all", // Keep all of them
 *  paste_webkit_styles: "font-weight color" // Keep specific ones
 */
const removeWebKitStyles = (editor: Editor, content: string, internal: boolean): string => {
  // Internal doesn't need any processing
  if (internal) {
    return content;
  }

  // Filter away styles that isn't matching the target node
  const webKitStylesOption = Options.getWebkitStyles(editor);
  let webKitStyles: string[] | string;

  if (Options.shouldRemoveWebKitStyles(editor) === false || webKitStylesOption === 'all') {
    return content;
  }

  if (webKitStylesOption) {
    webKitStyles = webKitStylesOption.split(/[, ]/);
  }

  // Keep specific styles that doesn't match the current node computed style
  if (webKitStyles) {
    const dom = editor.dom, node = editor.selection.getNode();

    content = content.replace(/(<[^>]+) style="([^"]*)"([^>]*>)/gi, (all, before, value, after) => {
      const inputStyles = dom.parseStyle(dom.decode(value));
      const outputStyles: Record<string, string | number> = {};

      if (webKitStyles === 'none') {
        return before + after;
      }

      for (let i = 0; i < webKitStyles.length; i++) {
        let inputValue = inputStyles[webKitStyles[i]], currentValue = dom.getStyle(node, webKitStyles[i], true);

        if (/color/.test(webKitStyles[i])) {
          inputValue = dom.toHex(inputValue);
          currentValue = dom.toHex(currentValue);
        }

        if (currentValue !== inputValue) {
          outputStyles[webKitStyles[i]] = inputValue;
        }
      }

      const outputStyle = dom.serializeStyle(outputStyles, 'span');
      if (outputStyle) {
        return before + ' style="' + outputStyle + '"' + after;
      }

      return before + after;
    });
  } else {
    // Remove all external styles
    content = content.replace(/(<[^>]+) style="([^"]*)"([^>]*>)/gi, '$1$3');
  }

  // Keep internal styles
  content = content.replace(/(<[^>]+) data-mce-style="([^"]+)"([^>]*>)/gi, (all, before, value, after) => {
    return before + ' style="' + value + '"' + after;
  });

  return content;
};

const setup = (editor: Editor): void => {
  if (Env.browser.isChromium() || Env.browser.isSafari()) {
    addPreProcessFilter(editor, removeWebKitStyles);
  }
};

export {
  setup
};
