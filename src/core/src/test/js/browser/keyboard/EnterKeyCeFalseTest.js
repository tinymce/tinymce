asynctest(
  'browser.tinymce.core.keyboard.EnterKeyCeFalseTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.Env',
    'tinymce.core.test.HtmlUtils',
    'tinymce.core.util.Tools',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, Env, HtmlUtils, Tools, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    var pressEnter = function (editor, evt) {
      var dom = editor.dom, target = editor.selection.getNode();

      evt = Tools.extend({ keyCode: 13 }, evt);

      dom.fire(target, 'keydown', evt);
      dom.fire(target, 'keypress', evt);
      dom.fire(target, 'keyup', evt);
    };

    suite.test('Enter in text within contentEditable:true h1 inside contentEditable:false div', function (editor) {
      editor.getBody().innerHTML = '<div contenteditable="false"><h1 contenteditable="true">ab</h1></div>';
      LegacyUnit.setSelection(editor, 'div h1', 1);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML),
        '<div contenteditable="false"><h1 contenteditable="true">ab</h1></div>'
      );
    });

    suite.test('Enter before cE=false div', function (editor) {
      editor.getBody().innerHTML = '<div contenteditable="false">x</div>';
      editor.selection.select(editor.dom.select('div')[0]);
      editor.selection.collapse(true);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML),
        '<p><br data-mce-bogus="1"></p><div contenteditable="false">x</div>'
      );
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    });

    suite.test('Enter after cE=false div', function (editor) {
      editor.getBody().innerHTML = '<div contenteditable="false">x</div>';
      editor.selection.select(editor.dom.select('div')[0]);
      editor.selection.collapse(false);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML),
        '<div contenteditable="false">x</div><p><br data-mce-bogus="1"></p>'
      );
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      disable_nodechange: true,
      schema: 'html5',
      extended_valid_elements: 'div[id|style|contenteditable],span[id|style|contenteditable],#dt,#dd',
      entities: 'raw',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);