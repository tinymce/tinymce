asynctest(
  'browser.tinymce.core.EditorFocusTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.EditorFocus',
    'tinymce.core.EditorManager',
    'tinymce.core.test.ViewBlock',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, Logger, Pipeline, Hierarchy, Element, EditorFocus, EditorManager, ViewBlock, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = new ViewBlock();

    Theme();

    var cCreateInlineEditor = function (html) {
      return Chain.on(function (viewBlock, next, die) {
        viewBlock.update(html);

        EditorManager.init({
          selector: '.tinymce-editor',
          inline: true,
          skin_url: '/project/src/skins/lightgray/dist/lightgray',
          setup: function (editor) {
            editor.on('SkinLoaded', function () {
              next(Chain.wrap(editor));
            });
          }
        });
      });
    };

    var cFocusEditor = Chain.op(function (editor) {
      EditorFocus.focus(editor, false);
    });

    var cAssertSelection = function (startPath, startOffset, endPath, endOffset) {
      return Chain.op(function (editor) {
        var startContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), startPath).getOrDie();
        var endContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), endPath).getOrDie();
        var rng = editor.selection.getRng();

        Assertions.assertDomEq('Should be expected from start container', startContainer, Element.fromDom(rng.startContainer));
        Assertions.assertEq('Should be expected from start offset', startOffset, rng.startOffset);
        Assertions.assertDomEq('Should be expected end container', endContainer, Element.fromDom(rng.endContainer));
        Assertions.assertEq('Should be expected end offset', endOffset, rng.endOffset);
      });
    };

    var cRemoveEditor = Chain.op(function (editor) {
      editor.remove();
    });

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('Focus editor initialized on a table', Chain.asStep(viewBlock, [
        cCreateInlineEditor('<table class="tinymce-editor"><tbody><tr><td>a</td></tr></tbody></table>'),
        cFocusEditor,
        cAssertSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
        cRemoveEditor
      ])),
      Logger.t('Focus editor initialized on a div with p', Chain.asStep(viewBlock, [
        cCreateInlineEditor('<div class="tinymce-editor"><p>a</p></div>'),
        cFocusEditor,
        cAssertSelection([0, 0], 0, [0, 0], 0),
        cRemoveEditor
      ])),
      Logger.t('Focus editor initialized on a list', Chain.asStep(viewBlock, [
        cCreateInlineEditor('<ul class="tinymce-editor"><li>a</li></ul>'),
        cFocusEditor,
        cAssertSelection([0, 0], 0, [0, 0], 0),
        cRemoveEditor
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);