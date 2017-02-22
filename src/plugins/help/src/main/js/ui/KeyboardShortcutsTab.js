define(
  'tinymce.plugins.help.ui.KeyboardShortcutsTab',
  [
    'ephox.katamari.api.Arr',
    'tinymce.plugins.help.data.KeyboardShortcuts'
  ],
  function (Arr, KeyboardShortcuts) {
    var makeTab = function () {
      var shortcutLisString = Arr.map(KeyboardShortcuts.shortcuts, function (shortcut) {
        return '<tr>' +
                  '<td>' + shortcut.shortcut + '</td>' +
                  '<td>' + shortcut.action + '</td>' +
                '</tr>';
      }).join('');

      return {
        title: 'Handy Shortcuts',
        type: 'container',
        style: 'overflow-y: auto; overflow-x: hidden; max-height: 250px',
        items: [
          {
            type: 'container',
            html: '<table class="mce-table-striped">' +
                    '<thead>' +
                      '<th>Shortcut</th>' +
                      '<th>Action</th>' +
                    '</thead>' +
                    shortcutLisString +
                  '</table>'
          }
        ]
      };
    };

    return {
      makeTab: makeTab
    };
  });
