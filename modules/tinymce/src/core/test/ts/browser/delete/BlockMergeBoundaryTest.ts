import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { Hierarchy, Element } from '@ephox/sugar';
import * as BlockMergeBoundary from 'tinymce/core/delete/BlockMergeBoundary';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';

type BlockBoundary = BlockMergeBoundary.BlockBoundary;

UnitTest.asynctest('browser.tinymce.core.delete.BlockMergeBoundary', function (success, failure) {
  const viewBlock = ViewBlock();

  const cSetHtml = function (html) {
    return Chain.op(function () {
      viewBlock.update(html);
    });
  };

  const cReadBlockBoundary = function (forward, cursorPath, cursorOffset) {
    return Chain.mapper(function (viewBlock: any) {
      const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), cursorPath).getOrDie();
      const rng = document.createRange();
      rng.setStart(container.dom(), cursorOffset);
      rng.setEnd(container.dom(), cursorOffset);
      return BlockMergeBoundary.read(viewBlock.get(), forward, rng);
    });
  };

  const cAssertBlockBoundaryPositions = function (fromPath, fromOffset, toPath, toOffset): Chain<Option<BlockBoundary>, Option<BlockBoundary>> {
    return Chain.op(function (blockBoundaryOption: Option<BlockMergeBoundary.BlockBoundary>) {
      const fromContainer = Hierarchy.follow(Element.fromDom(viewBlock.get()), fromPath).getOrDie();
      const toContainer = Hierarchy.follow(Element.fromDom(viewBlock.get()), toPath).getOrDie();
      const blockBoundary = blockBoundaryOption.getOrDie();

      Assertions.assertDomEq('Should be expected from container', fromContainer, Element.fromDom(blockBoundary.from.position.container()));
      Assertions.assertEq('Should be expected from offset', fromOffset, blockBoundary.from.position.offset());
      Assertions.assertDomEq('Should be expected to container', toContainer, Element.fromDom(blockBoundary.to.position.container()));
      Assertions.assertEq('Should be expected to offset', toOffset, blockBoundary.to.position.offset());
    });
  };

  const cAssertBlockBoundaryBlocks = function (fromBlockPath: number[], toBlockPath: number[]): Chain<Option<BlockBoundary>, Option<BlockBoundary>> {
    return Chain.op(function (blockBoundaryOption: Option<BlockBoundary>) {
      const expectedFromBlock = Hierarchy.follow(Element.fromDom(viewBlock.get()), fromBlockPath).getOrDie();
      const expectedToBlock = Hierarchy.follow(Element.fromDom(viewBlock.get()), toBlockPath).getOrDie();
      const blockBoundary = blockBoundaryOption.getOrDie();

      Assertions.assertDomEq('Should be expected from block', expectedFromBlock, blockBoundary.from.block);
      Assertions.assertDomEq('Should be expected to block', expectedToBlock, blockBoundary.to.block);
    });
  };

  const cAssertBlockBoundaryNone = Chain.op(function (blockBoundaryOption: Option<BlockBoundary >) {
    Assertions.assertEq('BlockBoundary should be none', true, blockBoundaryOption.isNone());
  });

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('None block boundaries', GeneralSteps.sequence([
      Logger.t('Should be none since it is a single block', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cReadBlockBoundary(true, [ 0, 0 ], 0),
        cAssertBlockBoundaryNone
      ])),
      Logger.t('Should be none since it is a single block', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cReadBlockBoundary(false, [ 0, 0 ], 1),
        cAssertBlockBoundaryNone
      ])),
      Logger.t('Should be none since it is in the middle of a block', Chain.asStep(viewBlock, [
        cSetHtml('<p>ab</p><p>c</p>'),
        cReadBlockBoundary(true, [ 0, 0 ], 1),
        cAssertBlockBoundaryNone
      ])),
      Logger.t('Should be none since it is in the middle of a block', Chain.asStep(viewBlock, [
        cSetHtml('<p>c</p><p>ab</p>'),
        cReadBlockBoundary(true, [ 1, 0 ], 1),
        cAssertBlockBoundaryNone
      ]))
    ])),

    Logger.t('Some block boundaries', GeneralSteps.sequence([
      Logger.t('Should some between simple blocks (forwards: true)', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p>'),
        cReadBlockBoundary(true, [ 0, 0 ], 1),
        cAssertBlockBoundaryPositions([ 0, 0 ], 1, [ 1, 0 ], 0),
        cAssertBlockBoundaryBlocks([ 0 ], [ 1 ])
      ])),
      Logger.t('Should some between simple blocks (forwards: false)', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p>'),
        cReadBlockBoundary(false, [ 1, 0 ], 0),
        cAssertBlockBoundaryPositions([ 1, 0 ], 0, [ 0, 0 ], 1),
        cAssertBlockBoundaryBlocks([ 1 ], [ 0 ])
      ])),
      Logger.t('Should some between complex blocks (forwards: true)', Chain.asStep(viewBlock, [
        cSetHtml('<p><em>a</em></p><p><em>b</em></p>'),
        cReadBlockBoundary(true, [ 0, 0, 0 ], 1),
        cAssertBlockBoundaryPositions([ 0, 0, 0 ], 1, [ 1, 0, 0 ], 0),
        cAssertBlockBoundaryBlocks([ 0 ], [ 1 ])
      ])),
      Logger.t('Should some between complex blocks (forwards: false)', Chain.asStep(viewBlock, [
        cSetHtml('<p><em>a</em></p><p><em>b</em></p>'),
        cReadBlockBoundary(false, [ 1, 0, 0 ], 0),
        cAssertBlockBoundaryPositions([ 1, 0, 0 ], 0, [ 0, 0, 0 ], 1),
        cAssertBlockBoundaryBlocks([ 1 ], [ 0 ])
      ])),
      Logger.t('Should some between blocks with br (forwards: true)', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br></p><p>b</p>'),
        cReadBlockBoundary(true, [ 0, 0 ], 1),
        cAssertBlockBoundaryPositions([ 0, 0 ], 1, [ 1, 0 ], 0),
        cAssertBlockBoundaryBlocks([ 0 ], [ 1 ])
      ]))
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
