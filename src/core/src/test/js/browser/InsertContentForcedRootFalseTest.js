asynctest(
  'browser.tinymce.core.InsertContentForcedRootBlockFalseTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.InsertContent',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, InsertContent, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    var trimBrs = function (string) {
      return string.replace(/<br>/g, '');
    };

    suite.test('insertAtCaret - selected image with bogus div', function (editor) {
      editor.getBody().innerHTML = '<img src="about:blank" /><div data-mce-bogus="all">x</div>';
      editor.focus();
      // editor.selection.setCursorLocation(editor.getBody(), 0);
      editor.selection.select(editor.dom.select('img')[0]);
      InsertContent.insertAtCaret(editor, 'a');
      LegacyUnit.equal(trimBrs(editor.getBody().innerHTML), 'a<div data-mce-bogus="all">x</div>');
    });

    suite.test('insertAtCaret - selected text with bogus div', function (editor) {
      editor.getBody().innerHTML = 'a<div data-mce-bogus="all">x</div>';
      editor.focus();
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody().firstChild, 0);
      rng.setEnd(editor.getBody().firstChild, 1);
      editor.selection.setRng(rng);
      InsertContent.insertAtCaret(editor, 'b');
      LegacyUnit.equal(trimBrs(editor.getBody().innerHTML), 'b<div data-mce-bogus="all">x</div>');
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      selector: "textarea",
      add_unload_trigger: false,
      disable_nodechange: true,
      forced_root_block: false,
      entities: 'raw',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
