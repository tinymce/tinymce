/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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
    // TODO: this used to query the context menu plugin directly. Is that a good idea?
    //  && !isContextMenuVisible(editor)
    if (Settings.hasContextToolbar(editor.settings) && Utils.isLink(elm)) {
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
  return function (api) {
    const nodeChangeHandler = (e) => api.setActive(!editor.readonly && !!Utils.getAnchorElement(editor, e.element));
    editor.on('nodechange', nodeChangeHandler);
    return () => editor.off('nodechange', nodeChangeHandler);
  };
};

const toggleEnabledState = function (editor) {
  return function (api) {
    api.setDisabled(!Utils.hasLinks(editor.dom.getParents(editor.selection.getStart())));
    const nodeChangeHandler = (e) => api.setDisabled(!Utils.hasLinks(e.parents));
    editor.on('nodechange', nodeChangeHandler);
    return () => editor.off('nodechange', nodeChangeHandler);
  };
};

export default {
  openDialog,
  gotoSelectedLink,
  leftClickedOnAHref,
  setupGotoLinks,
  toggleActiveState,
  toggleEnabledState,
};