import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Schema from 'tinymce/core/api/html/Schema';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as MergeBlocks from 'tinymce/core/delete/MergeBlocks';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.delete.MergeBlocksTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = viewBlock.update;

  const baseSchema = Schema();

  const assertHtml = (expectedHtml: string) => {
    Assertions.assertHtml('Should equal html', expectedHtml, viewBlock.get().innerHTML);
  };

  const mergeBlocks = (forward: boolean, block1Path: number[], block2Path: number[]) => {
    const block1 = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), block1Path).getOrDie() as SugarElement<Element>;
    const block2 = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), block2Path).getOrDie() as SugarElement<Element>;
    return MergeBlocks.mergeBlocks(SugarElement.fromDom(viewBlock.get()), forward, block1, block2, baseSchema);
  };

  const assertPosition = (position: Optional<CaretPosition>, expectedPath: number[], expectedOffset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), expectedPath).getOrDie();

    Assertions.assertDomEq('Should be expected container', container, SugarElement.fromDom(position.getOrDie().container()));
    assert.equal(position.getOrDie().offset(), expectedOffset, 'Should be expected offset');
  };

  context('Merge forward', () => {
    it('Merge two simple blocks', () => {
      setHtml('<p>a</p><p>b</p>');
      const pos = mergeBlocks(true, [ 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<p>ab</p>');
    });

    it('Merge two simple blocks with br', () => {
      setHtml('<p>a<br></p><p>b</p>');
      const pos = mergeBlocks(true, [ 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<p>ab</p>');
    });

    it('Merge two complex blocks', () => {
      setHtml('<p><b>a</b><i>b</i></p><p><b>c</b><i>d</i></p>');
      const pos = mergeBlocks(true, [ 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 1, 0 ], 1);
      assertHtml('<p><b>a</b><i>b</i><b>c</b><i>d</i></p>');
    });

    it('Merge two headers blocks', () => {
      setHtml('<h1>a</h1><h2>b</h2>');
      const pos = mergeBlocks(true, [ 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<h1>ab</h1>');
    });

    it('Merge two headers blocks first one empty', () => {
      setHtml('<h1><br></h1><h2>b</h2>');
      const pos = mergeBlocks(true, [ 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 0 ], 0);
      assertHtml('<h2>b</h2>');
    });

    it('Merge two headers blocks second one empty', () => {
      setHtml('<h1>a</h1><h2><br></h2>');
      const pos = mergeBlocks(true, [ 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<h1>a</h1>');
    });

    it('Merge two headers complex blocks', () => {
      setHtml('<h1>a<b>b</b></h1><h2>c<b>d</b></h2>');
      const pos = mergeBlocks(true, [ 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 1, 0 ], 1);
      assertHtml('<h1>a<b>b</b>c<b>d</b></h1>');
    });

    it('Merge two headers blocks first one empty second one complex', () => {
      setHtml('<h1><br></h1><h2>a<b>b</b></h2>');
      const pos = mergeBlocks(true, [ 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 0 ], 0);
      assertHtml('<h2>a<b>b</b></h2>');
    });

    it('Merge two headers blocks second one empty first one complex', () => {
      setHtml('<h1>a<b>b</b></h1><h2><br></h2>');
      const pos = mergeBlocks(true, [ 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 1, 0 ], 1);
      assertHtml('<h1>a<b>b</b></h1>');
    });

    it('Merge two list items', () => {
      setHtml('<ul><li>a<b>b</b></li><li>c<b>d</b></li></ul>');
      const pos = mergeBlocks(true, [ 0, 0 ], [ 0, 1 ]);
      assertPosition(pos, [ 0, 0, 1, 0 ], 1);
      assertHtml('<ul><li>a<b>b</b>c<b>d</b></li></ul>');
    });

    it('Merge paragraph into list item', () => {
      setHtml('<ul><li>a<b>b</b></li></ul><p>c<b>d</b></p>');
      const pos = mergeBlocks(true, [ 0, 0 ], [ 1 ]);
      assertPosition(pos, [ 0, 0, 1, 0 ], 1);
      assertHtml('<ul><li>a<b>b</b>c<b>d</b></li></ul>');
    });

    it('Merge empty block into empty containing block', () => {
      setHtml('<div><h1></h1></div>');
      const pos = mergeBlocks(true, [ 0 ], [ 0, 0 ]);
      assertPosition(pos, [ 0 ], 0);
      assertHtml('<div><br data-mce-bogus="1"></div>');
    });

    it('Merge empty block into containing block', () => {
      setHtml('<div><h1></h1>c</div>');
      const pos = mergeBlocks(true, [ 0 ], [ 0, 0 ]);
      assertPosition(pos, [ 0 ], 0);
      assertHtml('<div><br>c</div>');
    });

    it('Merge first empty item of nested list into containing list item', () => {
      setHtml('<ul><li><ul><li></li><li>a</li></ul></li></ul>');
      const pos = mergeBlocks(true, [ 0, 0 ], [ 0, 0, 0, 0 ]);
      assertPosition(pos, [ 0, 0 ], 0);
      assertHtml('<ul><li><br><ul><li>a</li></ul></li></ul>');
    });
  });

  context('Merge backwards', () => {
    it('Merge two simple blocks', () => {
      setHtml('<p>a</p><p>b</p>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<p>ab</p>');
    });

    it('Merge two simple blocks with br', () => {
      setHtml('<p>a<br></p><p>b</p>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<p>ab</p>');
    });

    it('Merge two complex blocks', () => {
      setHtml('<p><b>a</b><i>b</i></p><p><b>c</b><i>d</i></p>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 1, 0 ], 1);
      assertHtml('<p><b>a</b><i>b</i><b>c</b><i>d</i></p>');
    });

    it('Merge two headers blocks', () => {
      setHtml('<h1>a</h1><h2>b</h2>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<h1>ab</h1>');
    });

    it('Merge two headers blocks first one empty', () => {
      setHtml('<h1>a</h1><h2><br></h2>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<h1>a</h1>');
    });

    it('Merge two headers blocks second one empty', () => {
      setHtml('<h1><br></h1><h2>b</h2>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 0);
      assertHtml('<h2>b</h2>');
    });

    it('Merge two headers complex blocks', () => {
      setHtml('<h1>a<b>b</b></h1><h2>c<b>d</b></h2>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 1, 0 ], 1);
      assertHtml('<h1>a<b>b</b>c<b>d</b></h1>');
    });

    it('Merge two headers blocks first one empty second one complex', () => {
      setHtml('<h1>a<b>b</b></h1><h2><br></h2>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 1, 0 ], 1);
      assertHtml('<h1>a<b>b</b></h1>');
    });

    it('Merge two headers blocks second one empty first one complex', () => {
      setHtml('<h1><br></h1><h2>a<b>b</b></h2>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 0);
      assertHtml('<h2>a<b>b</b></h2>');
    });

    it('Merge two list items', () => {
      setHtml('<ul><li>a<b>b</b></li><li>c<b>d</b></li></ul>');
      const pos = mergeBlocks(false, [ 0, 1 ], [ 0, 0 ]);
      assertPosition(pos, [ 0, 0, 1, 0 ], 1);
      assertHtml('<ul><li>a<b>b</b>c<b>d</b></li></ul>');
    });

    it('Merge list item into paragraph', () => {
      setHtml('<p>a<b>b</b></p><ul><li>c<b>d</b></li></ul>');
      const pos = mergeBlocks(false, [ 1, 0 ], [ 0 ]);
      assertPosition(pos, [ 0, 1, 0 ], 1);
      assertHtml('<p>a<b>b</b>c<b>d</b></p>');
    });

    it('Merge h1 into parent wrapper div', () => {
      setHtml('<div>a<h1>b</h1></div>');
      const pos = mergeBlocks(false, [ 0, 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<div>ab</div>');
    });

    it('Merge h1 inside a div into parent wrapper div', () => {
      setHtml('<div>a<div><h1>b</h1></div></div>');
      const pos = mergeBlocks(false, [ 0, 1, 0 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<div>ab</div>');
    });

    it('Merge div > div > div > h1 into root div', () => {
      setHtml('<div>a<div><div><h1>b</h1></div></div></div>');
      const pos = mergeBlocks(false, [ 0, 1, 0, 0 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<div>ab</div>');
    });

    it('Merge children until we find a block', () => {
      setHtml('<div>a</div><div>b<h1>c</h1></div>');
      const pos = mergeBlocks(false, [ 1 ], [ 0 ]);
      assertPosition(pos, [ 0, 0 ], 1);
      assertHtml('<div>ab</div><div><h1>c</h1></div>');
    });
  });
});
