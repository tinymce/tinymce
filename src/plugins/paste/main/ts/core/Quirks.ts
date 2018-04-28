/**
 * Quirks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import Utils from './Utils';
import WordFilter from './WordFilter';
import { Editor } from 'tinymce/core/api/Editor';

/**
 * This class contains various fixes for browsers. These issues can not be feature
 * detected since we have no direct control over the clipboard. However we might be able
 * to remove some of these fixes once the browsers gets updated/fixed.
 *
 * @class tinymce.pasteplugin.Quirks
 * @private
 */

function addPreProcessFilter(editor: Editor, filterFunc) {
  editor.on('PastePreProcess', function (e) {
    e.content = filterFunc(editor, e.content, e.internal, e.wordContent);
  });
}

function addPostProcessFilter(editor: Editor, filterFunc) {
  editor.on('PastePostProcess', function (e) {
    filterFunc(editor, e.node);
  });
}

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
function removeExplorerBrElementsAfterBlocks(editor: Editor, html: string) {
  // Only filter word specific content
  if (!WordFilter.isWordContent(html)) {
    return html;
  }

  // Produce block regexp based on the block elements in schema
  const blockElements = [];

  Tools.each(editor.schema.getBlockElements(), function (block: Element, blockName: string) {
    blockElements.push(blockName);
  });

  const explorerBlocksRegExp = new RegExp(
    '(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*(<\\/?(' + blockElements.join('|') + ')[^>]*>)(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*',
    'g'
  );

  // Remove BR:s from: <BLOCK>X</BLOCK><BR>
  html = Utils.filter(html, [
    [explorerBlocksRegExp, '$1']
  ]);

  // IE9 also adds an extra BR element for each soft-linefeed and it also adds a BR for each word wrap break
  html = Utils.filter(html, [
    [/<br><br>/g, '<BR><BR>'], // Replace multiple BR elements with uppercase BR to keep them intact
    [/<br>/g, ' '],            // Replace single br elements with space since they are word wrap BR:s
    [/<BR><BR>/g, '<br>']      // Replace back the double brs but into a single BR
  ]);

  return html;
}

/**
 * WebKit has a nasty bug where the all computed styles gets added to style attributes when copy/pasting contents.
 * This fix solves that by simply removing the whole style attribute.
 *
 * The paste_webkit_styles option can be set to specify what to keep:
 *  paste_webkit_styles: "none" // Keep no styles
 *  paste_webkit_styles: "all", // Keep all of them
 *  paste_webkit_styles: "font-weight color" // Keep specific ones
 */
function removeWebKitStyles(editor: Editor, content: string, internal: boolean, isWordHtml: boolean) {
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

    content = content.replace(/(<[^>]+) style="([^"]*)"([^>]*>)/gi, function (all, before, value, after) {
      const inputStyles = dom.parseStyle(dom.decode(value));
      let outputStyles = {};

      if (webKitStyles === 'none') {
        return before + after;
      }

      for (let i = 0; i < webKitStyles.length; i++) {
        let inputValue = inputStyles[webKitStyles[i]], currentValue = dom.getStyle(node, webKitStyles[i], true);

        if (/color/.test(webKitStyles[i])) {
          inputValue = dom.toHex(inputValue as string);
          currentValue = dom.toHex(currentValue);
        }

        if (currentValue !== inputValue) {
          outputStyles[webKitStyles[i]] = inputValue;
        }
      }

      outputStyles = dom.serializeStyle(outputStyles, 'span');
      if (outputStyles) {
        return before + ' style="' + outputStyles + '"' + after;
      }

      return before + after;
    });
  } else {
    // Remove all external styles
    content = content.replace(/(<[^>]+) style="([^"]*)"([^>]*>)/gi, '$1$3');
  }

  // Keep internal styles
  content = content.replace(/(<[^>]+) data-mce-style="([^"]+)"([^>]*>)/gi, function (all, before, value, after) {
    return before + ' style="' + value + '"' + after;
  });

  return content;
}

function removeUnderlineAndFontInAnchor(editor: Editor, root: Element) {
  editor.$('a', root).find('font,u').each(function (i, node) {
    editor.dom.remove(node, true);
  });
}

const setup = function (editor: Editor) {
  if (Env.webkit) {
    addPreProcessFilter(editor, removeWebKitStyles);
  }

  if (Env.ie) {
    addPreProcessFilter(editor, removeExplorerBrElementsAfterBlocks);
    addPostProcessFilter(editor, removeUnderlineAndFontInAnchor);
  }
};

export default {
  setup
};