/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, HTMLLinkElement } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import * as Parser from './Parser';
import * as Protect from './Protect';

const each = Tools.each;

const low = (s: string) =>
  s.replace(/<\/?[A-Z]+/g, (a: string) => a.toLowerCase());

const handleSetContent = function (editor: Editor, headState, footState, evt) {
  let startPos, endPos, content, styles = '';
  const dom = editor.dom;

  if (evt.selection) {
    return;
  }

  content = Protect.protectHtml(Settings.getProtect(editor), evt.content);

  // Ignore raw updated if we already have a head, this will fix issues with undo/redo keeping the head/foot separate
  if (evt.format === 'raw' && headState.get()) {
    return;
  }

  if (evt.source_view && Settings.shouldHideInSourceView(editor)) {
    return;
  }

  // Fixed so new document/setContent('') doesn't remove existing header/footer except when it's in source code view
  if (content.length === 0 && !evt.source_view) {
    content = Tools.trim(headState.get()) + '\n' + Tools.trim(content) + '\n' + Tools.trim(footState.get());
  }

  // Parse out head, body and footer
  content = content.replace(/<(\/?)BODY/gi, '<$1body');
  startPos = content.indexOf('<body');

  if (startPos !== -1) {
    startPos = content.indexOf('>', startPos);
    headState.set(low(content.substring(0, startPos + 1)));

    endPos = content.indexOf('</body', startPos);
    if (endPos === -1) {
      endPos = content.length;
    }

    evt.content = Tools.trim(content.substring(startPos + 1, endPos));
    footState.set(low(content.substring(endPos)));
  } else {
    headState.set(getDefaultHeader(editor));
    footState.set('\n</body>\n</html>');
  }

  // Parse header and update iframe
  const headerFragment = Parser.parseHeader(headState.get());
  each(headerFragment.getAll('style'), function (node) {
    if (node.firstChild) {
      styles += node.firstChild.value;
    }
  });

  const bodyElm = headerFragment.getAll('body')[0];
  if (bodyElm) {
    dom.setAttribs(editor.getBody(), {
      style: bodyElm.attr('style') || '',
      dir: bodyElm.attr('dir') || '',
      vLink: bodyElm.attr('vlink') || '',
      link: bodyElm.attr('link') || '',
      aLink: bodyElm.attr('alink') || ''
    });
  }

  dom.remove('fullpage_styles');

  const headElm = editor.getDoc().getElementsByTagName('head')[0];

  if (styles) {
    const styleElm = dom.add(headElm, 'style', { id: 'fullpage_styles' });
    styleElm.appendChild(document.createTextNode(styles));
  }

  const currentStyleSheetsMap: Record<string, HTMLLinkElement> = {};
  Tools.each(headElm.getElementsByTagName('link'), function (stylesheet: HTMLLinkElement) {
    if (stylesheet.rel === 'stylesheet' && stylesheet.getAttribute('data-mce-fullpage')) {
      currentStyleSheetsMap[stylesheet.href] = stylesheet;
    }
  });

  // Add new
  Tools.each(headerFragment.getAll('link'), function (stylesheet) {
    const href = stylesheet.attr('href');
    if (!href) {
      return true;
    }

    if (!currentStyleSheetsMap[href] && stylesheet.attr('rel') === 'stylesheet') {
      dom.add(headElm, 'link', {
        'rel': 'stylesheet',
        'text': 'text/css',
        href,
        'data-mce-fullpage': '1'
      });
    }

    delete currentStyleSheetsMap[href];
  });

  // Delete old
  Tools.each(currentStyleSheetsMap, function (stylesheet) {
    stylesheet.parentNode.removeChild(stylesheet);
  });
};

const getDefaultHeader = function (editor) {
  let header = '', value, styles = '';

  if (Settings.getDefaultXmlPi(editor)) {
    const piEncoding = Settings.getDefaultEncoding(editor);
    header += '<?xml version="1.0" encoding="' + (piEncoding ? piEncoding : 'ISO-8859-1') + '" ?>\n';
  }

  header += Settings.getDefaultDocType(editor);
  header += '\n<html>\n<head>\n';

  if ((value = Settings.getDefaultTitle(editor))) {
    header += '<title>' + value + '</title>\n';
  }

  if ((value = Settings.getDefaultEncoding(editor))) {
    header += '<meta http-equiv="Content-Type" content="text/html; charset=' + value + '" />\n';
  }

  if ((value = Settings.getDefaultFontFamily(editor))) {
    styles += 'font-family: ' + value + ';';
  }

  if ((value = Settings.getDefaultFontSize(editor))) {
    styles += 'font-size: ' + value + ';';
  }

  if ((value = Settings.getDefaultTextColor(editor))) {
    styles += 'color: ' + value + ';';
  }

  header += '</head>\n<body' + (styles ? ' style="' + styles + '"' : '') + '>\n';

  return header;
};

const handleGetContent = function (editor: Editor, head, foot, evt) {
  if (!evt.selection && (!evt.source_view || !Settings.shouldHideInSourceView(editor))) {
    evt.content = Protect.unprotectHtml(Tools.trim(head) + '\n' + Tools.trim(evt.content) + '\n' + Tools.trim(foot));
  }
};

const setup = function (editor: Editor, headState, footState) {
  editor.on('BeforeSetContent', function (evt) {
    handleSetContent(editor, headState, footState, evt);
  });
  editor.on('GetContent', function (evt) {
    handleGetContent(editor, headState.get(), footState.get(), evt);
  });
};

export {
  setup
};
