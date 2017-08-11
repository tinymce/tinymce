define(
  'tinymce.plugins.help.ui.ButtonsRow',
  [
    'tinymce.core.EditorManager'
  ],
  function (EditorManager) {
    var getVersion = function (major, minor) {
      return major.indexOf('@') === 0 ? 'X.X.X' : major + '.' + minor;
    };

    var makeRow = function () {
      var version = getVersion(EditorManager.majorVersion, EditorManager.minorVersion);
      var changeLogLink = '<a href="https://www.tinymce.com/docs/changelog/" target="_blank">TinyMCE ' + version + '</a>';

      return [
        {
          type: 'label',
          html: 'You are using ' + changeLogLink
        },
        {
          type: 'spacer',
          flex: 1
        },
        {
          text: 'Close',
          onclick: function () {
            this.parent().parent().close();
          }
        }
      ];
    };

    return {
      makeRow: makeRow
    };
  }
);
