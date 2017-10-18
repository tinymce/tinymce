asynctest(
  'browser.tinymce.core.focus.EditorFocusTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.EditorManager',
    'tinymce.core.focus.EditorFocus',
    'tinymce.core.test.ViewBlock',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Focus, Hierarchy, Element, EditorManager, EditorFocus, ViewBlock, Theme) {
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

    var cFocusElement = function (elementPath) {
      return Chain.op(function (editor) {
        var element = Hierarchy.follow(Element.fromDom(editor.getBody()), elementPath).getOrDie();
        element.dom().focus();
      });
    };

    var cSetSelection = function (startPath, startOffset, endPath, endOffset) {
      return Chain.op(function (editor) {
        var startContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), startPath).getOrDie();
        var endContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), endPath).getOrDie();
        var rng = editor.dom.createRng();

        rng.setStart(startContainer.dom(), startOffset);
        rng.setEnd(endContainer.dom(), endOffset);

        editor.selection.setRng(rng);
      });
    };

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

    var cAssertHasFocus = function (elementPath) {
      return Chain.op(function (editor) {
        var element = Hierarchy.follow(Element.fromDom(editor.getBody()), elementPath).getOrDie();
        Assertions.assertEq('Should have focus on the editor', true, EditorFocus.hasFocus(editor));
        Assertions.assertDomEq('Should be the expected activeElement', element, Focus.active().getOrDie());
      });
    };

    var cRemoveEditor = Chain.op(function (editor) {
      editor.remove();
    });

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('Focus editor', GeneralSteps.sequence([
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
      ])),
      Logger.t('hasFocus', GeneralSteps.sequence([
        Logger.t('Focus on normal paragraph', Chain.asStep(viewBlock, [
          cCreateInlineEditor('<div class="tinymce-editor"><p>a</p></div>'),
          cFocusEditor,
          cAssertHasFocus([]),
          cRemoveEditor
        ])),
        Logger.t('Focus on cE=true inside a cE=false', Chain.asStep(viewBlock, [
          cCreateInlineEditor('<div class="tinymce-editor"><div contenteditable="false">a<div contenteditable="true">b</div></div></div>'),
          cSetSelection([0, 1, 0], 0, [0, 1, 0], 0),
          cFocusElement([0, 1]),
          cAssertHasFocus([0, 1]),
          cRemoveEditor
        ]))
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);