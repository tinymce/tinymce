asynctest(
  'browser.tinymce.core.undo.ForcedRootBlockTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.undo.Levels',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, Levels, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    suite.test('createFromEditor forced_root_block: false', function (editor) {
      editor.getBody().innerHTML = '<strong>a</strong> <span>b</span>';

      LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
        'beforeBookmark': null,
        'bookmark': null,
        'content': '<strong>a</strong> <span>b</span>',
        'fragments': null,
        'type': 'complete'
      });
    });

    suite.test('createFromEditor forced_root_block: false', function (editor) {
      editor.getBody().innerHTML = '<iframe src="about:blank"></iframe> <strong>a</strong> <span>b</span>';

      LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
        'beforeBookmark': null,
        'bookmark': null,
        'content': '',
        'fragments': [
          "<iframe src=\"about:blank\"></iframe>",
          " ",
          "<strong>a</strong>",
          " ",
          "<span>b</span>"
        ],
        'type': 'fragmented'
      });
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      selector: "textarea",
      add_unload_trigger: false,
      disable_nodechange: true,
      entities: 'raw',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
