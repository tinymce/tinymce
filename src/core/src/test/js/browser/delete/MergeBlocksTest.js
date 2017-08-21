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
        ])),

        Logger.t('Merge two headers blocks', Chain.asStep(viewBlock, [
          cSetHtml('<h1>a</h1><h2>b</h2>'),
          cMergeBlocks(true, [0], [1]),
          cAssertPosition([0, 0], 1),
          cAssertHtml('<h1>ab</h1>')
        ])),

        Logger.t('Merge two headers blocks first one empty', Chain.asStep(viewBlock, [
          cSetHtml('<h1><br></h1><h2>b</h2>'),
          cMergeBlocks(true, [0], [1]),
          cAssertPosition([0, 0], 0),
          cAssertHtml('<h2>b</h2>')
        ])),

        Logger.t('Merge two headers blocks second one empty', Chain.asStep(viewBlock, [
          cSetHtml('<h1>a</h1><h2><br></h2>'),
          cMergeBlocks(true, [0], [1]),
          cAssertPosition([0, 0], 1),
          cAssertHtml('<h1>a</h1>')
        ])),

        Logger.t('Merge two headers complex blocks', Chain.asStep(viewBlock, [
          cSetHtml('<h1>a<b>b</b></h1><h2>c<b>d</b></h2>'),
          cMergeBlocks(true, [0], [1]),
          cAssertPosition([0, 1, 0], 1),
          cAssertHtml('<h1>a<b>b</b>c<b>d</b></h1>')
        ])),

        Logger.t('Merge two headers blocks first one empty second one complex', Chain.asStep(viewBlock, [
          cSetHtml('<h1><br></h1><h2>a<b>b</b></h2>'),
          cMergeBlocks(true, [0], [1]),
          cAssertPosition([0, 0], 0),
          cAssertHtml('<h2>a<b>b</b></h2>')
        ])),

        Logger.t('Merge two headers blocks second one empty first one complex', Chain.asStep(viewBlock, [
          cSetHtml('<h1>a<b>b</b></h1><h2><br></h2>'),
          cMergeBlocks(true, [0], [1]),
          cAssertPosition([0, 1, 0], 1),
          cAssertHtml('<h1>a<b>b</b></h1>')
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
        ])),

        Logger.t('Merge two headers blocks', Chain.asStep(viewBlock, [
          cSetHtml('<h1>a</h1><h2>b</h2>'),
          cMergeBlocks(false, [1], [0]),
          cAssertPosition([0, 0], 1),
          cAssertHtml('<h1>ab</h1>')
        ])),

        Logger.t('Merge two headers blocks first one empty', Chain.asStep(viewBlock, [
          cSetHtml('<h1>a</h1><h2><br></h2>'),
          cMergeBlocks(false, [1], [0]),
          cAssertPosition([0, 0], 1),
          cAssertHtml('<h1>a</h1>')
        ])),

        Logger.t('Merge two headers blocks second one empty', Chain.asStep(viewBlock, [
          cSetHtml('<h1><br></h1><h2>b</h2>'),
          cMergeBlocks(false, [1], [0]),
          cAssertPosition([0, 0], 0),
          cAssertHtml('<h2>b</h2>')
        ])),

        Logger.t('Merge two headers complex blocks', Chain.asStep(viewBlock, [
          cSetHtml('<h1>a<b>b</b></h1><h2>c<b>d</b></h2>'),
          cMergeBlocks(false, [1], [0]),
          cAssertPosition([0, 1, 0], 1),
          cAssertHtml('<h1>a<b>b</b>c<b>d</b></h1>')
        ])),

        Logger.t('Merge two headers blocks first one empty second one complex', Chain.asStep(viewBlock, [
          cSetHtml('<h1>a<b>b</b></h1><h2><br></h2>'),
          cMergeBlocks(false, [1], [0]),
          cAssertPosition([0, 1, 0], 1),
          cAssertHtml('<h1>a<b>b</b></h1>')
        ])),

        Logger.t('Merge two headers blocks second one empty first one complex', Chain.asStep(viewBlock, [
          cSetHtml('<h1><br></h1><h2>a<b>b</b></h2>'),
          cMergeBlocks(false, [1], [0]),
          cAssertPosition([0, 0], 0),
          cAssertHtml('<h2>a<b>b</b></h2>')
        ]))
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);