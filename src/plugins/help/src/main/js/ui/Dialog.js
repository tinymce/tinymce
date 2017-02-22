define(
  'tinymce.plugins.help.ui.Dialog',
  [
    'tinymce.plugins.help.ui.PluginsTab',
    'tinymce.plugins.help.ui.KeyboardShortcutsTab'
  ],
  function (PluginsTab, KeyboardShortcutsTab) {
    var openDialog = function (editor, url) {
      return function () {
        editor.windowManager.open({
          title: 'Help',
          bodyType: 'tabpanel',
          layout: 'flex',
          body: [
            KeyboardShortcutsTab.makeTab(),
            PluginsTab.makeTab(editor, url)
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
