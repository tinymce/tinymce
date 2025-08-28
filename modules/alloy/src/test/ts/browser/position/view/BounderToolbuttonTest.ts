import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarElement, SugarPosition } from '@ephox/sugar';
import { assert } from 'chai';

import { Bounds, bounds } from 'ephox/alloy/alien/Boxes';
import { Bubble, BubbleInstance } from 'ephox/alloy/positioning/layout/Bubble';
import * as Layout from 'ephox/alloy/positioning/layout/Layout';
import { AnchorBox, AnchorElement, AnchorLayout } from 'ephox/alloy/positioning/layout/LayoutTypes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

interface TestDecisionSpec {
  readonly layout: string;
  readonly x: number;
  readonly y: number;
  readonly candidateY?: number;
}

describe('BounderToolbuttonTest', () => {
  const check = (expected: TestDecisionSpec, preference: AnchorLayout[], anchor: AnchorBox, panel: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
    const placee = SugarElement.fromTag('div');
    const actual = Bounder.attempts(placee, preference, anchor, panel, bubbles, bounds);
    assert.equal(actual.layout, expected.layout, 'layout');
    assert.equal(actual.rect.x, expected.x, 'X');
    assert.equal(actual.rect.y, expected.y, 'Y');
    if (expected.candidateY !== undefined) {
      assert.equal(actual.testY, expected.candidateY, 'Candidate Y');
    }
  };

  // Layout is for boxes with a bubble pointing to a cursor position (vertically aligned to nearest side)
  // We use it for toolbar buttons, like naughty hobbitses, so this test will change (TBIO-2326) because right now it's insane.
  const bubble = (width: number): Bubble => {
    const northeast = (): BubbleInstance => ({
      offset: SugarPosition(-1, 1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const northwest = (): BubbleInstance => ({
      offset: SugarPosition(width - 1, 1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const southeast = (): BubbleInstance => ({
      offset: SugarPosition(-1, -2),
      classesOn: [ ],
      classesOff: [ ]
    });

    const southwest = (): BubbleInstance => ({
      offset: SugarPosition(width - 1, -2),
      classesOn: [ ],
      classesOff: [ ]
    });

    const south = (): BubbleInstance => ({
      offset: SugarPosition(-1, 1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const north = (): BubbleInstance => ({
      offset: SugarPosition(-1, 1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const east = (): BubbleInstance => ({
      offset: SugarPosition(-1, 1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const west = (): BubbleInstance => ({
      offset: SugarPosition(-1, 1),
      classesOn: [ ],
      classesOff: [ ]
    });

    const notImplemented = Fun.die('Not implemented');

    return {
      northwest,
      northeast,
      southwest,
      southeast,
      south,
      north,
      east,
      west,
      insetSouthwest: notImplemented,
      insetSoutheast: notImplemented,
      insetSouth: notImplemented,
      insetNorthwest: notImplemented,
      insetNortheast: notImplemented,
      insetNorth: notImplemented,
      insetWest: notImplemented,
      insetEast: notImplemented
    };
  };

  const four = [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest ];
  const two = [ Layout.east, Layout.west ];

  const panelBox = bounds(0, 0, 100, 75);
  const bigPanel = bounds(0, 0, 75, 500);
  const view = bounds(50, 50, 350, 220);
  const bubb = bubble(32);

  it('an empty input array is invalid and just returns anchor coordinates', () => {
    check({
      layout: 'none',
      x: 0,
      y: 0
    }, [], bounds(0, 0, 10, 10), bounds(0, 0, 50, 50), bubble(0), bounds(0, 0, 1000, 1000));

    check({
      layout: 'none',
      x: 100,
      y: 0
    }, [], bounds(100, 0, 200, 50), bounds(0, 0, 150, 25), bubble(10), bounds(0, 0, 1000, 1000));
  });

  /*
   * The expected values include the calculations that layout and bounder are doing
   */

  it('southeast', () => {
    const anchor = bounds(100, 55, 10, 10);
    check({
      layout: 'layout-southeast',
      x: anchor.x - 1,                            // 99
      y: anchor.bottom - 2                        // 63
    }, four, anchor, panelBox, bubb, view);
  });

  it('southwest', () => {
    const anchor = bounds(320, 55, 30, 10);
    check({
      layout: 'layout-southwest',
      x: anchor.right - panelBox.width + 31,      // 281
      y: anchor.bottom - 2                        // 63
    }, four, anchor, panelBox, bubb, view);
  });

  it('northeast', () => {
    const anchor = bounds(140, 235, 10, 10);
    check({
      layout: 'layout-northeast',
      x: anchor.x - 1,                            // 139
      y: anchor.y - panelBox.height + 1           // 161
    }, four, anchor, panelBox, bubb, view);
  });

  it('northwest', () => {
    const anchor = bounds(320, 235, 10, 10);
    check({
      layout: 'layout-northwest',
      x: anchor.right - panelBox.width + 31,      // 261
      y: anchor.y - panelBox.height + 1           // 161
    }, four, anchor, panelBox, bubb, view);
  });

  it('all fit -> southeast because of order of preference', () => {
    const anchor = bounds(270, 100, 10, 10);
    check({
      layout: 'layout-southeast',
      x: anchor.x - 1,                            // 269
      y: anchor.bottom - 2                        // 108
    }, four, anchor, panelBox, bubb, view);
  });

  it('none near top left -> best fit is southeast', () => {
    const anchor = bounds(55, 55, 10, 10);
    check({
      layout: 'layout-southeast',
      x: anchor.x - 1,                            // 54
      y: anchor.bottom - 2                        // 63
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none near top right -> best fit is southwest', () => {
    const anchor = bounds(350, 55, 10, 10);
    check({
      layout: 'layout-southwest',
      x: anchor.right - bigPanel.width + 31,      // 316
      y: anchor.bottom - 2                        // 63
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none near bottom left -> best fit is northeast', () => {
    const anchor = bounds(55, 200, 10, 10);
    check({
      layout: 'layout-northeast',
      x: anchor.x - 1,                            // 54
      y: view.y,                                  // 50 - constrained within viewport
      candidateY: anchor.y - bigPanel.height + 1, // -299
    }, four, anchor, bigPanel, bubb, view);
  });

  it('none near bottom right -> best fit is northwest', () => {
    const anchor = bounds(350, 200, 10, 10);
    check({
      layout: 'layout-northwest',
      x: anchor.right - bigPanel.width + 31,      // 316
      y: view.y,                                  // 50 - constrained within viewport
      candidateY: anchor.y - bigPanel.height + 1, // -299
    }, four, anchor, bigPanel, bubb, view);
  });

  it('southeast (1px short on x and y)', () => {
    // Note: The additional +1/+2 here is to account for the southeast bubble x/y offsets
    const anchor = bounds(view.right - panelBox.width + 1 - 1, view.bottom - panelBox.height - 10 + 2 - 1, 10, 10);
    check({
      layout: 'layout-southeast',
      x: anchor.x - 1,                            // 299
      y: anchor.bottom - 2,                       // 194
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast (exactly for x and y)', () => {
    // Note: The additional +1/+2 here is to account for the southeast bubble x/y offsets
    const anchor = bounds(view.right - panelBox.width + 1, view.bottom - panelBox.height - 10 + 2, 10, 10);
    check({
      layout: 'layout-southeast',
      x: anchor.x - 1,                            // 300
      y: anchor.bottom - 2,                       // 195
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> southwest (1px too far on x)', () => {
    // Note: The additional +1/+2 here is to account for the southeast bubble x/y offsets
    const anchor = bounds(view.right - panelBox.width + 1 + 1, view.bottom - panelBox.height - 10 + 2, 10, 10);
    check({
      layout: 'layout-southwest',
      x: anchor.right - panelBox.width + 31,      // 243
      y: anchor.bottom - 2,                       // 195
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> northeast (1px too far on y)', () => {
    // Note: The additional +1/+2 here is to account for the southeast bubble x/y offsets
    const anchor = bounds(view.right - panelBox.width + 1, view.bottom - panelBox.height - 10 + 2 + 1, 10, 10);
    check({
      layout: 'layout-northeast',
      x: anchor.x - 1,                            // 300
      y: anchor.y - panelBox.height + 1           // 114
    }, four, anchor, panelBox, bubb, view);
  });

  it('southeast -> northwest (1px too far on x and y)', () => {
    // Note: The additional +1/+2 here is to account for the southeast bubble x/y offsets
    const anchor = bounds(view.right - panelBox.width + 1 + 1, view.bottom - panelBox.height - 10 + 2 + 1, 10, 10);
    check({
      layout: 'layout-northwest',
      x: anchor.right - panelBox.width + 31,      // 243
      y: anchor.y - panelBox.height + 1           // 114
    }, four, anchor, panelBox, bubb, view);
  });

  it('east', () => {
    const anchor = bounds(55, 150, 10, 10);
    check({
      layout: 'layout-east',
      x: anchor.right - 1,                                          // 64
      y: anchor.y + (anchor.height / 2) - (panelBox.height / 2) + 1 // 118.5
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near bottom left -> best fit is east (limited to bottom bounds)', () => {
    const anchor = bounds(55, 240, 10, 10);
    check({
      layout: 'layout-east',
      x: anchor.right - 1,                        // 64
      y: view.bottom - panelBox.height            // 195 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near top left -> best fit is east (limited to top bounds)', () => {
    const anchor = bounds(55, 80, 10, 10);
    check({
      layout: 'layout-east',
      x: anchor.right - 1,                        // 64
      y: view.y,                                  // 50 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });

  it('west', () => {
    const anchor = bounds(350, 150, 10, 10);
    check({
      layout: 'layout-west',
      x: anchor.x - panelBox.width - 1,                             // 249
      y: anchor.y + (anchor.height / 2) - (panelBox.height / 2) + 1 // 118.5
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near bottom right -> best fit is west (limited to bottom bounds)', () => {
    const anchor = bounds(350, 240, 10, 10);
    check({
      layout: 'layout-west',
      x: anchor.x - panelBox.width - 1,           // 249
      y: view.bottom - panelBox.height            // 195 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });

  it('none near top right -> best fit is west (limited to top bounds)', () => {
    const anchor = bounds(350, 80, 10, 10);
    check({
      layout: 'layout-west',
      x: anchor.x - panelBox.width - 1,           // 249
      y: view.y,                                  // 50 - constrained within viewport
    }, two, anchor, panelBox, bubb, view);
  });
});
