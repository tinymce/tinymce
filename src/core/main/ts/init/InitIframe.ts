/**
 * InitIframe.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Element, Attr, Css } from '@ephox/sugar';
import Env from '../api/Env';
import Settings from '../api/Settings';
import DOMUtils from '../api/dom/DOMUtils';
import InitContentBody from './InitContentBody';
import Uuid from '../util/Uuid';

const DOM = DOMUtils.DOM;

const relaxDomain = function (editor, ifr) {
  // Domain relaxing is required since the user has messed around with document.domain
  // This only applies to IE 11 other browsers including Edge seems to handle document.domain
  if (document.domain !== window.location.hostname && Env.ie && Env.ie < 12) {
    const bodyUuid = Uuid.uuid('mce');

    editor[bodyUuid] = function () {
      InitContentBody.initContentBody(editor);
    };

    /*eslint no-script-url:0 */
    const domainRelaxUrl = 'javascript:(function(){' +
      'document.open();document.domain="' + document.domain + '";' +
      'var ed = window.parent.tinymce.get("' + editor.id + '");document.write(ed.iframeHTML);' +
      'document.close();ed.' + bodyUuid + '(true);})()';

    DOM.setAttrib(ifr, 'src', domainRelaxUrl);
    return true;
  }

  return false;
};

const normalizeHeight = function (height) {
  const normalizedHeight = typeof height === 'number' ? height + 'px' : height;
  return normalizedHeight ? normalizedHeight : '';
};

const createIframeElement = function (id, title, height, customAttrs) {
  const iframe = Element.fromTag('iframe');

  Attr.setAll(iframe, customAttrs);

  Attr.setAll(iframe, {
    id: id + '_ifr',
    frameBorder: '0',
    allowTransparency: 'true',
    title
  });

  Css.setAll(iframe, {
    width: '100%',
    height: normalizeHeight(height),
    display: 'block' // Important for Gecko to render the iframe correctly
  });

  return iframe;
};

const getIframeHtml = function (editor) {
  let bodyId, bodyClass, iframeHTML;

  iframeHTML = Settings.getDocType(editor) + '<html><head>';

  // We only need to override paths if we have to
  // IE has a bug where it remove site absolute urls to relative ones if this is specified
  if (Settings.getDocumentBaseUrl(editor) !== editor.documentBaseUrl) {
    iframeHTML += '<base href="' + editor.documentBaseURI.getURI() + '" />';
  }

  iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

  bodyId = Settings.getBodyId(editor);
  bodyClass = Settings.getBodyClass(editor);

  if (Settings.getContentSecurityPolicy(editor)) {
    iframeHTML += '<meta http-equiv="Content-Security-Policy" content="' + Settings.getContentSecurityPolicy(editor) + '" />';
  }

  iframeHTML += '</head><body id="' + bodyId +
    '" class="mce-content-body ' + bodyClass +
    '" data-id="' + editor.id + '"><br></body></html>';

  return iframeHTML;
};

const createIframe = function (editor, o) {
  const title = editor.editorManager.translate(
    'Rich Text Area. Press ALT-F9 for menu. ' +
    'Press ALT-F10 for toolbar. Press ALT-0 for help'
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

const init = function (editor, boxInfo) {
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

export default {
  init
};