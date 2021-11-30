/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional, Strings } from '@ephox/katamari';
import { Attribute, Class, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Options from '../api/Options';
import { TranslatedString } from '../api/util/I18n';
import * as Uuid from '../util/Uuid';
import * as InitContentBody from './InitContentBody';

const DOM = DOMUtils.DOM;

const relaxDomain = (editor: Editor, ifr) => {
  // Domain relaxing is required since the user has messed around with document.domain
  // This only applies to IE 11 other browsers including Edge seems to handle document.domain
  if (document.domain !== window.location.hostname && Env.browser.isIE()) {
    const bodyUuid = Uuid.uuid('mce');

    editor[bodyUuid] = () => {
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

const createIframeElement = (id: string, title: TranslatedString, customAttrs: {}, tabindex: Optional<number>) => {
  const iframe = SugarElement.fromTag('iframe');

  Attribute.setAll(iframe, customAttrs);

  Attribute.setAll(iframe, {
    id: id + '_ifr',
    frameBorder: '0',
    allowTransparency: 'true',
    title
  });

  Attribute.setOptions(iframe, {
    tabindex
  });

  Class.add(iframe, 'tox-edit-area__iframe');

  return iframe;
};

const getIframeHtml = (editor: Editor) => {
  let iframeHTML = Options.getDocType(editor) + '<html><head>';

  // We only need to override paths if we have to
  // IE has a bug where it remove site absolute urls to relative ones if this is specified
  if (Options.getDocumentBaseUrl(editor) !== editor.documentBaseUrl) {
    iframeHTML += '<base href="' + editor.documentBaseURI.getURI() + '" />';
  }

  iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

  const bodyId = Options.getBodyId(editor);
  const bodyClass = Options.getBodyClass(editor);
  const translatedAriaText = editor.translate(Options.getIframeAriaText(editor));

  if (Options.getContentSecurityPolicy(editor)) {
    iframeHTML += '<meta http-equiv="Content-Security-Policy" content="' + Options.getContentSecurityPolicy(editor) + '" />';
  }

  iframeHTML += '</head>' +
    `<body id="${bodyId}" class="mce-content-body ${bodyClass}" data-id="${editor.id}" aria-label="${translatedAriaText}">` +
    '<br>' +
    '</body></html>';

  return iframeHTML;
};

const createIframe = (editor: Editor, o) => {
  const iframeTitle = editor.translate('Rich Text Area');
  const tabindex = Attribute.getOpt(SugarElement.fromDom(editor.getElement()), 'tabindex').bind(Strings.toInt);
  const ifr = createIframeElement(editor.id, iframeTitle, Options.getIframeAttrs(editor), tabindex).dom;

  ifr.onload = () => {
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

const init = (editor: Editor, boxInfo) => {
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
