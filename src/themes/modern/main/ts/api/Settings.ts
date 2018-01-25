/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/api/EditorManager';
import Tools from 'tinymce/core/api/util/Tools';

const isBrandingEnabled = (editor): boolean => editor.getParam('branding', true, 'boolean');
const hasMenubar = (editor): boolean => getMenubar(editor) !== false;
const getMenubar = (editor) => editor.getParam('menubar');
const hasStatusbar = (editor): boolean => editor.getParam('statusbar', true, 'boolean');
const getToolbarSize = (editor): string => editor.getParam('toolbar_items_size');
const isReadOnly = (editor): boolean => editor.getParam('readonly', false, 'boolean');
const getFixedToolbarContainer = (editor) => editor.getParam('fixed_toolbar_container');
const getInlineToolbarPositionHandler = (editor) => editor.getParam('inline_toolbar_position_handler');
const getMenu = (editor) => editor.getParam('menu');
const getRemovedMenuItems = (editor) => editor.getParam('removed_menuitems', '');
const getMinWidth = (editor): number => editor.getParam('min_width', 100, 'number');
const getMinHeight = (editor): number => editor.getParam('min_height', 100, 'number');
const getMaxWidth = (editor): number => editor.getParam('max_width', 0xFFFF, 'number');
const getMaxHeight = (editor): number => editor.getParam('max_height', 0xFFFF, 'number');
const isSkinDisabled = (editor): boolean => editor.settings.skin === false;
const isInline = (editor): boolean => editor.getParam('inline', false, 'boolean');

const getResize = (editor): string => {
  const resize = editor.getParam('resize', 'vertical');
  if (resize === false) {
    return 'none';
  } else if (resize === 'both') {
    return 'both';
  } else {
    return 'vertical';
  }
};

const getSkinUrl = function (editor): string {
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

export {
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