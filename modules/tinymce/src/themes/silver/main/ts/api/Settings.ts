/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Option, Type } from '@ephox/katamari';
import { Body, Element, SelectorFind } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { AllowedFormat } from 'tinymce/core/api/fmt/StyleFormat';

export interface ToolbarGroupSetting {
  name?: string;
  items: string[];
}

const getSkinUrl = function (editor: Editor): string {
  const skin = editor.getParam('skin');
  let skinUrl = editor.getParam('skin_url');

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

const getHeightSetting = (editor: Editor): string | number => editor.getParam('height', Math.max(editor.getElement().offsetHeight, 200));
const getWidthSetting = (editor: Editor): string | number => editor.getParam('width', DOMUtils.DOM.getStyle(editor.getElement(), 'width'));
const getMinWidthSetting = (editor: Editor): Option<number> => Option.from(editor.getParam('min_width')).filter(Type.isNumber);
const getMinHeightSetting = (editor: Editor): Option<number> => Option.from(editor.getParam('min_height')).filter(Type.isNumber);
const getMaxWidthSetting = (editor: Editor): Option<number> => Option.from(editor.getParam('max_width')).filter(Type.isNumber);
const getMaxHeightSetting = (editor: Editor): Option<number> => Option.from(editor.getParam('max_height')).filter(Type.isNumber);

const getUserStyleFormats = (editor: Editor): Option<AllowedFormat[]> => Option.from(editor.getParam('style_formats')).filter(Type.isArray);
const isMergeStyleFormats = (editor: Editor): boolean => editor.getParam('style_formats_merge', false, 'boolean');

const getRemovedMenuItems = (editor: Editor): string => editor.getParam('removed_menuitems', '');
const isMenubarEnabled = (editor: Editor): boolean => editor.getParam('menubar', true, 'boolean') !== false;

const isToolbarEnabled = (editor: Editor): boolean => {
  const toolbar = editor.getParam('toolbar', true);
  const isToolbarTrue = toolbar === true;
  const isToolbarString = Type.isString(toolbar);
  const isToolbarObjectArray = Type.isArray(toolbar) && toolbar.length > 0;
  // Toolbar is enabled if its value is true, a string or non-empty object array, but not string array
  return !isMultipleToolbars(editor) && (isToolbarObjectArray || isToolbarString || isToolbarTrue);
};

// Convert toolbar<n> into toolbars array
const getMultipleToolbarsSetting = (editor: Editor): Option<string[]> => {
  const toolbars = Arr.range(9, (num) => editor.getParam('toolbar' + (num + 1), false, 'string'));
  const toolbarArray = Arr.filter(toolbars, (toolbar) => typeof toolbar === 'string');
  return toolbarArray.length > 0 ? Option.some(toolbarArray) : Option.none();
};

// Check if multiple toolbars is enabled
// Mulitple toolbars is enabled if toolbar value is a string array or if toolbar<n> is present
const isMultipleToolbars = (editor: Editor): boolean => getMultipleToolbarsSetting(editor).fold(
  () => {
    const toolbar = editor.getParam('toolbar', [], 'string[]');
    return toolbar.length > 0;
  },
  () => true
);

export enum ToolbarMode {
  default = 'wrap',
  floating = 'floating',
  sliding = 'sliding',
  scrolling = 'scrolling'
}

const getToolbarMode = (editor: Editor): ToolbarMode => editor.getParam('toolbar_mode', '', 'string') as ToolbarMode;

export enum ToolbarLocation {
  auto = 'auto',
  top = 'top',
  bottom = 'bottom'
}

const getToolbarGroups = (editor: Editor) => editor.getParam('toolbar_groups', {}, 'object');

const getToolbarLocation = (editor: Editor) => editor.getParam('toolbar_location', ToolbarLocation.auto, 'string') as ToolbarLocation;
const isToolbarLocationBottom = (editor: Editor) => getToolbarLocation(editor) === ToolbarLocation.bottom;

const fixedContainerSelector = (editor): string => editor.getParam('fixed_toolbar_container', '', 'string');

const fixedContainerElement = (editor): Option<Element> => {
  const selector = fixedContainerSelector(editor);
  // If we have a valid selector and are in inline mode, try to get the fixed_toolbar_container
  return selector.length > 0 && editor.inline ? SelectorFind.descendant(Body.body(), selector) : Option.none();
};

const useFixedContainer = (editor): boolean => editor.inline && fixedContainerElement(editor).isSome();

const getUiContainer = (editor): Element => {
  const fixedContainer = fixedContainerElement(editor);
  return fixedContainer.getOr(Body.body());
};

const isDistractionFree = (editor: Editor) => editor.inline && !isMenubarEnabled(editor) && !isToolbarEnabled(editor) && !isMultipleToolbars(editor);

const isStickyToolbar = (editor: Editor) => {
  const isStickyToolbar = editor.getParam('toolbar_sticky', false, 'boolean');
  return (isStickyToolbar || editor.inline) && !useFixedContainer(editor) && !isDistractionFree(editor);
};

const isDraggableModal = (editor: Editor): boolean => editor.getParam('draggable_modal', false, 'boolean');

const getMenus = (editor: Editor) => {
  const menu = editor.getParam('menu');

  if (menu) {
    return Obj.map(menu, (menu) => ({ ...menu, items: menu.items }));
  } else {
    return {};
  }
};

const getMenubar = (editor: Editor) => editor.getParam('menubar');

const getToolbar = (editor: Editor): Array<string | ToolbarGroupSetting> | string | boolean => editor.getParam('toolbar', true);

const getFilePickerCallback = (editor: Editor) => editor.getParam('file_picker_callback');

const getFilePickerTypes = (editor: Editor) => editor.getParam('file_picker_types');

const getFileBrowserCallbackTypes = (editor: Editor) => editor.getParam('file_browser_callback_types');

const noTypeaheadUrls = (editor: Editor) => editor.getParam('typeahead_urls') === false;

const getAnchorTop = (editor: Editor): string | false => editor.getParam('anchor_top', '#top');

const getAnchorBottom = (editor: Editor): string | false => editor.getParam('anchor_bottom', '#bottom');

const getFilePickerValidatorHandler = (editor: Editor) => {
  const handler = editor.getParam('file_picker_validator_handler', undefined, 'function');
  if (handler === undefined) {
    // Fallback to legacy/deprecated setting
    return editor.getParam('filepicker_validator_handler', undefined, 'function');
  } else {
    return handler;
  }
};

export {
  getSkinUrl,
  isReadOnly,
  isSkinDisabled,
  getHeightSetting,
  getWidthSetting,
  getMinWidthSetting,
  getMinHeightSetting,
  getMaxWidthSetting,
  getMaxHeightSetting,
  getUserStyleFormats,
  isMergeStyleFormats,
  getRemovedMenuItems,
  isMenubarEnabled,
  isMultipleToolbars,
  isToolbarEnabled,
  getMultipleToolbarsSetting,
  getUiContainer,
  useFixedContainer,
  getToolbarMode,
  isDraggableModal,
  isDistractionFree,
  isStickyToolbar,
  getToolbarLocation,
  isToolbarLocationBottom,
  getToolbarGroups,
  getMenus,
  getMenubar,
  getToolbar,
  getFilePickerCallback,
  getFilePickerTypes,
  getFileBrowserCallbackTypes,
  noTypeaheadUrls,
  getAnchorTop,
  getAnchorBottom,
  getFilePickerValidatorHandler
};
