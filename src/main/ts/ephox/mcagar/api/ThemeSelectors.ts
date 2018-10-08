import 'tinymce';

declare const tinymce: any;

export interface ThemeSelectors {
  toolBarSelector: string;
  menuBarSelector: string;
  dialogCloseSelector: string;
  dialogSubmitSelector: string;
}

// First selector is T4, second is T5
export const DefaultThemeSelectors: ThemeSelectors = {
  toolBarSelector:'.mce-toolbar-grp, .tox-toolbar',
  menuBarSelector: '.mce-menubar, .tox-menubar',
  dialogCloseSelector: 'div[role="button"]:contains(Cancel), .tox-button:contains("Cancel")',
  dialogSubmitSelector:'div[role="button"].mce-primary, .tox-button:contains("Ok")'
};