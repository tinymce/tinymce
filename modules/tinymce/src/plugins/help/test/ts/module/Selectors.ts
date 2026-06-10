export const selectors = {
  dialog: '[role="dialog"]',
  toolbarHelpButton: 'button',
  pluginsTab: '[role="tab"]:contains(Plugins)',
  pluginsTabLists: {
    installed: '[role=document] div:nth-child(1) ul',
    available: '[role=document] div:nth-child(2) ul',
    readMoreClass: 'tox-help__more-link'
  }
};
