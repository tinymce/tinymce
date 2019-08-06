import { Position } from '@ephox/sugar';
import { UnitTest, assert } from '@ephox/bedrock';

import { bounds } from 'ephox/alloy/alien/Boxes';
import * as Layout from 'ephox/alloy/positioning/layout/Layout';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';
import { Bubble } from 'ephox/alloy/positioning/layout/Bubble';

UnitTest.test('BounderToolbuttonTest', () => {
  /* global assert */
  const check = (expected, preference, anchor, panel, bubbles, bounds) => {
    const actual = Bounder.attempts(preference, anchor, panel, bubbles, bounds);
    assert.eq(expected.label, actual.label());
    assert.eq(expected.x, actual.x());
    assert.eq(expected.y, actual.y());
    if (expected.candidateYforTest !== undefined) { assert.eq(expected.candidateYforTest, actual.candidateYforTest()); }
  };

  // Layout is for boxes with a bubble pointing to a cursor position (vertically aligned to nearest side)
  // We use it for toolbar buttons, like naughty hobbitses, so this test will change (TBIO-2326) because right now it's insane.
  const chameleonBubble = (width): Bubble => {
    // no it's not a joke, this is a copy of ephox.chameleon.popup.Bubble
    const northeast = () => {
      return {
        offset: () => Position(-1, 1),
        classesOn: () => [ ],
        classesOff: () => [ ]
      };
    };

    const northwest = () => {
      return {
        offset: () => Position(width - 1, 1),
        classesOn: () => [ ],
        classesOff: () => [ ]
      };
    };

    const southeast = () => {
      return {
        offset: () => Position(-1, -2),
        classesOn: () => [ ],
        classesOff: () => [ ]
      };
    };

    const southwest = () => {
      return {
        offset: () => Position(width - 1, -2),
        classesOn: () => [ ],
        classesOff: () => [ ]
      };
    };

    const south = () => {
      return {
        offset: () => Position(-1, 1),
        classesOn: () => [ ],
        classesOff: () => [ ]
      };
    };

    const north = () => {
      return {
        offset: () => Position(-1, 1),
        classesOn: () => [ ],
        classesOff: () => [ ]
      };
    };

    const east = () => {
      return {
        offset: () => Position(-1, 1),
        classesOn: () => [ ],
        classesOff: () => [ ]
      };
    };

    const west = () => {
      return {
        offset: () => Position(-1, 1),
        classesOn: () => [ ],
        classesOff: () => [ ]
      };
    };

    return {
      northwest,
      northeast,
      southwest,
      southeast,
      south,
      north,
      east,
      west,
      innerSouthwest: northeast,
      innerSoutheast: northwest,
      innerSouth: north,
      innerNorthwest: southeast,
      innerNortheast: southwest,
      innerNorth: south,
      innerWest: east,
      innerEast: west
    };
  };

  const four = [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest ];

  // empty input array is now invalid, just returns anchor coordinates
  check({
    label: 'none',
    x: 0,
    y: 0
  }, [], bounds(0, 0, 10, 10), bounds(0, 0, 50, 50), chameleonBubble(0), bounds(0, 0, 1000, 1000));

  check({
    label: 'none',
    x: 100,
    y: 0
  }, [], bounds(100, 0, 200, 50), bounds(0, 0, 150, 25), chameleonBubble(10), bounds(0, 0, 1000, 1000));

  const panelBox = bounds(0, 0, 100, 75);
  const bigPanel = bounds(0, 0, 75, 500);
  const view = bounds(50, 50, 350, 220);
  const bubb = chameleonBubble(32);

  /*
   * The expected values include the calculations that layout and bounder are doing
   */

  // Southeast.
  check({
    label: 'layout-se',
    x: 100 - 1,
    y: 55 + 10 - 2
  }, four, bounds(100, 55, 10, 10), panelBox, bubb, view);

  // Southwest.
  check({
    label: 'layout-sw',
    x: 281,
    y: 55 + 10 - 2
  }, four, bounds(320, 55, 30, 10), panelBox, bubb, view);

  // Northeast.
  check({
    label: 'layout-ne',
    x: 140 - 1,
    y: 235 - 75 + 1
  }, four, bounds(140, 235, 10, 10), panelBox, bubb, view);

  // Northwest.
  check({
    label: 'layout-nw',
    x: 261,
    y: 235 - 75 + 1
  }, four, bounds(320, 235, 10, 10), panelBox, bubb, view);

  // All fit -> southeast because of order of preference.
  check({
    label: 'layout-se',
    x: 270 - 1,
    y: 100 + 10 - 2
  }, four, bounds(270, 100, 10, 10), panelBox, bubb, view);

  // None near top left -> best fit is southeast
  check({
    label: 'layout-se',
    x: 55 - 1,
    y: 55 + 10 - 2
  }, four, bounds(55, 55, 10, 10), bigPanel, bubb, view);

  // None near top right -> best fit is southwest
  check({
    label: 'layout-sw',
    x: 350 - 75 + 32 - 1 + 10,
    y: 55 + 10 - 2
  }, four, bounds(350, 55, 10, 10), bigPanel, bubb, view);

  // None near bottom left -> best fit is northeast
  check({
    label: 'layout-ne',
    x: 55 - 1,
    y: 50,
    candidateYforTest: 200 - 500 + 1
  }, four, bounds(55, 200, 10, 10), bigPanel, bubb, view);

  // None near bottom right -> best fit is northwest
  check({
    label: 'layout-nw',
    x: 350 - 75 + 32 - 1 + 10,
    y: 50,
    candidateYforTest: 200 - 500 + 1
  }, four, bounds(350, 200, 10, 10), bigPanel, bubb, view);

  // Southeast (1px short on x and y).
  check({
    label: 'layout-se',
    x: 350 + 50 + 1 - 101 - 1,
    y: 220 + 50 + 2 - 10 - 76 + 10 - 2
  }, four, bounds(350 + 50 + 1 - 101, 220 + 50 + 2 - 10 - 76, 10, 10), panelBox, bubb, view);

  // Southeast (exactly for x and y).
  check({
    label: 'layout-se',
    x: 350 + 50 + 1 - 100 - 1,
    y: 220 + 50 + 2 - 10 - 75 + 10 - 2
  }, four, bounds(350 + 50 + 1 - 100, 220 + 50 + 2 - 10 - 75, 10, 10), panelBox, bubb, view);

  // Southeast -> Southwest (1px too far on x).
  check({
    label: 'layout-sw',
    x: 350 + 50 + 1 - 99 - 100 + 32 + 10 - 1,
    y: 220 + 50 + 2 - 10 - 75 + 10 - 2
  }, four, bounds(350 + 50 + 1 - 99, 220 + 50 + 2 - 10 - 75, 10, 10), panelBox, bubb, view);

  // Southeast -> Northeast (1px too far on y).
  check({
    label: 'layout-ne',
    x: 350 + 50 + 1 - 100 - 1,
    y: 220 + 50 + 2 - 10 - 74 - 75 + 1
  }, four, bounds(350 + 50 + 1 - 100, 220 + 50 + 2 - 10 - 74, 10, 10), panelBox, bubb, view);

  // Southeast -> Northwest (1px too far on x and y).
  check({
    label: 'layout-nw',
    x: 350 + 50 + 1 - 99 - 100 + 32 + 10 - 1,
    y: 220 + 50 + 2 - 10 - 74 - 75 + 1
  }, four, bounds(350 + 50 + 1 - 99, 220 + 50 + 2 - 10 - 74, 10, 10), panelBox, bubb, view);
});
