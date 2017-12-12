import Bounds from 'ephox/alloy/positioning/layout/Bounds';
import Layout from 'ephox/alloy/positioning/layout/Layout';
import Bounder from 'ephox/alloy/positioning/view/Bounder';
import { Position } from '@ephox/sugar';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('BounderToolbuttonTest', function() {
  /* global assert */
  var check = function (expected, preference, anchor, panel, bubbles, bounds) {
    var actual = Bounder.attempts(preference, anchor, panel, bubbles, bounds);
    assert.eq(expected.label, actual.label());
    assert.eq(expected.x, actual.x());
    assert.eq(expected.y, actual.y());
    if (expected.candidateYforTest !== undefined) assert.eq(expected.candidateYforTest, actual.candidateYforTest());
  };

  // Layout is for boxes with a bubble pointing to a cursor position (vertically aligned to nearest side)
  // We use it for toolbar buttons, like naughty hobbitses, so this test will change (TBIO-2326) because right now it's insane.
  var chameleonBubble = function (width) {
    // no it's not a joke, this is a copy of ephox.chameleon.popup.Bubble
    var northeast = function () {
      return Position(-1, 1);
    };

    var northwest = function () {
      return Position(width - 1, 1);
    };

    var southeast = function () {
      return Position(-1, -2);
    };

    var southwest = function () {
      return Position(width - 1, -2);
    };

    return {
      northwest: northwest,
      northeast: northeast,
      southwest: southwest,
      southeast: southeast
    };
  };

  var four = [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest ];

  // empty input array is now invalid, just returns anchor coordinates
  check({
    label: 'none',
    x: 0,
    y: 0
  }, [], Bounds(0, 0, 10, 10), Bounds(0, 0, 50, 50), chameleonBubble(0, 0), Bounds(0, 0, 1000, 1000));

  check({
    label: 'none',
    x: 100,
    y: 0
  }, [], Bounds(100, 0, 200, 50), Bounds(0, 0, 150, 25), chameleonBubble(10, 0), Bounds(0, 0, 1000, 1000));

  var panelBox = Bounds(0, 0, 100, 75);
  var bigPanel = Bounds(0, 0, 75, 500);
  var view = Bounds(50, 50, 350, 220);
  var bubb = chameleonBubble(32);

  /*
   * The expected values include the calculations that layout and bounder are doing
   */

  // Southeast.
  check({
    label: 'layout-se',
    x: 100 - 1,
    y: 55 + 10 - 2
  }, four, Bounds(100, 55, 10, 10), panelBox, bubb, view);

  // Southwest.
  check({
    label: 'layout-sw',
    x: 350 - 100, // 320 - 100 + 32 - 1, capped at view width
    y: 55 + 10 - 2
  }, four, Bounds(320, 55, 30, 10), panelBox, bubb, view);

  // Northeast.
  check({
    label: 'layout-ne',
    x: 140 - 1,
    y: 235 - 75 + 1
  }, four, Bounds(140, 235, 10, 10), panelBox, bubb, view);

  // Northwest.
  check({
    label: 'layout-nw',
    x: 350 - 100, // 320 - 100 + 32 - 1, capped at view width
    y: 235 - 75 + 1
  }, four, Bounds(320, 235, 10, 10), panelBox, bubb, view);

  // All fit -> southeast because of order of preference.
  check({
    label: 'layout-se',
    x: 350 - 100, // 270 - 1, capped at view width
    y: 100 + 10 - 2
  }, four, Bounds(270, 100, 10, 10), panelBox, bubb, view);

  // None near top left -> best fit is southeast
  check({
    label: 'layout-se',
    x: 55 - 1,
    y: 55 + 10 - 2
  }, four, Bounds(55, 55, 10, 10), bigPanel, bubb, view);

  // None near top right -> best fit is southwest
  check({
    label: 'layout-sw',
    x: 350 - 75, // 350 - 75 + 32 - 1, capped at view width
    y: 55 + 10 - 2
  }, four, Bounds(350, 55, 10, 10), bigPanel, bubb, view);

  // None near bottom left -> best fit is northeast
  check({
    label: 'layout-ne',
    x: 55 - 1,
    y: 50,
    candidateYforTest: 200 - 500 + 1
  }, four, Bounds(55, 200, 10, 10), bigPanel, bubb, view);

  // None near bottom right -> best fit is northwest
  check({
    label: 'layout-nw',
    x: 350 - 75, // 350 - 75 + 32 - 1, capped at view width
    y: 50,
    candidateYforTest: 200 - 500 + 1
  }, four, Bounds(350, 200, 10, 10), bigPanel, bubb, view);

  // Southeast (1px short on x and y).
  check({
    label: 'layout-se',
    x: 350 - 100, // 350+50+1-101 - 1,
    y: 220 + 50 + 2 - 10 - 76 + 10 - 2
  }, four, Bounds(350 + 50 + 1 - 101, 220 + 50 + 2 - 10 - 76, 10, 10), panelBox, bubb, view);

  // Southeast (exactly for x and y).
  check({
    label: 'layout-se',
    x: 350 - 100, // 350+50+1-100 - 1, capped at view width
    y: 220 + 50 + 2 - 10 - 75 + 10 - 2
  }, four, Bounds(350 + 50 + 1 - 100, 220 + 50 + 2 - 10 - 75, 10, 10), panelBox, bubb, view);

  // Southeast -> Southwest (1px too far on x).
  check({
    label: 'layout-sw',
    x: 350 + 50 + 1 - 99 - 100 + 32 + 10 - 1,
    y: 220 + 50 + 2 - 10 - 75 + 10 - 2
  }, four, Bounds(350 + 50 + 1 - 99, 220 + 50 + 2 - 10 - 75, 10, 10), panelBox, bubb, view);

  // Southeast -> Northeast (1px too far on y).
  check({
    label: 'layout-ne',
    x: 350 - 100, // 350+50+1-100 - 1, capped at view width
    y: 220 + 50 + 2 - 10 - 74 - 75 + 1
  }, four, Bounds(350 + 50 + 1 - 100, 220 + 50 + 2 - 10 - 74, 10, 10), panelBox, bubb, view);

  // Southeast -> Northwest (1px too far on x and y).
  check({
    label: 'layout-nw',
    x: 350 + 50 + 1 - 99 - 100 + 32 + 10 - 1,
    y: 220 + 50 + 2 - 10 - 74 - 75 + 1
  }, four, Bounds(350 + 50 + 1 - 99, 220 + 50 + 2 - 10 - 74, 10, 10), panelBox, bubb, view);
});

