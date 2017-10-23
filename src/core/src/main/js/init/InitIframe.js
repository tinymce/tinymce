/**
 * InitIframe.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.init.InitIframe',
  [
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'global!document',
    'global!window',
    'tinymce.core.Env',
    'tinymce.core.api.Settings',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.init.InitContentBody',
    'tinymce.core.util.Uuid'
  ],
  function (Element, Attr, Css, document, window, Env, Settings, DOMUtils, InitContentBody, Uuid) {
    var DOM = DOMUtils.DOM;

    var relaxDomain = function (editor, ifr) {
      // Domain relaxing is required since the user has messed around with document.domain
      // This only applies to IE 11 other browsers including Edge seems to handle document.domain
      if (document.domain !== window.location.hostname && Env.ie && Env.ie < 12) {
        var bodyUuid = Uuid.uuid('mce');

        editor[bodyUuid] = function () {
          InitContentBody.initContentBody(editor);
        };

        /*eslint no-script-url:0 */
        var domainRelaxUrl = 'javascript:(function(){' +
          'document.open();document.domain="' + document.domain + '";' +
          'var ed = window.parent.tinymce.get("' + editor.id + '");document.write(ed.iframeHTML);' +
          'document.close();ed.' + bodyUuid + '(true);})()';

        DOM.setAttrib(ifr, 'src', domainRelaxUrl);
        return true;
      }

      return false;
    };

    var normalizeHeight = function (height) {
      var normalizedHeight = typeof height === 'number' ? height + 'px' : height;
      return normalizedHeight ? normalizedHeight : '';
    };

    var createIframeElement = function (id, title, height, customAttrs) {
      var iframe = Element.fromTag('iframe');

      Attr.setAll(iframe, customAttrs);

      Attr.setAll(iframe, {
        id: id + '_ifr',
        frameBorder: '0',
        allowTransparency: 'true',
        title: title
      });

      Css.setAll(iframe, {
        width: '100%',
        height: normalizeHeight(height),
        display: 'block' // Important for Gecko to render the iframe correctly
      });

      return iframe;
    };

    var getIframeHtml = function (editor) {
      var bodyId, bodyClass, iframeHTML;

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

    var createIframe = function (editor, o) {
      var title = editor.editorManager.translate(
        "Rich Text Area. Press ALT-F9 for menu. " +
        "Press ALT-F10 for toolbar. Press ALT-0 for help"
      );

      var ifr = createIframeElement(editor.id, title, o.height, Settings.getIframeAttrs(editor)).dom();

      ifr.onload = function () {
        ifr.onload = null;
        editor.fire("load");
      };

      var isDomainRelaxed = relaxDomain(editor, ifr);

      editor.contentAreaContainer = o.iframeContainer;
      editor.iframeElement = ifr;
      editor.iframeHTML = getIframeHtml(editor);

      DOM.add(o.iframeContainer, ifr);

      return isDomainRelaxed;
    };

    var init = function (editor, boxInfo) {
      var isDomainRelaxed = createIframe(editor, boxInfo);

      if (boxInfo.editorContainer) {
        DOM.get(boxInfo.editorContainer).style.display = editor.orgDisplay;
        editor.hidden = DOM.isHidden(boxInfo.editorContainer);
      }

      editor.getElement().style.display = 'none';
      DOM.setAttrib(editor.id, 'aria-hidden', true);

      if (!isDomainRelaxed) {
        InitContentBody.initContentBody(editor);
      }
    };

    return {
      init: init
    };
  }
);
