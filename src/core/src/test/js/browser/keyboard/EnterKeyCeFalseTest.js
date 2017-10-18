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

    suite.test('Enter in div inside contentEditable:false div', function (editor) {
      editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><div>abcd</div></div>';
      LegacyUnit.setSelection(editor, 'div div', 2);
      pressEnter(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<div data-mce-contenteditable="false"><div>abcd</div></div>');
    });

    suite.test('Enter in div with contentEditable:true inside contentEditable:false div', function (editor) {
      editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><div data-mce-contenteditable="true">abcd</div></div>';
      LegacyUnit.setSelection(editor, 'div div', 2);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML),
        '<div data-mce-contenteditable="false"><div data-mce-contenteditable="true"><p>ab</p><p>cd</p></div></div>'
      );
    });

    suite.test('Enter in span with contentEditable:true inside contentEditable:false div', function (editor) {
      editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">abcd</span></div>';
      LegacyUnit.setSelection(editor, 'span', 2);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML),
        '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">abcd</span></div>'
      );
    });

    suite.test('Shift+Enter in span with contentEditable:true inside contentEditable:false div', function (editor) {
      editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">abcd</span></div>';
      LegacyUnit.setSelection(editor, 'span', 2);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML),
        '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">ab<br>cd</span></div>'
      );
    });

    suite.test('Enter in span with contentEditable:true inside contentEditable:false div and forced_root_block: false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">abcd</span></div>';
      LegacyUnit.setSelection(editor, 'span', 2);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML),
        '<div data-mce-contenteditable="false"><span data-mce-contenteditable="true">ab<br>cd</span></div>'
      );
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Enter in em within contentEditable:true div inside contentEditable:false div', function (editor) {
      editor.getBody().innerHTML = '<div data-mce-contenteditable="false"><div data-mce-contenteditable="true"><em>abcd</em></div></div>';
      LegacyUnit.setSelection(editor, 'em', 2);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML),
        '<div data-mce-contenteditable="false"><div data-mce-contenteditable="true"><p><em>ab</em></p><p><em>cd</em></p></div></div>'
      );
    });

    if (Env.ceFalse) {
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
    }

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