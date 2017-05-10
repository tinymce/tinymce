/**
 * Branding.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.themes.modern.ui.Branding',
  [
    'tinymce.core.dom.DOMUtils'
  ],
  function (DOMUtils) {
    var DOM = DOMUtils.DOM;

    var reposition = function (editor, poweredByElm) {
      return function () {
        var iframeWidth = editor.getContentAreaContainer().querySelector('iframe').offsetWidth;
        var scrollbarWidth = Math.max(iframeWidth - editor.getDoc().documentElement.offsetWidth, 0);
        var statusbarElm = editor.getContainer().querySelector('.mce-statusbar');
        var statusbarHeight = statusbarElm ? statusbarElm.offsetHeight : 1;

        DOM.setStyles(poweredByElm, {
          right: scrollbarWidth + 'px',
          bottom: statusbarHeight + 'px'
        });
      };
    };

    var hide = function (poweredByElm) {
      return function () {
        DOM.hide(poweredByElm);
      };
    };

    var setupEventListeners = function (editor) {
      editor.on('SkinLoaded', function () {
        var poweredByElm = DOM.create('div', { 'class': 'mce-branding-powered-by' });
        editor.getContainer().appendChild(poweredByElm);
        DOM.bind(poweredByElm, 'click', hide(poweredByElm));
        reposition(editor, poweredByElm)();
        editor.on('NodeChange ResizeEditor', reposition(editor, poweredByElm));
      });
    };

    var setup = function (editor) {
      if (editor.settings.branding !== false) {
        setupEventListeners(editor);
      }
    };

    return {
      setup: setup
    };
  }
);
