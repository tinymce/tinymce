/**
 * Controls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Actions from '../core/Actions';
import Utils from '../core/Utils';

const setupButtons = function (editor) {
  editor.addButton('link', {
    active: false,
    icon: 'link',
    tooltip: 'Insert/edit link',
    onclick: Actions.openDialog(editor),
    onpostrender: Actions.toggleActiveState(editor)
  });

  editor.addButton('unlink', {
    active: false,
    icon: 'unlink',
    tooltip: 'Remove link',
    onclick: Utils.unlink(editor),
    onpostrender: Actions.toggleActiveState(editor)
  });

  if (editor.addContextToolbar) {
    editor.addButton('openlink', {
      icon: 'newtab',
      tooltip: 'Open link',
      onclick: Actions.gotoSelectedLink(editor)
    });
  }
};

const setupMenuItems = function (editor) {
  editor.addMenuItem('openlink', {
    text: 'Open link',
    icon: 'newtab',
    onclick: Actions.gotoSelectedLink(editor),
    onPostRender: Actions.toggleViewLinkState(editor),
    prependToContext: true
  });

  editor.addMenuItem('link', {
    icon: 'link',
    text: 'Link',
    shortcut: 'Meta+K',
    onclick: Actions.openDialog(editor),
    stateSelector: 'a[href]',
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('unlink', {
    icon: 'unlink',
    text: 'Remove link',
    onclick: Utils.unlink(editor),
    stateSelector: 'a[href]'
  });
};

const setupContextToolbars = function (editor) {
  if (editor.addContextToolbar) {
    editor.addContextToolbar(
      Actions.leftClickedOnAHref(editor),
      'openlink | link unlink'
    );
  }
};

export default {
  setupButtons,
  setupMenuItems,
  setupContextToolbars
};