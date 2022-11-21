import { context, describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as ScrollingContext from 'tinymce/themes/silver/modes/ScrollingContext';

describe('headless.modes.ScrollingContextTest', () => {
  context('isScroller', () => {
    it('overflow default - not a scroller', () => {
      const div = SugarElement.fromHtml('<div>A</div>');
      assert.isFalse(ScrollingContext.isScroller(div), 'Should not be a scroller');
    });

    it('overflow: visible - not a scroller', () => {
      const div = SugarElement.fromHtml('<div style="overflow: visible;">A</div>');
      assert.isFalse(ScrollingContext.isScroller(div), 'Should not be a scroller');
    });

    it('overflow: auto - a scroller', () => {
      const div = SugarElement.fromHtml('<div style="overflow: auto;">A</div>');
      assert.isTrue(ScrollingContext.isScroller(div), 'Should be a scroller');
    });

    it('overflow: scroll - a scroller', () => {
      const div = SugarElement.fromHtml('<div style="overflow: scroll;">A</div>');
      assert.isTrue(ScrollingContext.isScroller(div), 'Should be a scroller');
    });
  });

  // context('detect', () => {

  // });

  // context('getBoundsFrom', () => {

  // });
});
