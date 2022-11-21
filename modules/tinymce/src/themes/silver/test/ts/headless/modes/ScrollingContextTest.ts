import { Cursors } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Css, Insert, InsertAll, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as ScrollingContext from 'tinymce/themes/silver/modes/ScrollingContext';

describe('headless.modes.ScrollingContextTest', () => {
  const makeWith = (nodeName: string, styles: Record<string, string>, children: SugarElement<Node>[]): SugarElement<Node> => {
    const parent = SugarElement.fromTag(nodeName);
    Css.setAll(parent, styles);
    InsertAll.append(parent, children);
    return parent;
  };

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

    // Try to create a situation where the window has half-scrolled down a scroller, which has
    // half scrolled down a scroller. So the bounds should be the portion of the inner-most scroller
    // that isn't cut off by the wrapping scroller and the top of the window
    it('TINY-9226: Nested scrollers cut-off by window', () => {
      const innerScroller = makeWith(
        'div',
        {
          'overflow': 'scroll',
          'height': '2000px',
          'background-color': 'black'
        },
        [ ]
      ) as SugarElement<HTMLElement>;

      const bannerHeight = 150;

      const outerScroller = makeWith(
        'div',
        {
          'position': 'absolute',
          'left': '300px',
          'top': '100px',
          'height': '400px',
          // This width will put a horizontal scrollbar on the window
          // We use such a big width to check that the window is being considered
          // when constraining it.
          'width': '4000px',
          'background-color': 'purple',
          'overflow': 'auto'
        },
        [
          makeWith('div', { 'height': `${bannerHeight}px`, 'background-color': 'green' }, [ ]),
          innerScroller
        ]
      ) as SugarElement<HTMLElement>;

      const body = SugarBody.body();
      Insert.append(body, outerScroller);

      // We need to add enough margin so that we can scroll the page.
      Css.set(body, 'margin-bottom', '2000px');

      window.scrollBy({
        top: outerScroller.dom.getBoundingClientRect().top + 100
      });

      outerScroller.dom.scrollTop = bannerHeight + 50;
      const outerScrollerRect = outerScroller.dom.getBoundingClientRect();

      const actual = ScrollingContext.getBoundsFrom({
        element: innerScroller,
        others: [ outerScroller ]
      });

      // Restore the page, but save the values that will change first.
      const widthPreRestore = window.document.body.clientWidth;
      const scrollYPreRestore = window.scrollY;
      Remove.remove(outerScroller);
      Css.remove(body, 'margin-bottom');

      // These will be absolute coordinates.
      const expected: Boxes.Bounds = {
        x: outerScrollerRect.left,
        y: scrollYPreRestore,
        width: widthPreRestore - outerScrollerRect.left,
        height: outerScrollerRect.bottom,
        right: widthPreRestore,
        bottom: scrollYPreRestore + outerScrollerRect.bottom
      };

      assert.deepEqual(actual, expected);
    });
  });
});
