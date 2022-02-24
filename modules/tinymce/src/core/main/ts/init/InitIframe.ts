import { Optional, Strings } from '@ephox/katamari';
import { Attribute, Class, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import { TranslatedString } from '../api/util/I18n';
import * as InitContentBody from './InitContentBody';

const DOM = DOMUtils.DOM;

const createIframeElement = (id: string, title: TranslatedString, customAttrs: {}, tabindex: Optional<number>) => {
  const iframe = SugarElement.fromTag('iframe');

  // This can also be explicitly set by customAttrs, so do this first
  tabindex.each((t) => Attribute.set(iframe, 'tabindex', t));

  Attribute.setAll(iframe, customAttrs);

  Attribute.setAll(iframe, {
    id: id + '_ifr',
    frameBorder: '0',
    allowTransparency: 'true',
    title
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

const createIframe = (editor: Editor, boxInfo) => {
  const iframeTitle = editor.translate('Rich Text Area');
  const tabindex = Attribute.getOpt(SugarElement.fromDom(editor.getElement()), 'tabindex').bind(Strings.toInt);
  const ifr = createIframeElement(editor.id, iframeTitle, Options.getIframeAttrs(editor), tabindex).dom;

  ifr.onload = () => {
    ifr.onload = null;
    editor.dispatch('load');
  };

  editor.contentAreaContainer = boxInfo.iframeContainer;
  editor.iframeElement = ifr;
  editor.iframeHTML = getIframeHtml(editor);
  DOM.add(boxInfo.iframeContainer, ifr);
};

const init = (editor: Editor, boxInfo) => {
  createIframe(editor, boxInfo);

  if (boxInfo.editorContainer) {
    DOM.get(boxInfo.editorContainer).style.display = editor.orgDisplay;
    editor.hidden = DOM.isHidden(boxInfo.editorContainer);
  }

  editor.getElement().style.display = 'none';
  DOM.setAttrib(editor.id, 'aria-hidden', 'true');

  InitContentBody.initContentBody(editor);
};

export {
  init
};
