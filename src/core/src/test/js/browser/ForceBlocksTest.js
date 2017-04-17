asynctest(
  'browser.tinymce.core.ForceBlocksTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.test.HtmlUtils',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, HtmlUtils, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    var pressArrowKey = function (editor) {
      var dom = editor.dom, target = editor.selection.getNode();
      var evt = { keyCode: 37 };

      dom.fire(target, 'keydown', evt);
      dom.fire(target, 'keypress', evt);
      dom.fire(target, 'keyup', evt);
    };

    suite.test('Wrap single root text node in P', function (editor) {
      editor.getBody().innerHTML = 'abcd';
      LegacyUnit.setSelection(editor, 'body', 2);
      pressArrowKey(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abcd</p>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    });

    suite.test('Wrap single root text node in P with attrs', function (editor) {
      editor.settings.forced_root_block_attrs = { "class": "class1" };
      editor.getBody().innerHTML = 'abcd';
      LegacyUnit.setSelection(editor, 'body', 2);
      pressArrowKey(editor);
      LegacyUnit.equal(editor.getContent(), '<p class="class1">abcd</p>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
      delete editor.settings.forced_root_block_attrs;
    });

    suite.test('Wrap single root text node in P but not table sibling', function (editor) {
      editor.getBody().innerHTML = 'abcd<table><tr><td>x</td></tr></table>';
      LegacyUnit.setSelection(editor, 'body', 2);
      pressArrowKey(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abcd</p><table><tbody><tr><td>x</td></tr></tbody></table>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    });

    suite.test('Wrap root em in P but not table sibling', function (editor) {
      editor.getBody().innerHTML = '<em>abcd</em><table><tr><td>x</td></tr></table>';
      LegacyUnit.setSelection(editor, 'em', 2);
      pressArrowKey(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><em>abcd</em></p><table><tbody><tr><td>x</td></tr></tbody></table>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'EM');
    });

    suite.test('Wrap single root text node in DIV', function (editor) {
      editor.settings.forced_root_block = 'div';
      editor.getBody().innerHTML = 'abcd';
      LegacyUnit.setSelection(editor, 'body', 2);
      pressArrowKey(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<div>abcd</div>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'DIV');
      delete editor.settings.forced_root_block;
    });

    suite.test('Remove empty root text nodes', function (editor) {
      var body = editor.getBody();

      editor.settings.forced_root_block = 'div';
      editor.getBody().innerHTML = 'abcd<div>abcd</div>';
      body.insertBefore(editor.getDoc().createTextNode(''), body.firstChild);
      body.appendChild(editor.getDoc().createTextNode(''));

      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody().childNodes[1], 1);
      rng.setEnd(editor.getBody().childNodes[1], 1);
      editor.selection.setRng(rng);

      pressArrowKey(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(body.innerHTML), '<div>abcd</div><div>abcd</div>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'DIV');
      LegacyUnit.equal(body.childNodes.length, 2);
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      entities: 'raw',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
