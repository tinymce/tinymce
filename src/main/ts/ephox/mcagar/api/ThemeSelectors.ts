import { isModern } from "./TinyVersions";

interface ThemeSelectors {
  toolBarSelector: string;
  menuBarSelector: string;
  dialogCloseSelector: string;
  dialogSubmitSelector: string;
}

const ModernThemeSelectors: ThemeSelectors = {
  toolBarSelector:'.mce-toolbar-grp',
  menuBarSelector: '.mce-menubar',
  dialogCloseSelector: 'div[role="button"]:contains(Cancel)',
  dialogSubmitSelector:'div[role="button"].mce-primary'
};

const SilverThemeSelectors: ThemeSelectors = {
  toolBarSelector:'.tox-toolbar',
  menuBarSelector: '.tox-menubar',
  dialogCloseSelector: '.tox-button:contains("Cancel")',
  dialogSubmitSelector: '.tox-button:contains("Ok")'
};

const getThemeSelectors = (): ThemeSelectors => {
  return isModern() ? ModernThemeSelectors : SilverThemeSelectors;
}

export {
  ThemeSelectors,
  getThemeSelectors
}