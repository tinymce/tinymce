define(
  'tinymce.plugins.help.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.help.ui.Dialog'
  ],
  function (PluginManager, Dialog) {
    var Plugin = function (editor, url) {
      editor.addButton('help', {
        icon: 'help',
        onclick: Dialog.openDialog(editor, url)
      });

      editor.addMenuItem('Help', {
        text: 'Help',
        icon: 'help',
        context: 'view',
        onclick: Dialog.openDialog(editor, url)
      });

      editor.addCommand('mceHelp', Dialog.openDialog(editor, url));

      editor.shortcuts.add('Alt+0', 'Open help dialog', Dialog.openDialog(editor, url));
    };

    PluginManager.add('help', Plugin);

    return function () {};
  }
);
