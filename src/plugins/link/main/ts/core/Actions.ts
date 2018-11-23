/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import VK from 'tinymce/core/api/util/VK';
import Settings from '../api/Settings';
import OpenUrl from './OpenUrl';
import Utils from './Utils';
import Dialog from '../ui/Dialog';

const getLink = function (editor, elm) {
  return editor.dom.getParent(elm, 'a[href]');
};

const getSelectedLink = function (editor) {
  return getLink(editor, editor.selection.getStart());
};

const getHref = function (elm) {
  // Returns the real href value not the resolved a.href value
  const href = elm.getAttribute('data-mce-href');
  return href ? href : elm.getAttribute('href');
};

const isContextMenuVisible = function (editor) {
  const contextmenu = editor.plugins.contextmenu;
  return contextmenu ? contextmenu.isContextMenuVisible() : false;
};

const hasOnlyAltModifier = function (e) {
  return e.altKey === true && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false;
};

const gotoLink = function (editor, a) {
  if (a) {
    const href = getHref(a);
    if (/^#/.test(href)) {
      const targetEl = editor.$(href);
      if (targetEl.length) {
        editor.selection.scrollIntoView(targetEl[0], true);
      }
    } else {
      OpenUrl.open(a.href);
    }
  }
};

const openDialog = function (editor) {
  return function () {
    Dialog.open(editor);
  };
};

const gotoSelectedLink = function (editor) {
  return function () {
    gotoLink(editor, getSelectedLink(editor));
  };
};

const leftClickedOnAHref = function (editor) {
  return function (elm) {
    let sel, rng, node;
    if (Settings.hasContextToolbar(editor.settings) && !isContextMenuVisible(editor) && Utils.isLink(elm)) {
      sel = editor.selection;
      rng = sel.getRng();
      node = rng.startContainer;
      // ignore cursor positions at the beginning/end (to make context toolbar less noisy)
      if (node.nodeType === 3 && sel.isCollapsed() && rng.startOffset > 0 && rng.startOffset < node.data.length) {
        return true;
      }
    }
    return false;
  };
};

const setupGotoLinks = function (editor) {
  editor.on('click', function (e) {
    const link = getLink(editor, e.target);
    if (link && VK.metaKeyPressed(e)) {
      e.preventDefault();
      gotoLink(editor, link);
    }
  });

  editor.on('keydown', function (e) {
    const link = getSelectedLink(editor);
    if (link && e.keyCode === 13 && hasOnlyAltModifier(e)) {
      e.preventDefault();
      gotoLink(editor, link);
    }
  });
};

const toggleActiveState = function (editor) {
  return function () {
    const self = this;
    editor.on('nodechange', function (e) {
      self.active(!editor.readonly && !!Utils.getAnchorElement(editor, e.element));
    });
  };
};

const toggleViewLinkState = function (editor) {
  return function () {
    const self = this;

    const toggleVisibility = function (e) {
      if (Utils.hasLinks(e.parents)) {
        self.show();
      } else {
        self.hide();
      }
    };

    if (!Utils.hasLinks(editor.dom.getParents(editor.selection.getStart()))) {
      self.hide();
    }

    editor.on('nodechange', toggleVisibility);

    self.on('remove', function () {
      editor.off('nodechange', toggleVisibility);
    });
  };
};

export default {
  openDialog,
  gotoSelectedLink,
  leftClickedOnAHref,
  setupGotoLinks,
  toggleActiveState,
  toggleViewLinkState
};