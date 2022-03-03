import { Transformations } from '@ephox/acid';

import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';

type PreProcessFilter = (editor: Editor, content: string, internal: boolean) => string;

/*
 * This module contains various fixes for browsers. These issues can not be feature
 * detected since we have no direct control over the clipboard. However we might be able
 * to remove some of these fixes once the browsers gets updated/fixed.
 */

const addPreProcessFilter = (editor: Editor, filterFunc: PreProcessFilter) => {
  editor.on('PastePreProcess', (e) => {
    e.content = filterFunc(editor, e.content, e.internal);
  });
};

const rgbRegExp = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi;

const rgbToHex = (value: string | undefined): string =>
  Tools.trim(value).replace(rgbRegExp, Transformations.rgbaToHexString).toLowerCase();

/*
 * WebKit has a nasty quirk where the all computed styles gets added to style attributes when copy/pasting contents.
 * This fix solves that by simply removing the whole style attribute.
 *
 * The paste_webkit_styles option can be set to specify what to keep:
 *  paste_webkit_styles: "none" // Keep no styles
 *  paste_webkit_styles: "all", // Keep all of them
 *  paste_webkit_styles: "font-weight color" // Keep specific ones
 */
const removeWebKitStyles = (editor: Editor, content: string, internal: boolean): string => {
  const webKitStylesOption = Options.getPasteWebkitStyles(editor);

  // If the content is internal or if we're keeping all styles then we don't need any processing
  if (internal || webKitStylesOption === 'all' || !Options.shouldPasteRemoveWebKitStyles(editor)) {
    return content;
  }

  const webKitStyles = webKitStylesOption ? webKitStylesOption.split(/[, ]/) : [];

  // Keep specific styles that don't match the current node computed style
  if (webKitStyles && webKitStylesOption !== 'none') {
    const dom = editor.dom, node = editor.selection.getNode();

    content = content.replace(/(<[^>]+) style="([^"]*)"([^>]*>)/gi, (all, before, value, after) => {
      const inputStyles = dom.parseStyle(dom.decode(value));
      const outputStyles: Record<string, string | number> = {};

      for (let i = 0; i < webKitStyles.length; i++) {
        const inputValue = inputStyles[webKitStyles[i]];
        let compareInput = inputValue;
        let currentValue = dom.getStyle(node, webKitStyles[i], true);

        if (/color/.test(webKitStyles[i])) {
          compareInput = rgbToHex(compareInput);
          currentValue = rgbToHex(currentValue);
        }

        if (currentValue !== compareInput) {
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
