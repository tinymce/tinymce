/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/EditorManager';
import Tools from 'tinymce/core/util/Tools';

const isBrandingEnabled = function (editor) {
  return editor.getParam('branding', true);
};

const hasMenubar = function (editor) {
  return getMenubar(editor) !== false;
};

const getMenubar = function (editor) {
  return editor.getParam('menubar');
};

const hasStatusbar = function (editor) {
  return editor.getParam('statusbar', true);
};

const getToolbarSize = function (editor) {
  return editor.getParam('toolbar_items_size');
};

const getResize = function (editor) {
  const resize = editor.getParam('resize', 'vertical');
  if (resize === false) {
    return 'none';
  } else if (resize === 'both') {
    return 'both';
  } else {
    return 'vertical';
  }
};

const isReadOnly = function (editor) {
  return editor.getParam('readonly', false);
};

const getFixedToolbarContainer = function (editor) {
  return editor.getParam('fixed_toolbar_container');
};

const getInlineToolbarPositionHandler = function (editor) {
  return editor.getParam('inline_toolbar_position_handler');
};

const getMenu = function (editor) {
  return editor.getParam('menu');
};

const getRemovedMenuItems = function (editor) {
  return editor.getParam('removed_menuitems', '');
};

const getMinWidth = function (editor) {
  return editor.getParam('min_width', 100);
};

const getMinHeight = function (editor) {
  return editor.getParam('min_height', 100);
};

const getMaxWidth = function (editor) {
  return editor.getParam('max_width', 0xFFFF);
};

const getMaxHeight = function (editor) {
  return editor.getParam('max_height', 0xFFFF);
};

const getSkinUrl = function (editor) {
  const settings = editor.settings;
  const skin = settings.skin;
  let skinUrl = settings.skin_url;

  if (skin !== false) {
    const skinName = skin ? skin : 'lightgray';

    if (skinUrl) {
      skinUrl = editor.documentBaseURI.toAbsolute(skinUrl);
    } else {
      skinUrl = EditorManager.baseURL + '/skins/' + skinName;
    }
  }

  return skinUrl;
};

const isSkinDisabled = function (editor) {
  return editor.settings.skin === false;
};

const isInline = function (editor) {
  return editor.getParam('inline', false);
};

const getIndexedToolbars = function (settings, defaultToolbar) {
  const toolbars = [];

  // Generate toolbar<n>
  for (let i = 1; i < 10; i++) {
    const toolbar = settings['toolbar' + i];
    if (!toolbar) {
      break;
    }

    toolbars.push(toolbar);
  }

  const mainToolbar = settings.toolbar ? [ settings.toolbar ] : [ defaultToolbar ];
  return toolbars.length > 0 ? toolbars : mainToolbar;
};

const getToolbars = function (editor) {
  const toolbar = editor.getParam('toolbar');
  const defaultToolbar = 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image';

  if (toolbar === false) {
    return [];
  } else if (Tools.isArray(toolbar)) {
    return Tools.grep(toolbar, function (toolbar) {
      return toolbar.length > 0;
    });
  } else {
    return getIndexedToolbars(editor.settings, defaultToolbar);
  }
};

export default {
  isBrandingEnabled,
  hasMenubar,
  getMenubar,
  hasStatusbar,
  getToolbarSize,
  getResize,
  isReadOnly,
  getFixedToolbarContainer,
  getInlineToolbarPositionHandler,
  getMenu,
  getRemovedMenuItems,
  getMinWidth,
  getMinHeight,
  getMaxWidth,
  getMaxHeight,
  getSkinUrl,
  isSkinDisabled,
  isInline,
  getToolbars
};