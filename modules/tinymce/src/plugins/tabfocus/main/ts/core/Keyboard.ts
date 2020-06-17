/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { window } from '@ephox/dom-globals';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Env from 'tinymce/core/api/Env';
import Delay from 'tinymce/core/api/util/Delay';
import Tools from 'tinymce/core/api/util/Tools';
import VK from 'tinymce/core/api/util/VK';
import * as Settings from '../api/Settings';

const DOM = DOMUtils.DOM;

const tabCancel = function (e) {
  if (e.keyCode === VK.TAB && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
  }
};

const setup = function (editor: Editor) {
  function tabHandler(e) {
    let x, el, i;

    if (e.keyCode !== VK.TAB || e.ctrlKey || e.altKey || e.metaKey || e.isDefaultPrevented()) {
      return;
    }

    function find(direction) {
      el = DOM.select(':input:enabled,*[tabindex]:not(iframe)');

      function canSelectRecursive(e) {
        return e.nodeName === 'BODY' || (e.type !== 'hidden' &&
          e.style.display !== 'none' &&
          e.style.visibility !== 'hidden' && canSelectRecursive(e.parentNode));
      }

      function canSelect(el) {
        return /INPUT|TEXTAREA|BUTTON/.test(el.tagName) && EditorManager.get(e.id) && el.tabIndex !== -1 && canSelectRecursive(el);
      }

      Tools.each(el, function (e, i) {
        if (e.id === editor.id) {
          x = i;
          return false;
        }
      });
      if (direction > 0) {
        for (i = x + 1; i < el.length; i++) {
          if (canSelect(el[i])) {
            return el[i];
          }
        }
      } else {
        for (i = x - 1; i >= 0; i--) {
          if (canSelect(el[i])) {
            return el[i];
          }
        }
      }

      return null;
    }

    const v = Tools.explode(Settings.getTabFocus(editor));

    if (v.length === 1) {
      v[1] = v[0];
      v[0] = ':prev';
    }

    // Find element to focus
    if (e.shiftKey) {
      if (v[0] === ':prev') {
        el = find(-1);
      } else {
        el = DOM.get(v[0]);
      }
    } else {
      if (v[1] === ':next') {
        el = find(1);
      } else {
        el = DOM.get(v[1]);
      }
    }

    if (el) {
      const focusEditor = EditorManager.get(el.id || el.name);

      if (el.id && focusEditor) {
        focusEditor.focus();
      } else {
        Delay.setTimeout(function () {
          if (!Env.webkit) {
            window.focus();
          }

          el.focus();
        }, 10);
      }

      e.preventDefault();
    }
  }

  editor.on('init', function () {
    if (editor.inline) {
      // Remove default tabIndex in inline mode
      DOM.setAttrib(editor.getBody(), 'tabIndex', null);
    }

    editor.on('keyup', tabCancel);

    if (Env.gecko) {
      editor.on('keypress keydown', tabHandler);
    } else {
      editor.on('keydown', tabHandler);
    }
  });
};

export {
  setup
};
