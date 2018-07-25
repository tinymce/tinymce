export interface ThemeSelectors {
  toolBarSelector: string;
  menuBarSelector: string;
  dialogCloseSelector: string;
  dialogSubmitSelector: string;
}

export const DefaultThemeSelectors: ThemeSelectors = {
  toolBarSelector:'.mce-toolbar-grp',
  menuBarSelector: '.mce-menubar',
  dialogCloseSelector: 'div[role="button"]:contains(Cancel)',
  dialogSubmitSelector:'div[role="button"].mce-primary'
};