asynctest(
  'browser.tinymce.plugins.textpattern.TextPatternPluginTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.textpattern.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, Plugin, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Plugin();
    Theme();

    suite.test('Italic format on single word using space', function (editor) {
      editor.setContent('<p>*abc*\u00a0</p>');
      LegacyUnit.setSelection(editor, 'p', 6);
      editor.fire('keyup', { keyCode: 32 });

      LegacyUnit.equal(
        editor.getContent(),
        '<p><em>abc</em>&nbsp;</p>'
      );
    });

    suite.test('Bold format on single word using space', function (editor) {
      editor.setContent('<p>**abc**\u00a0</p>');
      LegacyUnit.setSelection(editor, 'p', 8);
      editor.fire('keyup', { keyCode: 32 });

      LegacyUnit.equal(
        editor.getContent(),
        '<p><strong>abc</strong>&nbsp;</p>'
      );
    });

    suite.test('Bold format on multiple words using space', function (editor) {
      editor.setContent('<p>**abc 123**\u00a0</p>');
      LegacyUnit.setSelection(editor, 'p', 12);
      editor.fire('keyup', { keyCode: 32 });

      LegacyUnit.equal(
        editor.getContent(),
        '<p><strong>abc 123</strong>&nbsp;</p>'
      );
    });

    suite.test('Bold format on single word using enter', function (editor) {
      editor.setContent('<p>**abc**</p>');
      LegacyUnit.setSelection(editor, 'p', 7);
      editor.fire('keydown', { keyCode: 13 });

      LegacyUnit.equal(
        editor.getContent(),
        '<p><strong>abc</strong></p><p>&nbsp;</p>'
      );
    });

    suite.test('H1 format on single word node using enter', function (editor) {
      editor.setContent('<p>#abc</p>');
      LegacyUnit.setSelection(editor, 'p', 4);
      editor.fire('keydown', { keyCode: 13 });

      LegacyUnit.equal(
        editor.getContent(),
        '<h1>abc</h1><p>&nbsp;</p>'
      );
    });

    suite.test('OL format on single word node using enter', function (editor) {
      editor.setContent('<p>1. abc</p>');
      LegacyUnit.setSelection(editor, 'p', 6);
      editor.fire('keydown', { keyCode: 13 });

      LegacyUnit.equal(
        editor.getContent(),
        '<ol><li>abc</li><li></li></ol>'
      );
    });

    suite.test('UL format on single word node using enter', function (editor) {
      editor.setContent('<p>* abc</p>');
      LegacyUnit.setSelection(editor, 'p', 5);
      editor.fire('keydown', { keyCode: 13 });

      LegacyUnit.equal(
        editor.getContent(),
        '<ul><li>abc</li><li></li></ul>'
      );
    });

    suite.test('getPatterns/setPatterns', function (editor) {
      editor.plugins.textpattern.setPatterns([
        { start: '#', format: 'h1' },
        { start: '##', format: 'h2' },
        { start: '###', format: 'h3' }
      ]);

      LegacyUnit.deepEqual(
        editor.plugins.textpattern.getPatterns(),
        [
          {
            "format": "h3",
            "start": "###"
          },
          {
            "format": "h2",
            "start": "##"
          },
          {
            "format": "h1",
            "start": "#"
          }
        ]
      );
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      plugins: 'textpattern',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);