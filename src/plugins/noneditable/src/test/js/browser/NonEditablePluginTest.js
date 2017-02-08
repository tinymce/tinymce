asynctest(
  'browser.tinymce.plugins.noneditable.NonEditablePluginTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.plugins.noneditable.Plugin',
    'ephox.mcagar.api.TinyLoader'
  ],
  function (Pipeline, LegacyUnit, Plugin, TinyLoader) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test('noneditable class', function (editor) {
      editor.setContent('<p><span class="mceNonEditable">abc</span></p>');
      LegacyUnit.equal(editor.dom.select('span')[0].contentEditable, "false");
    });

    suite.test('editable class', function (editor) {
      editor.setContent('<p><span class="mceEditable">abc</span></p>');
      LegacyUnit.equal(editor.dom.select('span')[0].contentEditable, "true");
    });

    suite.test('noneditable regexp', function (editor) {
      editor.setContent('<p>{test1}{test2}</p>');

      LegacyUnit.equal(editor.dom.select('span').length, 2);
      LegacyUnit.equal(editor.dom.select('span')[0].contentEditable, "false");
      LegacyUnit.equal(editor.dom.select('span')[1].contentEditable, "false");
      LegacyUnit.equal(editor.getContent(), '<p>{test1}{test2}</p>');
    });

    suite.test('noneditable regexp inside cE=false', function (editor) {
      editor.setContent('<span contenteditable="false">{test1}</span>');
      LegacyUnit.equal(editor.dom.select('span').length, 1);
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      indent: false,
      noneditable_regexp: [/\{[^\}]+\}/g],
      plugins: 'noneditable',
      entities: 'raw'
    }, success, failure);
  }
);
