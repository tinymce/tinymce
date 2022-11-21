import { Cursors } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Css, InsertAll, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as ScrollingContext from 'tinymce/themes/silver/modes/ScrollingContext';

describe('headless.modes.ScrollingContextTest', () => {
  context('isScroller', () => {
    it('TINY-9226: overflow default - not a scroller', () => {
      const div = SugarElement.fromHtml('<div>A</div>');
      assert.isFalse(ScrollingContext.isScroller(div), 'Should not be a scroller');
    });

    it('TINY-9226: overflow: visible - not a scroller', () => {
      const div = SugarElement.fromHtml('<div style="overflow: visible;">A</div>');
      assert.isFalse(ScrollingContext.isScroller(div), 'Should not be a scroller');
    });

    it('TINY-9226: overflow: auto - a scroller', () => {
      const div = SugarElement.fromHtml('<div style="overflow: auto;">A</div>');
      assert.isTrue(ScrollingContext.isScroller(div), 'Should be a scroller');
    });

    it('TINY-9226: overflow: scroll - a scroller', () => {
      const div = SugarElement.fromHtml('<div style="overflow: scroll;">A</div>');
      assert.isTrue(ScrollingContext.isScroller(div), 'Should be a scroller');
    });
  });

  context('detect', () => {

    const makeWith = (nodeName: string, styles: Record<string, string>, children: SugarElement<Node>[]): SugarElement<Node> => {
      const parent = SugarElement.fromTag(nodeName);
      Css.setAll(parent, styles);
      InsertAll.append(parent, children);
      return parent;
    };

    it('TINY-9226: no scrolling contexts', () => {
      const situation = makeWith('div', { }, [
        makeWith('div', { }, [
          makeWith('div', { }, [
            makeWith('div', { }, [

            ])
          ])
        ])
      ]);

      const target = Cursors.follow(situation, [ 0, 0, 0 ]).getOrDie() as SugarElement<HTMLElement>;

      const optActual = ScrollingContext.detect(target);
      assert.isTrue(optActual.isNone(), 'There should be no scrolling context');
    });

    it('TINY-9226: several scrolling contexts', () => {
      const situation = makeWith('div', {
        overflow: 'auto'
      }, [
        makeWith('div', {
          overflow: 'auto'
        }, [
          makeWith('div', {
            overflow: 'scroll'
          }, [
            makeWith('div', { }, [

            ])
          ])
        ])
      ]);

      const follow = (path: number[]): SugarElement<HTMLElement> =>
        Cursors.follow(situation, path).getOrDie() as SugarElement<HTMLElement>;

      const target = follow([ 0, 0, 0 ]);

      const optActual = ScrollingContext.detect(target);
      optActual.fold(
        () => assert.fail('Should have found a scrolling context'),
        (actual) => assert.deepEqual(
          actual,
          {
            element: follow([ 0, 0 ]),
            others: [
              follow([ 0 ]),
              follow([ ])
            ]
          }
        )
      );
    });
  });

  context('getBoundsFrom', () => {
    it.skip('TINY-9226: Sanity test', () => Fun.noop);
  });
});
