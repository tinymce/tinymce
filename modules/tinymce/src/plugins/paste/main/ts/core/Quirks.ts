/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';

import * as Settings from '../api/Settings';
import * as Utils from './Utils';
import * as WordFilter from './WordFilter';

type PreProcessFilter = (editor: Editor, content: string, internal: boolean, wordContent: boolean) => string;
type PostProcessFilter = (editor: Editor, node: HTMLElement) => void;

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
    e.content = filterFunc(editor, e.content, e.internal, e.wordContent);
  });
};

const addPostProcessFilter = (editor: Editor, filterFunc: PostProcessFilter) => {
  editor.on('PastePostProcess', (e) => {
    filterFunc(editor, e.node);
  });
};

/**
 * Removes BR elements after block elements. IE9 has a nasty bug where it puts a BR element after each
 * block element when pasting from word. This removes those elements.
 *
 * This:
 *  <p>a</p><br><p>b</p>
 *
 * Becomes:
 *  <p>a</p><p>b</p>
 */
const removeExplorerBrElementsAfterBlocks = (editor: Editor, html: string): string => {
  // Only filter word specific content
  if (!WordFilter.isWordContent(html)) {
    return html;
  }

  // Produce block regexp based on the block elements in schema
  const blockElements: string[] = [];

  Tools.each(editor.schema.getBlockElements(), (block: Element, blockName: string) => {
    blockElements.push(blockName);
  });

  const explorerBlocksRegExp = new RegExp(
    '(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*(<\\/?(' + blockElements.join('|') + ')[^>]*>)(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*',
    'g'
  );

  // Remove BR:s from: <BLOCK>X</BLOCK><BR>
  html = Utils.filter(html, [
    [ explorerBlocksRegExp, '$1' ]
  ]);

  // IE9 also adds an extra BR element for each soft-linefeed and it also adds a BR for each word wrap break
  html = Utils.filter(html, [
    [ /<br><br>/g, '<BR><BR>' ], // Replace multiple BR elements with uppercase BR to keep them intact
    [ /<br>/g, ' ' ],            // Replace single br elements with space since they are word wrap BR:s
    [ /<BR><BR>/g, '<br>' ]      // Replace back the double brs but into a single BR
  ]);

  return html;
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
const removeWebKitStyles = (editor: Editor, content: string, internal: boolean, isWordHtml: boolean): string => {
  // WordFilter has already processed styles at this point and internal doesn't need any processing
  if (isWordHtml || internal) {
    return content;
  }

  // Filter away styles that isn't matching the target node
  const webKitStylesSetting = Settings.getWebkitStyles(editor);
  let webKitStyles: string[] | string;

  if (Settings.shouldRemoveWebKitStyles(editor) === false || webKitStylesSetting === 'all') {
    return content;
  }

  if (webKitStylesSetting) {
    webKitStyles = webKitStylesSetting.split(/[, ]/);
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

const removeUnderlineAndFontInAnchor = (editor: Editor, root: Element): void => {
  editor.$('a', root).find('font,u').each((i, node) => {
    editor.dom.remove(node, true);
  });
};

const setup = (editor: Editor): void => {
  if (Env.webkit) {
    addPreProcessFilter(editor, removeWebKitStyles);
  }

  if (Env.ie) {
    addPreProcessFilter(editor, removeExplorerBrElementsAfterBlocks);
    addPostProcessFilter(editor, removeUnderlineAndFontInAnchor);
  }
};

export {
  setup
};
