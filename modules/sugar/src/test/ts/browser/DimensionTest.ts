import { assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLDivElement, HTMLElement, HTMLTableElement } from '@ephox/dom-globals';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Height from 'ephox/sugar/api/view/Height';
import * as Width from 'ephox/sugar/api/view/Width';
import Dimension from 'ephox/sugar/impl/Dimension';
import Div from 'ephox/sugar/test/Div';
import MathElement from 'ephox/sugar/test/MathElement';

interface DimensionApi {
  get: (element: Element<HTMLElement>) => number;
  getOuter: (element: Element<HTMLElement>) => number;
  set: (element: Element<HTMLElement>, value: number | string) => void;
}

UnitTest.test('DimensionTest', () => {
  /* Remember, these checks are run 4 times */
  const runChecks = (dimension: DimensionApi, borderBox: boolean) => {
    // dupe with BorderBox - please apply any changes to both.
    // can't refactor, so many of the values are different.

    const c = Div();
    const m = MathElement();
    if (borderBox) {
      Css.set(c, 'box-sizing', 'border-box');
    }
    Insert.append(c, Element.fromHtml('&nbsp;')); // div has no height without content

    // disconnected tests
    assert.eq(0, dimension.get(c));
    assert.eq(0, dimension.getOuter(c));

    Insert.append(Body.body(), c);
    Insert.append(Body.body(), m);

    dimension.get(m);
    dimension.getOuter(m);
    dimension.set(m, 0);

    assert.eq(true, dimension.get(c) > 0);
    assert.eq(true, dimension.getOuter(c) > 0);

    dimension.set(c, 0);

    // Based on JQuery tests, but far more extensive
    // Also in TBIO we don't generally care about JQuery's difference between get() and getOuter()
    Css.set(c, 'padding', '20px');
    // padding only
    assert.eq(40, dimension.get(c));        // jQuery === 0
    assert.eq(40, dimension.getOuter(c));

    Css.set(c, 'border', '2px solid #fff');
    // border + padding
    assert.eq(44, dimension.get(c));        // jQuery === 0
    assert.eq(44, dimension.getOuter(c));

    Css.set(c, 'margin', '3px');
    // border + padding + margin
    assert.eq(44, dimension.get(c));        // jQuery === 0
    assert.eq(44, dimension.getOuter(c));

    // COMPLETE MADNESS: With border-sizing: border-box JQuery does WEIRD SHIT when you set width.
    // This is all so that when you request a width, it gives the same value.
    // We decided not to replicate this.
    dimension.set(c, 20);
    // border + padding + width + margin
    const bpwm = borderBox ? 44 : 64;
    assert.eq(bpwm, dimension.get(c));      // jQuery === 20 in both cases
    assert.eq(bpwm, dimension.getOuter(c)); // jQuery === 64 in both cases

    Css.remove(c, 'padding');
    // border + mad JQuery width + margin
    const bwmSize = borderBox ? 16 : 20;
    assert.eq(bwmSize + 4, dimension.get(c)); // jQuery === +0
    assert.eq(bwmSize + 4, dimension.getOuter(c));

    dimension.set(c, 20);
    // border + width + margin
    assert.eq(bwmSize + 4, dimension.get(c));          // jQuery === 20
    assert.eq(bwmSize + 4, dimension.getOuter(c));

    Css.remove(c, 'border');
    // width + margin
    assert.eq(20, dimension.get(c));            // jQuery === 24 in border-box mode
    assert.eq(20, dimension.getOuter(c));       // jQuery === 24 in border-box mode

    dimension.set(c, 20);
    // width + margin
    assert.eq(20, dimension.get(c));
    assert.eq(20, dimension.getOuter(c));

    Css.remove(c, 'margin');

    // just width
    assert.eq(20, dimension.get(c));
    assert.eq(20, dimension.getOuter(c));

    // generally dupe with above, but replicates a JQuery test
    Css.setAll(c, {
      margin: '10px',
      border: '2px solid #fff',
      width: '30px',
      height: '30px'
    });

    const allSize = borderBox ? 30 : 34;        // jQuery === 26 : 30
    assert.eq(allSize, dimension.get(c));
    assert.eq(allSize, dimension.getOuter(c));
    Css.set(c, 'padding', '20px');
    const allSizePlusPadding = borderBox ? 44 : 74; // jQuery === 40 : 70
    assert.eq(allSizePlusPadding, dimension.get(c));
    assert.eq(allSizePlusPadding, dimension.getOuter(c));

    // TODO: Far more extensive tests involving combinations of border, margin and padding.

    Attr.remove(c, 'style');
    dimension.set(c, 50);
    assert.eq(50, dimension.get(c));
    assert.eq(50, dimension.getOuter(c));
    Css.set(c, 'visibility', 'hidden');
    assert.eq(50, dimension.get(c));
    assert.eq(50, dimension.getOuter(c));

    Css.set(c, 'border', '5px solid black');
    assert.eq(60, dimension.get(c));
    assert.eq(60, dimension.getOuter(c)); // 5 + 50 + 5
    Remove.remove(c);
  };

  runChecks(Width, false); // content-box
  runChecks(Height, false);
  runChecks(Width, true); // border-box
  runChecks(Height, true);

  /*
    max-height & max-width tests
  */

  const bounds = Element.fromTag('div');
  const container = Element.fromTag('div');
  const inner = Element.fromTag('div');

  const paddingTop = 2;
  const marginBottom = 3;
  const borderWidth = 6; // top & bottom 6 + 6

  const paddingRight = 30;
  const paddingLeft = 15;

  const maxHeight = 50;
  const maxWidth = 200;

  Attr.set(bounds, 'title', 'I am the bounds, i should never be larger than ' + maxHeight + 'px high or ' + maxWidth + 'px wide, and my scrollHeight/Width should never exceed those limits either. k?');
  Css.setAll(bounds, {
    display: 'inline-block',
    overflow: 'hidden' // for automated test purposes hidden is best for IE, scroll will add scroll bars
  });
  Css.setAll(inner, {
    height: '40px',
    width: '350px',
    border: '1px solid tomato'
  });

  Css.setAll(container, {
    'padding-top': paddingTop + 'px',
    'margin-bottom': marginBottom + 'px',
    'padding-left': paddingLeft + 'px',
    'padding-right': paddingRight + 'px',
    'border': borderWidth + 'px solid lime'
  });

  Insert.append(container, inner);
  Insert.append(bounds, container);
  Insert.append(Body.body(), bounds);

  // Aggregator test
  // Dimension.agregate takes an element and a list of propeties that return measurement values.
  // it will accumulatively add all the properties and return a cumulative total.
  const dim = Dimension('internal', () => 1);
  const ctotal = dim.aggregate(container, [ 'padding-top', 'margin-bottom', 'border-top-width', 'border-bottom-width' ]);
  assert.eq( ( paddingTop + marginBottom + borderWidth + borderWidth ), ctotal);

  // mixit up, add unknowns
  const mixup = dim.aggregate(container, [ 'padding-top', 'margin-bottom', 'border-top-width', 'border-bottom-width', 'padding-bottom', 'display', 'elmos-house' ]);
  assert.eq( ( paddingTop + marginBottom + borderWidth + borderWidth + 0 + 0 + 0), mixup);

  // Height.setMax test
  // when we set max-height: 100px we mean it!, natively borders and padding are not included in these calculations
  // so we end up with a container thats eg: 120px, the Height.max method normalises all this to ensure the max is absolutely max.
  Css.set(container, 'max-height', maxHeight + 'px');

  const innerHeight = Height.get(inner);
  assert.eq(1 + 40 + 1, innerHeight);

  // native max-height proof of failure
  const containerHeight = Height.get(container);
  assert.eq(true, containerHeight > maxHeight, 'failing case the parent boundary should be greater than the allowed maximum');
  // we use the innerHeight value here because it has yet to hit the maxHeight
  assert.eq( (borderWidth + paddingTop + innerHeight + borderWidth ), containerHeight, ' failing case true calculation does not match' );

  const boundsHeight = Height.get(bounds);
  assert.eq(true, boundsHeight > maxHeight, 'failing case the parent boundary should be greater than the allowed maximum');

  // if the child pushes the parent oversize, the parent may be forced to scroll which may not be desireable
  assert.eq(true, boundsHeight > containerHeight, ' the parent bounds should be the same height as the child container');

  // Passing test, the container should equal to maxHeight set!
  Height.setMax(container, maxHeight);
  // The bounds should not exceed 50 (maxHeight), it should not be forced to scroll
  const boundsAbsHeight = Height.get(bounds);
  assert.eq(boundsAbsHeight, maxHeight);

  // the max-height property should be a compensated value.
  const cssMaxHeight = Css.get(container, 'max-height');
  assert.eq(( maxHeight - paddingTop - borderWidth - borderWidth - marginBottom ) + 'px', cssMaxHeight);

  // native max-width: proof of failure
  Css.set(container, 'max-width', maxWidth + 'px');

  const innerWidth = Width.get(inner);
  assert.eq(1 + 350 + 1, innerWidth);

  const containerWidth = Width.get(container);
  assert.eq(true, containerWidth > maxWidth);

  const boundsWidth = Width.get(bounds);
  assert.eq(true, boundsWidth > maxWidth);

  // Table height test Firefox will exclude caption from offsetHeight
  const tbl = Element.fromHtml<HTMLTableElement>('<table><caption style="height: 300px"></caption><tbody><tr><td style="height: 10px"></td></tr></tbody></table>');
  Insert.append(bounds, tbl);
  assert.eq(true, Height.getOuter(tbl) > 300, 'Height should be more than 300');

  // Height on detached node
  const detachedElm = Element.fromHtml<HTMLDivElement>('<div>a</div>');
  assert.eq(0, Height.getOuter(detachedElm), 'Should be zero for a detached element');

  // This test is broken in ie10, we don't understand exactly how it calculates max-width, every other platform passes.
  // Since we are not using the Width.setMax method in out codebase, commenting it out till then.

  // // We use the maxWidth value, because the container is contained within maxWidth, however ever overall width is calculated as per assertion below, which in total is larger than max-width
  // assert.eq( (borderWidth + paddingLeft + maxWidth + paddingRight + borderWidth ), containerWidth, ' failing case true calculation does not match' );

  // // Passing test, the container should equal to maxWidth set!
  // Width.setMax(container, maxWidth);

  // var boundsAbsWidth = Width.get(bounds);
  // assert.eq(boundsAbsWidth, maxWidth);

  // var containerAbsWidth = Width.get(container);
  // assert.eq(containerAbsWidth, maxWidth);

  // // the max-width property should be a compensated value.
  // var cssMaxWidth = Css.get(container, 'max-width');
  // assert.eq(( maxWidth - borderWidth - paddingLeft - paddingRight - borderWidth ) + 'px', cssMaxWidth);

  // cleanup
  Remove.remove(bounds);
});
