import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Height from 'ephox/sugar/api/view/Height';
import * as Width from 'ephox/sugar/api/view/Width';
import { Dimension } from 'ephox/sugar/impl/Dimension';
import Div from 'ephox/sugar/test/Div';
import MathElement from 'ephox/sugar/test/MathElement';

interface DimensionApi {
  get: (element: SugarElement<HTMLElement>) => number;
  getOuter: (element: SugarElement<HTMLElement>) => number;
  getInner: (element: SugarElement<HTMLElement>) => number;
  set: (element: SugarElement<HTMLElement>, value: number | string) => void;
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
    Insert.append(c, SugarElement.fromHtml('&nbsp;')); // div has no height without content

    // disconnected tests
    Assert.eq('', 0, dimension.get(c));
    Assert.eq('', 0, dimension.getOuter(c));
    Assert.eq('', 0, dimension.getInner(c));

    Insert.append(SugarBody.body(), c);
    Insert.append(SugarBody.body(), m);

    dimension.get(m);
    dimension.getOuter(m);
    dimension.set(m, 0);

    Assert.eq('', true, dimension.get(c) > 0);
    Assert.eq('', true, dimension.getOuter(c) > 0);
    Assert.eq('', true, dimension.getInner(c) > 0);

    dimension.set(c, 0);

    // Based on JQuery tests, but far more extensive
    // Also in TBIO we don't generally care about JQuery's difference between get() and getOuter()
    Css.set(c, 'padding', '20px');
    // padding only
    Assert.eq('', 40, dimension.get(c));        // jQuery === 0
    Assert.eq('', 40, dimension.getOuter(c));
    Assert.eq('', 0, dimension.getInner(c));

    Css.set(c, 'border', '2px solid #fff');
    // border + padding
    Assert.eq('', 44, dimension.get(c));        // jQuery === 0
    Assert.eq('', 44, dimension.getOuter(c));
    Assert.eq('', 0, dimension.getInner(c));

    Css.set(c, 'margin', '3px');
    // border + padding + margin
    Assert.eq('', 44, dimension.get(c));        // jQuery === 0
    Assert.eq('', 44, dimension.getOuter(c));
    Assert.eq('', 0, dimension.getInner(c));

    // COMPLETE MADNESS: With border-sizing: border-box JQuery does WEIRD SHIT when you set width.
    // This is all so that when you request a width, it gives the same value.
    // We decided not to replicate this.
    dimension.set(c, 20);
    // border + padding + width + margin
    const bpwm = borderBox ? 44 : 64;
    const innerBpwm = borderBox ? 0 : 20;
    Assert.eq('', bpwm, dimension.get(c));      // jQuery === 20 in both cases
    Assert.eq('', bpwm, dimension.getOuter(c)); // jQuery === 64 in both cases
    Assert.eq('', innerBpwm, dimension.getInner(c));

    Css.remove(c, 'padding');
    // border + mad JQuery width + margin
    const bwmSize = borderBox ? 16 : 20;
    Assert.eq('', bwmSize + 4, dimension.get(c)); // jQuery === +0
    Assert.eq('', bwmSize + 4, dimension.getOuter(c));
    Assert.eq('', bwmSize, dimension.getInner(c));

    dimension.set(c, 20);
    // border + width + margin
    Assert.eq('', bwmSize + 4, dimension.get(c));          // jQuery === 20
    Assert.eq('', bwmSize + 4, dimension.getOuter(c));
    Assert.eq('', bwmSize, dimension.getInner(c));

    Css.remove(c, 'border');
    // width + margin
    Assert.eq('', 20, dimension.get(c));            // jQuery === 24 in border-box mode
    Assert.eq('', 20, dimension.getOuter(c));       // jQuery === 24 in border-box mode
    Assert.eq('', 20, dimension.getInner(c));

    dimension.set(c, 20);
    // width + margin
    Assert.eq('', 20, dimension.get(c));
    Assert.eq('', 20, dimension.getOuter(c));
    Assert.eq('', 20, dimension.getInner(c));

    Css.remove(c, 'margin');

    // just width
    Assert.eq('', 20, dimension.get(c));
    Assert.eq('', 20, dimension.getOuter(c));
    Assert.eq('', 20, dimension.getInner(c));

    // generally dupe with above, but replicates a JQuery test
    Css.setAll(c, {
      margin: '10px',
      border: '2px solid #fff',
      width: '30px',
      height: '30px'
    });

    const allSize = borderBox ? 30 : 34;        // jQuery === 26 : 30
    const innerAllSize = borderBox ? 26 : 30;
    Assert.eq('', allSize, dimension.get(c));
    Assert.eq('', allSize, dimension.getOuter(c));
    Assert.eq('', innerAllSize, dimension.getInner(c));
    Css.set(c, 'padding', '20px');
    const allSizePlusPadding = borderBox ? 44 : 74; // jQuery === 40 : 70
    const innerAllSizePlusPadding = borderBox ? 0 : 30;
    Assert.eq('', allSizePlusPadding, dimension.get(c));
    Assert.eq('', allSizePlusPadding, dimension.getOuter(c));
    Assert.eq('', innerAllSizePlusPadding, dimension.getInner(c));

    // TODO: Far more extensive tests involving combinations of border, margin and padding.

    Attribute.remove(c, 'style');
    dimension.set(c, 50);
    Assert.eq('', 50, dimension.get(c));
    Assert.eq('', 50, dimension.getOuter(c));
    Css.set(c, 'visibility', 'hidden');
    Assert.eq('', 50, dimension.get(c));
    Assert.eq('', 50, dimension.getOuter(c));
    Assert.eq('', 50, dimension.getInner(c));

