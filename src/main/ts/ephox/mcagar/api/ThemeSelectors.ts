import 'tinymce';

declare const tinymce: any;

interface ThemeSelectors {
  toolBarSelector: string;
  menuBarSelector: string;
  dialogCloseSelector: string;
  dialogSubmitSelector: string;
}

const DefaultThemeSelectors: ThemeSelectors = {
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
  const ver = parseInt(tinymce.majorVersion);
  return ver < 5 ? DefaultThemeSelectors : SilverThemeSelectors;
}

export {
  ThemeSelectors,
  getThemeSelectors
}