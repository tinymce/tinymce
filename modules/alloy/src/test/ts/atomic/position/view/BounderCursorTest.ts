import { bounds, Bounds } from 'ephox/alloy/alien/Boxes';
import * as Bubble from 'ephox/alloy/positioning/layout/Bubble';
import * as Layout from 'ephox/alloy/positioning/layout/Layout';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('BounderCursorTest', () => {
  /* global assert */
  const check = (expected, preference, anchor, panel, bubbles, bounds) => {
    const actual = Bounder.attempts(preference, anchor, panel, bubbles, bounds);
    assert.eq(expected.label, actual.label());
    assert.eq(expected.x, actual.x());
    assert.eq(expected.y, actual.y());
    if (expected.candidateYforTest !== undefined) { assert.eq(expected.candidateYforTest, actual.candidateYforTest()); }
  };

  // Layout is for boxes with a bubble pointing to a cursor position (vertically aligned to nearest side)
  const four = [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest ];

  // empty input array is now invalid, just returns anchor coordinates
  check({
    label: 'none',
    x: 0,
    y: 0
  }, [], bounds(0, 0, 10, 10), bounds(0, 0, 50, 50), Bubble.nu(0, 0, { }), bounds(0, 0, 1000, 1000));

  check({
    label: 'none',
    x: 100,
    y: 0
  }, [], bounds(100, 0, 200, 50), bounds(0, 0, 150, 25), Bubble.nu(10, 0, { }), bounds(0, 0, 1000, 1000));

  const panelBox = bounds(0, 0, 100, 75);
  const bigPanel = bounds(0, 0, 75, 500);
  const widePanel = bounds(0, 0, 350, 500);
  const view = bounds(50, 50, 350, 220);
  const bubb = Bubble.fallback();

  /*
   * The expected values include the calculations that layout and bounder are doing
   */

  // Southeast.
  check({
    label: 'layout-se',
    x: 100,
    y: 55 + 2
  }, four, bounds(100, 55, 2, 2), panelBox, bubb, view);

  // Southwest.
  check({
    label: 'layout-sw',
    x: 320 - 100 + 2,
    y: 55 + 2
  }, four, bounds(320, 55, 2, 2), panelBox, bubb, view);

  // Northeast.
  check({
    label: 'layout-ne',
    x: 140,
    y: 235 - 75
  }, four, bounds(140, 235, 2, 2), panelBox, bubb, view);

  // Northwest.
  check({
    label: 'layout-nw',
    x: 320 - 100 + 2,
    y: 235 - 75
  }, four, bounds(320, 235, 2, 2), panelBox, bubb, view);

  // All fit -> southeast because of order of preference.
  check({
    label: 'layout-se',
    x: 270 + 0, //  capped at view width
    y: 100 + 2
  }, four, bounds(270, 100, 2, 2), panelBox, bubb, view);

  // None near top left -> best fit is southeast
  check({
    label: 'layout-se',
    x: 55,
    y: 55 + 2
  }, four, bounds(55, 55, 2, 2), bigPanel, bubb, view);

  // None near top right -> best fit is southwest
  check({
    label: 'layout-sw',
    x: 350 - 75 + 2,
    y: 55 + 2
  }, four, bounds(350, 55, 2, 2), bigPanel, bubb, view);

  // None near bottom left -> best fit is northeast
  check({
    label: 'layout-ne',
    x: 55,
    y: 50,
    candidateYforTest: 200 - 500
  }, four, bounds(55, 200, 2, 2), bigPanel, bubb, view);

  // None near bottom right -> best fit is northwest
  check({
    label: 'layout-nw',
    x: 350 - 75 + 2,
    y: 50,
    candidateYforTest: 200 - 500
  }, four, bounds(350, 200, 2, 2), bigPanel, bubb, view);

  // TBIO-3366 prevent negative x
  // southwest
  check({
    label: 'layout-sw',
    x: 0 + 50,
    y: 50 + 2
  }, four, bounds(300, 50, 2, 2), widePanel, bubb, view);

  // TBIO-3366
  // northwest
  check({
    label: 'layout-nw',
    x: 0 + 50,
    y: 50,
    candidateYforTest: 200 - 500
  }, four, bounds(300, 200, 2, 2), widePanel, bubb, view);

  // Southeast (1px short on x and y).
  check({
    label: 'layout-se',
    x: 350 + 50 - 101,
    y: 220 + 50 - 2 - 76 + 2
  }, four, bounds(350 + 50 - 101, 220 + 50 - 2 - 76, 2, 2), panelBox, bubb, view);

  // Southeast (exactly for x and y).
  check({
    label: 'layout-se',
    x: 350 + 50 - 100,
    y: 220 + 50 - 2 - 75 + 2
  }, four, bounds(350 + 50 - 100, 220 + 50 - 2 - 75, 2, 2), panelBox, bubb, view);

  // Southeast -> Southwest (1px too far on x).
  check({
    label: 'layout-sw',
    x: 350 + 50 - 99 - 100 + 2,
    y: 220 + 50 - 2 - 75 + 2
  }, four, bounds(350 + 50 - 99, 220 + 50 - 2 - 75, 2, 2), panelBox, bubb, view);

  // Southeast -> Northeast (1px too far on y).
  check({
    label: 'layout-ne',
    x: 350 + 50 - 100,
    y: 220 + 50 - 2 - 74 - 75
  }, four, bounds(350 + 50 - 100, 220 + 50 - 2 - 74, 2, 2), panelBox, bubb, view);

  // Southeast -> Northwest (1px too far on x and y).
  check({
    label: 'layout-nw',
    x: 350 + 50 - 99 - 100 + 2,
    y: 220 + 50 - 2 - 74 - 75
  }, four, bounds(350 + 50 - 99, 220 + 50 - 2 - 74, 2, 2), panelBox, bubb, view);
});