    Css.set(c, 'border', '5px solid black');
    Assert.eq('', 60, dimension.get(c));
    Assert.eq('', 60, dimension.getOuter(c)); // 5 + 50 + 5
    Assert.eq('', 50, dimension.getInner(c));
    Remove.remove(c);
    Remove.remove(m);
  };

  runChecks(Width, false); // content-box
  runChecks(Height, false);
  runChecks(Width, true); // border-box
  runChecks(Height, true);

  /*
    max-height & max-width tests
  */

  const bounds = SugarElement.fromTag('div');
  const container = SugarElement.fromTag('div');
  const inner = SugarElement.fromTag('div');

  const paddingTop = 2;
  const marginBottom = 3;
  const borderWidth = 6; // top & bottom 6 + 6

  const paddingRight = 30;
  const paddingLeft = 15;

  const maxHeight = 50;
  const maxWidth = 200;

  Attribute.set(bounds, 'title', 'I am the bounds, i should never be larger than ' + maxHeight + 'px high or ' + maxWidth + 'px wide, and my scrollHeight/Width should never exceed those limits either. k?');
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
  Insert.append(SugarBody.body(), bounds);

  // Aggregator test
  // Dimension.aggregate takes an element and a list of properties that return measurement values.
  // it will accumulative add all the properties and return a cumulative total.
  const dim = Dimension('internal', Fun.constant(1));
  const ctotal = dim.aggregate(container, [ 'padding-top', 'margin-bottom', 'border-top-width', 'border-bottom-width' ]);
  Assert.eq('', (paddingTop + marginBottom + borderWidth + borderWidth), ctotal);

  // mixit up, add unknowns
  const mixup = dim.aggregate(container, [ 'padding-top', 'margin-bottom', 'border-top-width', 'border-bottom-width', 'padding-bottom', 'display', 'elmos-house' ]);
  Assert.eq('', (paddingTop + marginBottom + borderWidth + borderWidth + 0 + 0 + 0), mixup);

  // Height.setMax test
  // when we set max-height: 100px we mean it!, natively borders and padding are not included in these calculations
  // so we end up with a container thats eg: 120px, the Height.max method normalises all this to ensure the max is absolutely max.
  Css.set(container, 'max-height', maxHeight + 'px');

  const innerHeight = Height.get(inner);
  Assert.eq('', 1 + 40 + 1, innerHeight);

  // native max-height proof of failure
  const containerHeight = Height.get(container);
  Assert.eq('failing case the parent boundary should be greater than the allowed maximum', true, containerHeight > maxHeight);
  // we use the innerHeight value here because it has yet to hit the maxHeight
  Assert.eq('failing case true calculation does not match', (borderWidth + paddingTop + innerHeight + borderWidth ), containerHeight);

  const boundsHeight = Height.get(bounds);
  Assert.eq('failing case the parent boundary should be greater than the allowed maximum', true, boundsHeight > maxHeight);

  // if the child pushes the parent oversize, the parent may be forced to scroll which may not be desirable
  Assert.eq('the parent bounds should be the same height as the child container', true, boundsHeight > containerHeight);

  // Passing test, the container should equal to maxHeight set!
  Height.setMax(container, maxHeight);
  // The bounds should not exceed 50 (maxHeight), it should not be forced to scroll
  const boundsAbsHeight = Height.get(bounds);
  Assert.eq('', boundsAbsHeight, maxHeight);

  // the max-height property should be a compensated value.
  const cssMaxHeight = Css.get(container, 'max-height');
  Assert.eq('', ( maxHeight - paddingTop - borderWidth - borderWidth - marginBottom ) + 'px', cssMaxHeight);

  // native max-width: proof of failure
  Css.set(container, 'max-width', maxWidth + 'px');

  const innerWidth = Width.get(inner);
  Assert.eq('', 1 + 350 + 1, innerWidth);

  const containerWidth = Width.get(container);
  Assert.eq('', true, containerWidth > maxWidth);

  const boundsWidth = Width.get(bounds);
  Assert.eq('', true, boundsWidth > maxWidth);

  // Table height test Firefox will exclude caption from offsetHeight
  const tbl = SugarElement.fromHtml<HTMLTableElement>('<table><caption style="height: 300px"></caption><tbody><tr><td style="height: 10px"></td></tr></tbody></table>');
  Insert.append(bounds, tbl);
  Assert.eq('Height should be more than 300', true, Height.getOuter(tbl) > 300);

  // Height on detached node
  const detachedElm = SugarElement.fromHtml<HTMLDivElement>('<div>a</div>');
  Assert.eq('Should be zero for a detached element', 0, Height.getOuter(detachedElm));

  // This test is broken in ie10, we don't understand exactly how it calculates max-width, every other platform passes.
  // Since we are not using the Width.setMax method in out codebase, commenting it out till then.

  // // We use the maxWidth value, because the container is contained within maxWidth, however ever overall width is calculated as per assertion below, which in total is larger than max-width
  // Assert.eq('failing case true calculation does not match', (borderWidth + paddingLeft + maxWidth + paddingRight + borderWidth ), containerWidth);

  // // Passing test, the container should equal to maxWidth set!
  // Width.setMax(container, maxWidth);

  // var boundsAbsWidth = Width.get(bounds);
  // Assert.eq('', boundsAbsWidth, maxWidth);

  // var containerAbsWidth = Width.get(container);
  // Assert.eq('', containerAbsWidth, maxWidth);

  // // the max-width property should be a compensated value.
  // var cssMaxWidth = Css.get(container, 'max-width');
  // Assert.eq('', ( maxWidth - borderWidth - paddingLeft - paddingRight - borderWidth ) + 'px', cssMaxWidth);

  // cleanup
  Remove.remove(bounds);
});
