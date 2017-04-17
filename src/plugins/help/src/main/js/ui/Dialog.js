define(
  'tinymce.plugins.help.ui.Dialog',
  [
    'tinymce.core.EditorManager',
    'tinymce.plugins.help.ui.KeyboardShortcutsTab',
    'tinymce.plugins.help.ui.PluginsTab',
    'tinymce.plugins.help.ui.ButtonsRow'
  ],
  function (EditorManager, KeyboardShortcutsTab, PluginsTab, ButtonsRow) {
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
          buttons: ButtonsRow.makeRow(),
          onPostRender: function () {
            var title = this.getEl('title');
            title.innerHTML = '<img src="' + url + '/img/logo.png" alt="TinyMCE Logo" style="width: 200px">';
          }
        });
      };
    };

    return {
      openDialog: openDialog
    };
  });
