asynctest(
  'browser.tinymce.core.delete.BlockBoundaryTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'global!document',
    'tinymce.core.delete.BlockBoundary',
    'tinymce.core.test.ViewBlock'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Fun, Hierarchy, Element, document, BlockBoundary, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = ViewBlock();

    var cSetHtml = function (html) {
      return Chain.op(function () {
        viewBlock.update(html);
      });
    };

    var cReadBlockBoundary = function (forward, cursorPath, cursorOffset) {
      return Chain.mapper(function (viewBlock) {
        var container = Hierarchy.follow(Element.fromDom(viewBlock.get()), cursorPath).getOrDie();
        var rng = document.createRange();
        rng.setStart(container.dom(), cursorOffset);
        rng.setEnd(container.dom(), cursorOffset);
        return BlockBoundary.read(viewBlock.get(), forward, rng);
      });
    };

    var cAssertBlockBoundaryPositions = function (fromPath, fromOffset, toPath, toOffset) {
      return Chain.op(function (blockBoundaryOption) {
        var fromContainer = Hierarchy.follow(Element.fromDom(viewBlock.get()), fromPath).getOrDie();
        var toContainer = Hierarchy.follow(Element.fromDom(viewBlock.get()), toPath).getOrDie();
        var blockBoundary = blockBoundaryOption.getOrDie();

        Assertions.assertDomEq('Should be expected from container', fromContainer, Element.fromDom(blockBoundary.from().position().container()));
        Assertions.assertEq('Should be expected from offset', fromOffset, blockBoundary.from().position().offset());
        Assertions.assertDomEq('Should be expected to container', toContainer, Element.fromDom(blockBoundary.to().position().container()));
        Assertions.assertEq('Should be expected to offset', toOffset, blockBoundary.to().position().offset());
      });
    };

    var cAssertBlockBoundaryBlocks = function (fromBlockPath, toBlockPath) {
      return Chain.op(function (blockBoundaryOption) {
        var expectedFromBlock = Hierarchy.follow(Element.fromDom(viewBlock.get()), fromBlockPath).getOrDie();
        var expectedToBlock = Hierarchy.follow(Element.fromDom(viewBlock.get()), toBlockPath).getOrDie();
        var blockBoundary = blockBoundaryOption.getOrDie();

        Assertions.assertDomEq('Should be expected from block', expectedFromBlock, blockBoundary.from().block());
        Assertions.assertDomEq('Should be expected to block', expectedToBlock, blockBoundary.to().block());
      });
    };

    var cAssertBlockBoundaryNone = Chain.op(function (blockBoundaryOption) {
      Assertions.assertEq('BlockBoundary should be none', true, blockBoundaryOption.isNone());
    });

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('None block boundaries', GeneralSteps.sequence([
        Logger.t('Should be none since it is a single block', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cReadBlockBoundary(true, [0, 0], 0),
          cAssertBlockBoundaryNone
        ])),
        Logger.t('Should be none since it is a single block', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cReadBlockBoundary(false, [0, 0], 1),
          cAssertBlockBoundaryNone
        ])),
        Logger.t('Should be none since it is in the middle of a block', Chain.asStep(viewBlock, [
          cSetHtml('<p>ab</p><p>c</p>'),
          cReadBlockBoundary(true, [0, 0], 1),
          cAssertBlockBoundaryNone
        ])),
        Logger.t('Should be none since it is in the middle of a block', Chain.asStep(viewBlock, [
          cSetHtml('<p>c</p><p>ab</p>'),
          cReadBlockBoundary(true, [1, 0], 1),
          cAssertBlockBoundaryNone
        ]))
      ])),

      Logger.t('Some block boundaries', GeneralSteps.sequence([
        Logger.t('Should some between simple blocks (forwards: true)', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p>b</p>'),
          cReadBlockBoundary(true, [0, 0], 1),
          cAssertBlockBoundaryPositions([0, 0], 1, [1, 0], 0),
          cAssertBlockBoundaryBlocks([0], [1])
        ])),
        Logger.t('Should some between simple blocks (forwards: false)', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p>b</p>'),
          cReadBlockBoundary(false, [1, 0], 0),
          cAssertBlockBoundaryPositions([1, 0], 0, [0, 0], 1),
          cAssertBlockBoundaryBlocks([1], [0])
        ])),
        Logger.t('Should some between complex blocks (forwards: true)', Chain.asStep(viewBlock, [
          cSetHtml('<p><em>a</em></p><p><em>b</em></p>'),
          cReadBlockBoundary(true, [0, 0, 0], 1),
          cAssertBlockBoundaryPositions([0, 0, 0], 1, [1, 0, 0], 0),
          cAssertBlockBoundaryBlocks([0], [1])
        ])),
        Logger.t('Should some between complex blocks (forwards: false)', Chain.asStep(viewBlock, [
          cSetHtml('<p><em>a</em></p><p><em>b</em></p>'),
          cReadBlockBoundary(false, [1, 0, 0], 0),
          cAssertBlockBoundaryPositions([1, 0, 0], 0, [0, 0, 0], 1),
          cAssertBlockBoundaryBlocks([1], [0])
        ])),
        Logger.t('Should some between blocks with br (forwards: true)', Chain.asStep(viewBlock, [
          cSetHtml('<p>a<br></p><p>b</p>'),
          cReadBlockBoundary(true, [0, 0], 1),
          cAssertBlockBoundaryPositions([0, 0], 1, [1, 0], 0),
          cAssertBlockBoundaryBlocks([0], [1])
        ]))
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);