import { Global, Arr } from '@ephox/katamari';
import { Editor } from '../alien/EditorTypes';

const isSilver = () => {
  const tinymce = Global.tinymce;
  if (!tinymce) {
    throw new Error('Failed to get global tinymce');
  }
  return tinymce.activeEditor.hasOwnProperty('ui');
};

const isModern = () => !isSilver();

export interface ThemeSelectors {
  toolBarSelector: (editor: Editor) => string;
  menuBarSelector: string;
  dialogCloseSelector: string;
  dialogSubmitSelector: string;
}

const ModernThemeSelectors: ThemeSelectors = {
  toolBarSelector: () => '.mce-toolbar-grp',
  menuBarSelector: '.mce-menubar',
  dialogCloseSelector: 'div[role="button"]:contains(Cancel)',
  dialogSubmitSelector: 'div[role="button"].mce-primary'
};

const SilverThemeSelectors: ThemeSelectors = {
  toolBarSelector: (editor: Editor) => Arr.exists([ editor.settings.toolbar_mode, editor.settings.toolbar_drawer ], (s) => s === 'floating' || s === 'sliding') ? '.tox-toolbar-overlord' : '.tox-toolbar',
  menuBarSelector: '.tox-menubar',
  dialogCloseSelector: '.tox-button:contains("Cancel")',
  dialogSubmitSelector: '.tox-button:contains("Save")'
};

const getThemeSelectors = (): ThemeSelectors => {
  return isModern() ? ModernThemeSelectors : SilverThemeSelectors;
};

export {
  getThemeSelectors,
  isModern,
  isSilver
};
