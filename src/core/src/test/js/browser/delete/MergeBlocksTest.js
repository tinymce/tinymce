asynctest(
  'browser.tinymce.core.delete.MergeBlocksTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.MergeBlocks',
    'tinymce.core.test.ViewBlock'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, Hierarchy, Element, MergeBlocks, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = ViewBlock();

    var cSetHtml = function (html) {
      return Chain.op(function () {
        viewBlock.update(html);
      });
    };

    var cAssertHtml = function (expectedHtml) {
      return Chain.op(function () {
        Assertions.assertHtml('Should equal html', expectedHtml, viewBlock.get().innerHTML);
      });
    };

    var cMergeBlocks = function (forward, block1Path, block2Path) {
      return Chain.mapper(function (viewBlock) {
        var block1 = Hierarchy.follow(Element.fromDom(viewBlock.get()), block1Path).getOrDie();
        var block2 = Hierarchy.follow(Element.fromDom(viewBlock.get()), block2Path).getOrDie();
        return MergeBlocks.mergeBlocks(forward, block1, block2);
      });
    };

    var cAssertPosition = function (expectedPath, expectedOffset) {
      return Chain.op(function (position) {
        var container = Hierarchy.follow(Element.fromDom(viewBlock.get()), expectedPath).getOrDie();

        Assertions.assertDomEq('Should be expected container', container, Element.fromDom(position.getOrDie().container()));
        Assertions.assertEq('Should be expected offset', expectedOffset, position.getOrDie().offset());
      });
    };

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('Merge forward', GeneralSteps.sequence([
        Logger.t('Merge two simple blocks', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p>b</p>'),
          cMergeBlocks(true, [0], [1]),
          cAssertPosition([0, 0], 1),
          cAssertHtml('<p>ab</p>')
        ])),

        Logger.t('Merge two simple blocks with br', Chain.asStep(viewBlock, [
          cSetHtml('<p>a<br></p><p>b</p>'),
          cMergeBlocks(true, [0], [1]),
          cAssertPosition([0, 0], 1),
          cAssertHtml('<p>ab</p>')
        ])),

        Logger.t('Merge two complex blocks', Chain.asStep(viewBlock, [
          cSetHtml('<p><b>a</b><i>b</i></p><p><b>c</b><i>d</i></p>'),
          cMergeBlocks(true, [0], [1]),
          cAssertPosition([0, 1, 0], 1),
          cAssertHtml('<p><b>a</b><i>b</i><b>c</b><i>d</i></p>')
        ]))
      ])),

      Logger.t('Merge backwards', GeneralSteps.sequence([
        Logger.t('Merge two simple blocks', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p>b</p>'),
          cMergeBlocks(false, [1], [0]),
          cAssertPosition([0, 0], 1),
          cAssertHtml('<p>ab</p>')
        ])),

        Logger.t('Merge two simple blocks with br', Chain.asStep(viewBlock, [
          cSetHtml('<p>a<br></p><p>b</p>'),
          cMergeBlocks(false, [1], [0]),
          cAssertPosition([0, 0], 1),
          cAssertHtml('<p>ab</p>')
        ])),

        Logger.t('Merge two complex blocks', Chain.asStep(viewBlock, [
          cSetHtml('<p><b>a</b><i>b</i></p><p><b>c</b><i>d</i></p>'),
          cMergeBlocks(false, [1], [0]),
          cAssertPosition([0, 1, 0], 1),
          cAssertHtml('<p><b>a</b><i>b</i><b>c</b><i>d</i></p>')
        ]))
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);