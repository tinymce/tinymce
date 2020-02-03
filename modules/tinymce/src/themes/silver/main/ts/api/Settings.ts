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

const getHeightSetting = (editor: Editor): string | number => editor.getParam('height', Math.max(editor.getElement().offsetHeight, 200));
const getWidthSetting = (editor: Editor): string | number => editor.getParam('width', DOMUtils.DOM.getStyle(editor.getElement(), 'width'));
const getMinWidthSetting = (editor: Editor): Option<number> => Option.from(editor.settings.min_width).filter(Type.isNumber);
const getMinHeightSetting = (editor: Editor): Option<number> => Option.from(editor.settings.min_height).filter(Type.isNumber);
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
  const keys = Obj.keys(editor.settings);
  const toolbarKeys = Arr.filter(keys, (key) => /^toolbar([1-9])$/.test(key));
  const toolbars = Arr.map(toolbarKeys, (key) => editor.getParam(key, false, 'string'));
  const toolbarArray = Arr.filter(toolbars, (toolbar) => typeof toolbar === 'string');
  return toolbarArray.length > 0 ? Option.some(toolbarArray) : Option.none();
};

// Check if multiple toolbars is enabled
// Mulitple toolbars is enabled if toolbar value is a string array or if toolbar<n> is present
const isMultipleToolbars = (editor: Editor): boolean => {
  return getMultipleToolbarsSetting(editor).fold(
    () => {
      const toolbar = editor.getParam('toolbar', [], 'string[]');
      return toolbar.length > 0;
    },
    () => true
  );
};

export enum ToolbarMode {
  default = 'wrap',
  floating = 'floating',
  sliding = 'sliding',
  scrolling = 'scrolling'
}

const getToolbarMode = (editor: Editor): ToolbarMode => {
  return editor.getParam('toolbar_mode', '', 'string') as ToolbarMode;
};

export enum ToolbarLocation {
  top = 'top',
  bottom = 'bottom'
}

const getToolbarGroups = (editor: Editor) => {
  return editor.getParam('toolbar_groups', {}, 'object');
};

// In case of a string not equal to 'top' nor 'bottom', default to position top
const isToolbarLocationTop = (editor) => editor.getParam('toolbar_location', ToolbarLocation.top, 'string') !== ToolbarLocation.bottom;

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

const isDistractionFree = (editor: Editor) => {
  return editor.inline && !isMenubarEnabled(editor) && !isToolbarEnabled(editor) && !isMultipleToolbars(editor);
};

const isStickyToolbar = (editor: Editor) => {
  const isStickyToolbar = editor.getParam('toolbar_sticky', false, 'boolean');
  return (isStickyToolbar || editor.inline) && !useFixedContainer(editor) && !isDistractionFree(editor);
};

const isDraggableModal = (editor: Editor): boolean => editor.getParam('draggable_modal', false, 'boolean');

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
  isToolbarLocationTop,
  getToolbarGroups
};
