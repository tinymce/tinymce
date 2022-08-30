export const selectors = {
  dialog: '[role="dialog"]',
  toolbarHelpButton: 'button',
  pluginsTab: '[role="tab"]:contains(Plugins)',
  pluginsTabLists: {
    installed: '[role=document] div:eq(0) ul',
    available: '[role=document] div:eq(1) ul',
    readMoreClass: 'tox-help__more-link'
  }
};
