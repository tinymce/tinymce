/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Type, Obj, Arr } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { AllowedFormat } from '../ui/core/complex/StyleFormatTypes';

const getSkinUrl = function (editor: Editor): string {
  const settings = editor.settings;
  const skin = settings.skin;
  let skinUrl = settings.skin_url;

  if (skin !== false) {
    const skinName = skin ? skin : 'oxide';

    if (skinUrl) {
      skinUrl = editor.documentBaseURI.toAbsolute(skinUrl);
    } else {
      skinUrl = EditorManager.baseURL + '/skins/ui/' + skinName;
    }
  }

  return skinUrl;
};

const isReadOnly = (editor): boolean => editor.getParam('readonly', false, 'boolean');
const isSkinDisabled = (editor: Editor) => editor.getParam('skin') === false;

const getHeightSetting = (editor): number => editor.getParam('height', Math.max(editor.getElement().offsetHeight, 200));
const getMinWidthSetting = (editor): Option<number> => Option.from(editor.settings.min_width).filter(Type.isNumber);
const getMinHeightSetting = (editor): Option<number> => Option.from(editor.settings.min_height).filter(Type.isNumber);
const getMaxWidthSetting = (editor): Option<number> => Option.from(editor.getParam('max_width')).filter(Type.isNumber);
const getMaxHeightSetting = (editor): Option<number> => Option.from(editor.getParam('max_height')).filter(Type.isNumber);

const getUserStyleFormats = (editor: Editor): Option<AllowedFormat[]> => Option.from(editor.getParam('style_formats')).filter(Type.isArray);
const isMergeStyleFormats = (editor: Editor): boolean => editor.getParam('style_formats_merge', false, 'boolean');

const getRemovedMenuItems = (editor: Editor): string => editor.getParam('removed_menuitems', '');
const isMenubarEnabled = (editor: Editor): boolean => editor.getParam('menubar', true, 'boolean') !== false;

const isToolbarEnabled = (editor: Editor) => {
  const toolbarConfig = editor.getParam('toolbar');
  if (Type.isArray(toolbarConfig)) {
    return toolbarConfig.length > 0;
  } else {
    return editor.getParam('toolbar', true, 'boolean') !== false;
  }
};

// Convert toolbar<n> into toolbars array
const getMultipleToolbarsSetting = (editor: Editor) => {
  const keys = Obj.keys(editor.settings);
  const toolbarKeys = Arr.filter(keys, (key) => /^toolbar([1-9])$/.test(key));
  const toolbars = Arr.map(toolbarKeys, (key) => editor.getParam(key, false, 'string'));
  const toolbarArray = Arr.filter(toolbars, (toolbar) => typeof toolbar === 'string');
  return toolbarArray.length > 0 ? Option.some(toolbarArray) : Option.none();
};

const isSplitToolbar = (editor: Editor) => editor.getParam('toolbar_drawer', false, 'boolean');

export {
  getSkinUrl,
  isReadOnly,
  isSkinDisabled,
  getHeightSetting,
  getMinWidthSetting,
  getMinHeightSetting,
  getMaxWidthSetting,
  getMaxHeightSetting,
  getUserStyleFormats,
  isMergeStyleFormats,
  getRemovedMenuItems,
  isMenubarEnabled,
  isToolbarEnabled,
  getMultipleToolbarsSetting,
  isSplitToolbar
};
