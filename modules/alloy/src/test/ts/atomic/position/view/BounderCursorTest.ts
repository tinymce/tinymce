import { Assert, UnitTest } from '@ephox/bedrock-client';

import { Bounds, bounds } from 'ephox/alloy/alien/Boxes';
import * as Bubble from 'ephox/alloy/positioning/layout/Bubble';
import * as Layout from 'ephox/alloy/positioning/layout/Layout';
import { AnchorBox, AnchorElement, AnchorLayout } from 'ephox/alloy/positioning/layout/LayoutTypes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

interface TestDecisionSpec {
  label: string;
  x: number;
  y: number;
  candidateYforTest?: number;
}

UnitTest.test('BounderCursorTest', () => {
  /* global assert */
  const check = (expected: TestDecisionSpec, preference: AnchorLayout[], anchor: AnchorBox, panel: AnchorElement, bubbles: Bubble.Bubble, bounds: Bounds) => {
    const actual = Bounder.attempts(preference, anchor, panel, bubbles, bounds);
    Assert.eq('label', expected.label, actual.label());
    Assert.eq('X', expected.x, actual.x());
    Assert.eq('Y', expected.y, actual.y());
    if (expected.candidateYforTest !== undefined) { Assert.eq('Candidate Y', expected.candidateYforTest, actual.candidateYforTest()); }
  };

  // Layout is for boxes with a bubble pointing to a cursor position (vertically aligned to nearest side)
  const four = [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest ];
  const two = [ Layout.east, Layout.west ];

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

  // East
  check({
    label: 'layout-e',
    x: 55 + 10 ,
    y: 150 - (75 / 2) + (10 / 2)
  }, two, bounds(55, 150, 10, 10), panelBox, bubb, view);

  // None near bottom left -> best fit is east (limited to bottom bounds)
  check({
    label: 'layout-e',
    x: 55 + 10,
    y: 270 - 75
  }, two, bounds(55, 240, 10, 10), panelBox, bubb, view);

  // None near top left -> best fit is east (limited to top bounds)
  check({
    label: 'layout-e',
    x: 55 + 10,
    y: 50
  }, two, bounds(55, 80, 10, 10), panelBox, bubb, view);

  // West
  check({
    label: 'layout-w',
    x: 350 - 100,
    y: 150 - (75 / 2) + (10 / 2)
  }, two, bounds(350, 150, 10, 10), panelBox, bubb, view);

  // None near bottom right -> best fit is west (limited to bottom bounds)
  check({
    label: 'layout-w',
    x: 350 - 100,
    y: 270 - 75
  }, two, bounds(350, 240, 10, 10), panelBox, bubb, view);

  // None near top right -> best fit is west (limited to top bounds)
  check({
    label: 'layout-w',
    x: 350 - 100,
    y: 50
  }, two, bounds(350, 80, 10, 10), panelBox, bubb, view);
});
