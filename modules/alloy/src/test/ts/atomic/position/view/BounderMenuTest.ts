import { UnitTest, assert } from '@ephox/bedrock-client';

import { Bounds, bounds } from 'ephox/alloy/alien/Boxes';
import * as Bubble from 'ephox/alloy/positioning/layout/Bubble';
import { AnchorBox, AnchorElement, AnchorLayout } from 'ephox/alloy/positioning/layout/LayoutTypes';
import * as LinkedLayout from 'ephox/alloy/positioning/layout/LinkedLayout';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

interface TestDecisionSpec {
  label: string;
  x: number;
  y: number;
  candidateYforTest?: number;
}

UnitTest.test('BounderMenuTest', () => {
  const check = (expected: TestDecisionSpec, preference: AnchorLayout[], anchor: AnchorBox, panel: AnchorElement, bubbles: Bubble.Bubble, bounds: Bounds) => {
    const actual = Bounder.attempts(preference, anchor, panel, bubbles, bounds);
    assert.eq(expected.label, actual.label);
    assert.eq(expected.x, actual.x);
    assert.eq(expected.y, actual.y);
    if (expected.candidateYforTest !== undefined) { assert.eq(expected.candidateYforTest, actual.candidateYforTest); }
  };

  // LinkedLayout is for submenus (vertically aligned to opposite side of menu)
  const four = [ LinkedLayout.southeast, LinkedLayout.southwest, LinkedLayout.northeast, LinkedLayout.northwest ];

  // empty input array is now invalid, just returns anchor coordinates
  check({
    label: 'none',
    x: 0,
    y: 0
  }, [], bounds(0, 0, 10, 10), bounds(0, 0, 50, 50), Bubble.fallback(), bounds(0, 0, 1000, 1000));

  check({
    label: 'none',
    x: 100,
    y: 0
  }, [], bounds(100, 0, 200, 50), bounds(0, 0, 150, 25), Bubble.nu(10, 0, { }), bounds(0, 0, 1000, 1000));

  const panelBox = bounds(0, 0, 100, 75);
  const bigPanel = bounds(0, 0, 75, 500);
  const view = bounds(50, 50, 350, 220);
  const bubb = Bubble.fallback();

  // Southeast.
  check({
    label: 'link-layout-se',
    x: 100 + 2,
    y: 55
  }, four, bounds(100, 55, 2, 2), panelBox, bubb, view);

  // Southwest.
  check({
    label: 'link-layout-sw',
    x: 320 - 100,
    y: 55
  }, four, bounds(320, 55, 2, 2), panelBox, bubb, view);

  // Northeast.
  check({
    label: 'link-layout-ne',
    x: 140 + 2,
    y: 235 + 2 - 75
  }, four, bounds(140, 235, 2, 2), panelBox, bubb, view);

  // Northwest.
  check({
    label: 'link-layout-nw',
    x: 320 - 100,
    y: 235 + 2 - 75
  }, four, bounds(320, 235, 2, 2), panelBox, bubb, view);

  // All fit -> southeast because of order of preference.
  check({
    label: 'link-layout-se',
    x: 270 + 2,
    y: 100
  }, four, bounds(270, 100, 2, 2), panelBox, bubb, view);

  // None near top left -> best fit is southeast
  check({
    label: 'link-layout-se',
    x: 55 + 2,
    y: 55
  }, four, bounds(55, 55, 2, 2), bigPanel, bubb, view);

  // None near top right -> best fit is southwest
  check({
    label: 'link-layout-sw',
    x: 350 - 75,
    y: 55
  }, four, bounds(350, 55, 2, 2), bigPanel, bubb, view);

  // None near bottom left -> best fit is northeast
  check({
    label: 'link-layout-ne',
    x: 55 + 2,
    y: 50,
    candidateYforTest: 200 + 2 - 500
  }, four, bounds(55, 200, 2, 2), bigPanel, bubb, view);

  // None near bottom right -> best fit is northwest
  check({
    label: 'link-layout-nw',
    x: 350 - 75,
    y: 50,
    candidateYforTest: 200 + 2 - 500
  }, four, bounds(350, 200, 2, 2), bigPanel, bubb, view);

  // Southeast (1px short on x and y).
  check({
    label: 'link-layout-se',
    x: 350 + 50 - 2 - 101 + 2,
    y: 220 + 50 - 76
  }, four, bounds(350 + 50 - 2 - 101, 220 + 50 - 76, 2, 2), panelBox, bubb, view);

  // Southeast (exactly for x and y).
  check({
    label: 'link-layout-se',
    x: 350 + 50 - 2 - 100 + 2,
    y: 220 + 50 - 75
  }, four, bounds(350 + 50 - 2 - 100, 220 + 50 - 75, 2, 2), panelBox, bubb, view);

  // Southeast -> Southwest (1px too far on x).
  check({
    label: 'link-layout-sw',
    x: 350 + 50 - 2 - 99 - 100,
    y: 220 + 50 - 75
  }, four, bounds(350 + 50 - 2 - 99, 220 + 50 - 75, 2, 2), panelBox, bubb, view);

  // Southeast -> Northeast (1px too far on y).
  check({
    label: 'link-layout-ne',
    x: 350 + 50 - 100,
    y: 220 + 50 - 74 + 2 - 75
  }, four, bounds(350 + 50 - 2 - 100, 220 + 50 - 74, 2, 2), panelBox, bubb, view);

  // Southeast -> Northwest (1px too far on x and y).
  check({
    label: 'link-layout-nw',
    x: 350 + 50 - 2 - 99 - 100,
    y: 220 + 50 - 74 + 2 - 75
  }, four, bounds(350 + 50 - 2 - 99, 220 + 50 - 74, 2, 2), panelBox, bubb, view);
});
