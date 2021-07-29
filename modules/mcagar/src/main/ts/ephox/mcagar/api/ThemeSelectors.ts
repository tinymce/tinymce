import { Arr, Fun, Global, Obj } from '@ephox/katamari';

import { Editor } from '../alien/EditorTypes';

const isSilver = (): boolean => {
  const tinymce = Global.tinymce;
  if (!tinymce) {
    throw new Error('Failed to get global tinymce');
  }
  return Obj.has(tinymce.activeEditor, 'ui');
};

const isModern = (): boolean => !isSilver();

export interface ThemeSelectors {
  toolBarSelector: (editor: Editor) => string;
  menuBarSelector: string;
  dialogSelector: string;
  dialogCancelSelector: string;
  dialogCloseSelector: string;
  dialogSubmitSelector: string;
}

const ModernThemeSelectors: ThemeSelectors = {
  toolBarSelector: Fun.constant('.mce-toolbar-grp'),
  menuBarSelector: '.mce-menubar',
  dialogSelector: '.mce-window',
  dialogCancelSelector: 'div[role="button"]:contains(Cancel)',
  dialogCloseSelector: 'button.mce-close',
  dialogSubmitSelector: 'div[role="button"].mce-primary'
};

const SilverThemeSelectors: ThemeSelectors = {
  toolBarSelector: (editor: Editor) => Arr.exists([ editor.getParam('toolbar_mode'), editor.getParam('toolbar_drawer') ], (s) => s === 'floating' || s === 'sliding') ? '.tox-toolbar-overlord' : '.tox-toolbar',
  menuBarSelector: '.tox-menubar',
  dialogSelector: 'div[role="dialog"]',
  dialogCancelSelector: '.tox-button:contains("Cancel")',
  dialogCloseSelector: '.tox-button[title="Close"]',
  dialogSubmitSelector: '.tox-button:contains("Save")'
};

const getThemeSelectors = (): ThemeSelectors => isModern() ? ModernThemeSelectors : SilverThemeSelectors;

export {
  getThemeSelectors,
  isModern,
  isSilver
};
