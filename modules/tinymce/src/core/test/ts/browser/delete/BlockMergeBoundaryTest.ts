import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as BlockMergeBoundary from 'tinymce/core/delete/BlockMergeBoundary';

import * as ViewBlock from '../../module/test/ViewBlock';

type BlockBoundary = BlockMergeBoundary.BlockBoundary;

describe('browser.tinymce.core.delete.BlockMergeBoundary', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = viewBlock.update;

  const readBlockBoundary = (forward: boolean, cursorPath: number[], cursorOffset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), cursorPath).getOrDie();
    const rng = document.createRange();
    rng.setStart(container.dom, cursorOffset);
    rng.setEnd(container.dom, cursorOffset);
    return BlockMergeBoundary.read(viewBlock.get(), forward, rng);
  };

  const assertBlockBoundaryPositions = (blockBoundaryOpt: Optional<BlockBoundary>, fromPath: number[], fromOffset: number, toPath: number[], toOffset: number) => {
    const fromContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), fromPath).getOrDie();
    const toContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), toPath).getOrDie();
    const blockBoundary = blockBoundaryOpt.getOrDie();

    Assertions.assertDomEq('Should be expected from container', fromContainer, SugarElement.fromDom(blockBoundary.from.position.container()));
    assert.equal(blockBoundary.from.position.offset(), fromOffset, 'Should be expected from offset');
    Assertions.assertDomEq('Should be expected to container', toContainer, SugarElement.fromDom(blockBoundary.to.position.container()));
    assert.equal(blockBoundary.to.position.offset(), toOffset, 'Should be expected to offset');
  };

  const assertBlockBoundaryBlocks = (blockBoundaryOpt: Optional<BlockBoundary>, fromBlockPath: number[], toBlockPath: number[]) => {
    const expectedFromBlock = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), fromBlockPath).getOrDie();
    const expectedToBlock = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), toBlockPath).getOrDie();
    const blockBoundary = blockBoundaryOpt.getOrDie();

    Assertions.assertDomEq('Should be expected from block', expectedFromBlock, blockBoundary.from.block);
    Assertions.assertDomEq('Should be expected to block', expectedToBlock, blockBoundary.to.block);
  };

  const assertBlockBoundaryNone = (blockBoundaryOpt: Optional<BlockBoundary>) => {
    assert.isTrue(blockBoundaryOpt.isNone(), 'BlockBoundary should be none');
  };

  context('None block boundaries', () => {
    it('Should be none since it is a single block (forwards: true)', () => {
      setHtml('<p>a</p>');
      const boundaryOpt = readBlockBoundary(true, [ 0, 0 ], 0);
      assertBlockBoundaryNone(boundaryOpt);
    });

    it('Should be none since it is a single block (forwards: false)', () => {
      setHtml('<p>a</p>');
      const boundaryOpt = readBlockBoundary(false, [ 0, 0 ], 1);
      assertBlockBoundaryNone(boundaryOpt);
    });

    it('Should be none since it is in the middle of a block with a trailing block', () => {
      setHtml('<p>ab</p><p>c</p>');
      const boundaryOpt = readBlockBoundary(true, [ 0, 0 ], 1);
      assertBlockBoundaryNone(boundaryOpt);
    });

    it('Should be none since it is in the middle of a block with a preceding block', () => {
      setHtml('<p>c</p><p>ab</p>');
      const boundaryOpt = readBlockBoundary(true, [ 1, 0 ], 1);
      assertBlockBoundaryNone(boundaryOpt);
    });
  });

  context('Some block boundaries', () => {
    it('Should some between simple blocks (forwards: true)', () => {
      setHtml('<p>a</p><p>b</p>');
      const boundaryOpt = readBlockBoundary(true, [ 0, 0 ], 1);
      assertBlockBoundaryPositions(boundaryOpt, [ 0, 0 ], 1, [ 1, 0 ], 0);
      assertBlockBoundaryBlocks(boundaryOpt, [ 0 ], [ 1 ]);
    });

    it('Should some between simple blocks (forwards: false)', () => {
      setHtml('<p>a</p><p>b</p>');
      const boundaryOpt = readBlockBoundary(false, [ 1, 0 ], 0);
      assertBlockBoundaryPositions(boundaryOpt, [ 1, 0 ], 0, [ 0, 0 ], 1);
      assertBlockBoundaryBlocks(boundaryOpt, [ 1 ], [ 0 ]);
    });

    it('Should some between complex blocks (forwards: true)', () => {
      setHtml('<p><em>a</em></p><p><em>b</em></p>');
      const boundaryOpt = readBlockBoundary(true, [ 0, 0, 0 ], 1);
      assertBlockBoundaryPositions(boundaryOpt, [ 0, 0, 0 ], 1, [ 1, 0, 0 ], 0);
      assertBlockBoundaryBlocks(boundaryOpt, [ 0 ], [ 1 ]);
    });

    it('Should some between complex blocks (forwards: false)', () => {
      setHtml('<p><em>a</em></p><p><em>b</em></p>');
      const boundaryOpt = readBlockBoundary(false, [ 1, 0, 0 ], 0);
      assertBlockBoundaryPositions(boundaryOpt, [ 1, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      assertBlockBoundaryBlocks(boundaryOpt, [ 1 ], [ 0 ]);
    });

    it('Should some between blocks with br (forwards: true)', () => {
      setHtml('<p>a<br></p><p>b</p>');
      const boundaryOpt = readBlockBoundary(true, [ 0, 0 ], 1);
      assertBlockBoundaryPositions(boundaryOpt, [ 0, 0 ], 1, [ 1, 0 ], 0);
      assertBlockBoundaryBlocks(boundaryOpt, [ 0 ], [ 1 ]);
    });
  });
});
