/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, window } from '@ephox/dom-globals';
import { Attr, Class, Element } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Settings from '../api/Settings';
import { TranslatedString } from '../api/util/I18n';
import * as Uuid from '../util/Uuid';
import * as InitContentBody from './InitContentBody';

const DOM = DOMUtils.DOM;

const relaxDomain = function (editor: Editor, ifr) {
  // Domain relaxing is required since the user has messed around with document.domain
  // This only applies to IE 11 other browsers including Edge seems to handle document.domain
  if (document.domain !== window.location.hostname && Env.browser.isIE()) {
    const bodyUuid = Uuid.uuid('mce');

    editor[bodyUuid] = function () {
      InitContentBody.initContentBody(editor);
    };

    /* eslint no-script-url:0 */
    const domainRelaxUrl = 'javascript:(function(){' +
      'document.open();document.domain="' + document.domain + '";' +
      'var ed = window.parent.tinymce.get("' + editor.id + '");document.write(ed.iframeHTML);' +
      'document.close();ed.' + bodyUuid + '(true);})()';

    DOM.setAttrib(ifr, 'src', domainRelaxUrl);
    return true;
  }

  return false;
};

const createIframeElement = function (id: string, title: TranslatedString, height: number, customAttrs: {}) {
  const iframe = Element.fromTag('iframe');

  Attr.setAll(iframe, customAttrs);

  Attr.setAll(iframe, {
    id: id + '_ifr',
    frameBorder: '0',
    allowTransparency: 'true',
    title
  });

  Class.add(iframe, 'tox-edit-area__iframe');

  return iframe;
};

const getIframeHtml = function (editor: Editor) {
  let iframeHTML = Settings.getDocType(editor) + '<html><head>';

  // We only need to override paths if we have to
  // IE has a bug where it remove site absolute urls to relative ones if this is specified
  if (Settings.getDocumentBaseUrl(editor) !== editor.documentBaseUrl) {
    iframeHTML += '<base href="' + editor.documentBaseURI.getURI() + '" />';
  }

  iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

  const bodyId = Settings.getBodyId(editor);
  const bodyClass = Settings.getBodyClass(editor);

  if (Settings.getContentSecurityPolicy(editor)) {
    iframeHTML += '<meta http-equiv="Content-Security-Policy" content="' + Settings.getContentSecurityPolicy(editor) + '" />';
  }

  iframeHTML += '</head><body id="' + bodyId +
    '" class="mce-content-body ' + bodyClass +
    '" data-id="' + editor.id + '"><br></body></html>';

  return iframeHTML;
};

const createIframe = function (editor: Editor, o) {
  const title = editor.editorManager.translate(
    'Rich Text Area. Press ALT-0 for help.'
  );

  const ifr = createIframeElement(editor.id, title, o.height, Settings.getIframeAttrs(editor)).dom();

  ifr.onload = function () {
    ifr.onload = null;
    editor.fire('load');
  };

  const isDomainRelaxed = relaxDomain(editor, ifr);

  editor.contentAreaContainer = o.iframeContainer;
  editor.iframeElement = ifr;
  editor.iframeHTML = getIframeHtml(editor);
  DOM.add(o.iframeContainer, ifr);

  return isDomainRelaxed;
};

const init = function (editor: Editor, boxInfo) {
  const isDomainRelaxed = createIframe(editor, boxInfo);

  if (boxInfo.editorContainer) {
    DOM.get(boxInfo.editorContainer).style.display = editor.orgDisplay;
    editor.hidden = DOM.isHidden(boxInfo.editorContainer);
  }

  editor.getElement().style.display = 'none';
  DOM.setAttrib(editor.id, 'aria-hidden', 'true');

  if (!isDomainRelaxed) {
    InitContentBody.initContentBody(editor);
  }
};

export {
  init
};
