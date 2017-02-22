define('tinymce.plugins.help.ui.Dialog', [
  'tinymce.plugins.help.ui.InformationTab',
  'tinymce.plugins.help.ui.KeyboardShortcutsTab',
  'tinymce.plugins.help.ui.LinksTab'
], function (
	InformationTab, KeyboardShortcutsTab, LinksTab
) {
  var openDialog = function (editor, url) {
    return function () {
      editor.windowManager.open({
        title: 'Help',
        bodyType: 'tabpanel',
        layout: 'flex',
        body: [
          InformationTab.makeTab(editor, url),
          KeyboardShortcutsTab.makeTab(),
          LinksTab.makeTab()
        ],
        buttons: {
          text: 'Close',
          onclick: function () {
            this.parent().parent().close();
          }
        }
      });
    };
  };

  return {
    openDialog: openDialog
  };
});
